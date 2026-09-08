/**
 * authRoutes.js — One-click OAuth connect for Facebook & LinkedIn
 *
 * Facebook flow:  /auth/facebook  →  FB dialog  →  /auth/facebook/callback
 *   • Exchanges code for short-lived token → long-lived token (60 days)
 *   • Calls /me/accounts to get never-expiring Page Access Token
 *   • Fetches Instagram Business Account ID automatically
 *   • Saves everything to the social_accounts table
 *
 * LinkedIn flow:  /auth/linkedin  →  LI dialog  →  /auth/linkedin/callback
 *   • Exchanges code for access token + fetches Person URN
 *   • Saves to social_accounts table
 */

const express = require('express');
const axios   = require('axios');
const crypto  = require('crypto');
const { db }  = require('../config/database');

const router = express.Router();

// In-memory CSRF state store (cleared after use or 10-minute expiry)
const oauthStates = new Map();

// ─── Render env-var persistence ───────────────────────────────────────────────
// Automatically saves tokens to Render environment variables after each OAuth
// connect, so they survive redeploys even on the free tier (no persistent disk).
// Requires RENDER_API_KEY + RENDER_SERVICE_ID in your Render env vars.

async function syncToRender(updates) {
  const apiKey    = process.env.RENDER_API_KEY;
  const serviceId = process.env.RENDER_SERVICE_ID;
  if (!apiKey || !serviceId) return; // Not configured — skip silently

  try {
    const base = `https://api.render.com/v1/services/${serviceId}/env-vars`;
    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

    // Fetch current env vars to avoid wiping anything
    const existing = await axios.get(base, { headers });
    const current = (existing.data || []).map(e => ({ key: e.envVar?.key || e.key, value: e.envVar?.value || e.value }));

    // Merge: replace matching keys, keep everything else
    const merged = [...current];
    for (const [key, value] of Object.entries(updates)) {
      const idx = merged.findIndex(e => e.key === key);
      if (idx >= 0) merged[idx] = { key, value };
      else merged.push({ key, value });
    }

    await axios.put(base, merged, { headers });
    console.log('[Auth] Synced tokens to Render env vars:', Object.keys(updates).join(', '));
  } catch (err) {
    // Non-fatal — DB already has the token, env sync is a bonus
    console.warn('[Auth] Could not sync to Render env vars:', err.response?.data?.message || err.message);
  }
}

function makeState() {
  const s = crypto.randomBytes(20).toString('hex');
  oauthStates.set(s, Date.now());
  // Prune stale states older than 10 minutes
  for (const [k, t] of oauthStates) {
    if (Date.now() - t > 10 * 60 * 1000) oauthStates.delete(k);
  }
  return s;
}

function checkState(s) {
  const t = oauthStates.get(s);
  if (!t || Date.now() - t > 10 * 60 * 1000) return false;
  oauthStates.delete(s);
  return true;
}

// ─── DB helper ────────────────────────────────────────────────────────────────

function upsertAccount(platform, { accessToken, accountId, displayName, extra }) {
  const id = `${platform}-oauth`;
  db.prepare(`
    INSERT INTO social_accounts (id, platform, display_name, access_token, account_id, extra, is_active, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    ON CONFLICT(platform) DO UPDATE SET
      display_name = excluded.display_name,
      access_token = excluded.access_token,
      account_id   = excluded.account_id,
      extra        = excluded.extra,
      is_active    = 1,
      updated_at   = datetime('now')
  `).run(id, platform, displayName || null, accessToken || null, accountId || null,
         extra ? JSON.stringify(extra) : null);
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

router.get('/facebook', (req, res) => {
  const appId = process.env.FACEBOOK_APP_ID;
  if (!appId) return res.send(errorPage(
    'FACEBOOK_APP_ID not set',
    'Add <code>FACEBOOK_APP_ID=your_app_id</code> to your <code>.env</code> file and restart the server.'
  ));

  const state    = makeState();
  const redirect = `${process.env.APP_URL}/auth/facebook/callback`;
  const scopes   = [
    'pages_manage_posts',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_content_publish',
  ].join(',');

  const url = `https://www.facebook.com/v21.0/dialog/oauth`
    + `?client_id=${appId}`
    + `&redirect_uri=${encodeURIComponent(redirect)}`
    + `&scope=${scopes}`
    + `&state=${state}`;

  res.redirect(url);
});

router.get('/facebook/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) return res.send(errorPage('Facebook denied access', error_description || error));
  if (!checkState(state)) return res.send(errorPage('Session expired', 'Please go back and try connecting again.'));
  if (!code) return res.send(errorPage('No code received', 'Facebook did not return an authorization code.'));

  const appId     = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirect  = `${process.env.APP_URL}/auth/facebook/callback`;

  if (!appSecret) return res.send(errorPage(
    'FACEBOOK_APP_SECRET not set',
    'Add <code>FACEBOOK_APP_SECRET=your_app_secret</code> to your <code>.env</code> file.'
  ));

  try {
    // Step 1: Short-lived user token
    const shortRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: { client_id: appId, client_secret: appSecret, redirect_uri: redirect, code },
    });
    const shortToken = shortRes.data.access_token;

    // Step 2: Long-lived user token (60-day)
    const longRes = await axios.get('https://graph.facebook.com/v21.0/oauth/access_token', {
      params: { grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: shortToken },
    });
    const longToken = longRes.data.access_token;

    // Step 3: Get page token — never expires when derived from a long-lived user token
    // Try the specific page ID from .env first (avoids pages_show_list permission requirement),
    // then fall back to listing all pages the user manages.
    let pages = [];

    const specificPageId = process.env.FACEBOOK_PAGE_ID;
    if (specificPageId) {
      try {
        const pageRes = await axios.get(`https://graph.facebook.com/v21.0/${specificPageId}`, {
          params: { fields: 'id,name,access_token', access_token: longToken },
        });
        if (pageRes.data?.access_token) pages = [pageRes.data];
      } catch (_) { /* fall through to /me/accounts */ }
    }

    if (pages.length === 0) {
      const pagesRes = await axios.get('https://graph.facebook.com/v21.0/me/accounts', {
        params: { access_token: longToken, fields: 'id,name,access_token' },
      });
      pages = pagesRes.data.data || [];
    }

    if (pages.length === 0) {
      return res.send(errorPage(
        'No Facebook Pages found',
        'Make sure your Facebook account is an admin of the AgroMarket Facebook Page, then try again. '
        + 'Also check that <code>FACEBOOK_PAGE_ID</code> is set correctly in your <code>.env</code> file.'
      ));
    }

    if (pages.length === 1) {
      await saveFacebookPage(pages[0]);
      return res.send(successPage('Facebook connected!', pages[0].name, '📘'));
    }

    // Multiple pages — let user pick
    return res.send(pagePickerPage(pages));

  } catch (err) {
    const msg = err.response?.data?.error?.message || err.message;
    return res.send(errorPage('Facebook OAuth failed', msg));
  }
});

// User selects a page from the picker
router.get('/facebook/select', async (req, res) => {
  const { id, name, token } = req.query;
  if (!id || !token) return res.send(errorPage('Missing parameters', 'Please try connecting again.'));
  try {
    const page = { id, name, access_token: token };
    await saveFacebookPage(page);
    res.send(successPage('Facebook connected!', name, '📘'));
  } catch (err) {
    res.send(errorPage('Could not save page', err.message));
  }
});

async function saveFacebookPage(page) {
  // Try to find linked Instagram Business Account
  let igAccountId = null;
  try {
    const igRes = await axios.get(`https://graph.facebook.com/v21.0/${page.id}`, {
      params: { fields: 'instagram_business_account', access_token: page.access_token },
    });
    igAccountId = igRes.data.instagram_business_account?.id || null;
  } catch (_) { /* Instagram not linked — that's OK */ }

  // Save Facebook account
  upsertAccount('facebook', {
    accessToken:  page.access_token,
    accountId:    page.id,
    displayName:  page.name,
    extra:        { instagramAccountId: igAccountId },
  });

  // Persist to Render env vars so the token survives redeploys
  const renderUpdates = {
    FACEBOOK_PAGE_ACCESS_TOKEN: page.access_token,
    FACEBOOK_PAGE_ID:           page.id,
  };
  if (igAccountId) renderUpdates.INSTAGRAM_ACCOUNT_ID = igAccountId;
  await syncToRender(renderUpdates);

  // Save Instagram account using the same page token (if linked)
  if (igAccountId) {
    upsertAccount('instagram', {
      accessToken:  page.access_token,   // Instagram Graph API uses the FB page token
      accountId:    igAccountId,
      displayName:  `Connected via ${page.name}`,
      extra:        { facebookPageId: page.id },
    });
  }
}

// ─── LinkedIn ──────────────────────────────────────────────────────────────────

router.get('/linkedin', (req, res) => {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) return res.send(errorPage(
    'LINKEDIN_CLIENT_ID not set',
    'Add <code>LINKEDIN_CLIENT_ID=your_client_id</code> to your <code>.env</code> file and restart.'
  ));

  const state    = makeState();
  const redirect = `${process.env.APP_URL}/auth/linkedin/callback`;
  const scopes   = 'w_member_social openid profile';

  const url = `https://www.linkedin.com/oauth/v2/authorization`
    + `?response_type=code`
    + `&client_id=${clientId}`
    + `&redirect_uri=${encodeURIComponent(redirect)}`
    + `&scope=${encodeURIComponent(scopes)}`
    + `&state=${state}`;

  res.redirect(url);
});

router.get('/linkedin/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) return res.send(errorPage('LinkedIn denied access', error_description || error));
  if (!checkState(state)) return res.send(errorPage('Session expired', 'Please go back and try connecting again.'));
  if (!code) return res.send(errorPage('No code received', 'LinkedIn did not return an authorization code.'));

  const clientId     = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirect     = `${process.env.APP_URL}/auth/linkedin/callback`;

  if (!clientSecret) return res.send(errorPage(
    'LINKEDIN_CLIENT_SECRET not set',
    'Add <code>LINKEDIN_CLIENT_SECRET=your_client_secret</code> to your <code>.env</code> file.'
  ));

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect, client_id: clientId, client_secret: clientSecret }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const { access_token, expires_in } = tokenRes.data;
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // Get profile via OpenID Connect userinfo endpoint (replaces deprecated /v2/me)
    const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const personId  = profileRes.data.sub;   // OpenID Connect subject = LinkedIn member ID
    const fullName  = profileRes.data.name || `${profileRes.data.given_name || ''} ${profileRes.data.family_name || ''}`.trim();
    const personUrn = `urn:li:person:${personId}`;

    upsertAccount('linkedin', {
      accessToken:  access_token,
      accountId:    personUrn,
      displayName:  fullName,
      extra:        { expiresAt, personUrn },
    });

    // Persist to Render env vars so the token survives redeploys
    await syncToRender({
      LINKEDIN_ACCESS_TOKEN: access_token,
      LINKEDIN_PERSON_URN:   personUrn,
    });

    res.send(successPage('LinkedIn connected!', fullName, '💼'));

  } catch (err) {
    const msg = err.response?.data?.error_description
              || err.response?.data?.message
              || err.message;
    res.send(errorPage('LinkedIn OAuth failed', msg));
  }
});

// ─── TikTok ───────────────────────────────────────────────────────────────────

router.get('/tiktok', (req, res) => {
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  if (!clientKey) return res.send(errorPage(
    'TIKTOK_CLIENT_KEY not set',
    'Add <code>TIKTOK_CLIENT_KEY=your_client_key</code> to your <code>.env</code> file and restart.<br><br>'
    + 'Get it from <a href="https://developers.tiktok.com" target="_blank">developers.tiktok.com</a> → your app → App details.'
  ));

  const state    = makeState();
  const redirect = `${process.env.APP_URL}/auth/tiktok/callback`;
  const scopes   = 'user.info.basic,video.publish,video.upload';

  const url = `https://www.tiktok.com/v2/auth/authorize/`
    + `?client_key=${encodeURIComponent(clientKey)}`
    + `&response_type=code`
    + `&scope=${encodeURIComponent(scopes)}`
    + `&redirect_uri=${encodeURIComponent(redirect)}`
    + `&state=${state}`;

  res.redirect(url);
});

router.get('/tiktok/callback', async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) return res.send(errorPage('TikTok denied access', error_description || error));
  if (!checkState(state)) return res.send(errorPage('Session expired', 'Please go back and try connecting again.'));
  if (!code) return res.send(errorPage('No code received', 'TikTok did not return an authorization code.'));

  const clientKey    = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirect     = `${process.env.APP_URL}/auth/tiktok/callback`;

  if (!clientSecret) return res.send(errorPage(
    'TIKTOK_CLIENT_SECRET not set',
    'Add <code>TIKTOK_CLIENT_SECRET=your_client_secret</code> to your <code>.env</code> file.'
  ));

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      'https://open.tiktokapis.com/v2/oauth/token/',
      new URLSearchParams({
        client_key:    clientKey,
        client_secret: clientSecret,
        code,
        grant_type:    'authorization_code',
        redirect_uri:  redirect,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, open_id, expires_in, scope } = tokenRes.data;
    if (!access_token) throw new Error('No access token in TikTok response');

    const expiresAt = new Date(Date.now() + (expires_in || 86400) * 1000).toISOString();

    upsertAccount('tiktok', {
      accessToken:  access_token,
      accountId:    open_id,
      displayName:  `TikTok User (${open_id})`,
      extra:        { openId: open_id, expiresAt, scope },
    });

    // Persist to Render env vars so the token survives redeploys
    await syncToRender({
      TIKTOK_ACCESS_TOKEN: access_token,
      TIKTOK_OPEN_ID:      open_id,
    });

    res.send(successPage('TikTok connected!', `Open ID: ${open_id}`, '🎵'));

  } catch (err) {
    const msg = err.response?.data?.message || err.response?.data?.error_description || err.message;
    res.send(errorPage('TikTok OAuth failed', msg));
  }
});

// ─── Token export (secured with CRON_SECRET — save tokens to Render env vars) ─

router.get('/export-tokens', (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.query.secret !== secret) {
    return res.status(401).json({ error: 'Unauthorized. Use ?secret=YOUR_CRON_SECRET' });
  }

  const rows = db.prepare(`
    SELECT platform, access_token, account_id, display_name, extra
    FROM social_accounts WHERE is_active = 1
  `).all();

  const envVars = {};
  for (const row of rows) {
    const extra = row.extra ? JSON.parse(row.extra) : {};
    switch (row.platform) {
      case 'facebook':
        envVars.FACEBOOK_PAGE_ACCESS_TOKEN = row.access_token;
        envVars.FACEBOOK_PAGE_ID = row.account_id;
        if (extra.instagramAccountId) {
          envVars.INSTAGRAM_ACCOUNT_ID = extra.instagramAccountId;
        }
        break;
      case 'instagram':
        envVars.INSTAGRAM_ACCOUNT_ID = row.account_id;
        // Instagram uses the Facebook Page token
        break;
      case 'linkedin':
        envVars.LINKEDIN_ACCESS_TOKEN = row.access_token;
        envVars.LINKEDIN_PERSON_URN = row.account_id;
        if (extra.expiresAt) envVars.LINKEDIN_TOKEN_EXPIRES = extra.expiresAt;
        break;
      case 'tiktok':
        envVars.TIKTOK_ACCESS_TOKEN = row.access_token;
        break;
    }
  }

  res.json({
    ok: true,
    message: 'Copy these values to your Render Environment Variables to persist across redeploys',
    envVars,
  });
});

// ─── Status endpoint (used by settings page to check DB connections) ──────────

router.get('/status', (req, res) => {
  const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'];
  const status = {};
  for (const p of platforms) {
    const row = db.prepare('SELECT display_name, account_id, extra, updated_at FROM social_accounts WHERE platform = ? AND is_active = 1').get(p);
    if (row) {
      const extra = row.extra ? JSON.parse(row.extra) : {};
      status[p] = {
        connected: true,
        displayName: row.displayName || row.display_name,
        accountId: row.account_id,
        updatedAt: row.updated_at,
        ...(p === 'facebook' && { instagramLinked: !!extra.instagramAccountId }),
        ...(p === 'linkedin' && { expiresAt: extra.expiresAt }),
      };
    } else {
      status[p] = { connected: false };
    }
  }
  res.json({ ok: true, status });
});

// ─── Disconnect ───────────────────────────────────────────────────────────────

router.delete('/:platform', (req, res) => {
  const { platform } = req.params;
  db.prepare(`UPDATE social_accounts SET is_active = 0 WHERE platform = ?`).run(platform);
  // If disconnecting facebook, also disconnect instagram (same token)
  if (platform === 'facebook') {
    db.prepare(`UPDATE social_accounts SET is_active = 0 WHERE platform = 'instagram'`).run();
  }
  res.json({ ok: true });
});

// ─── HTML helpers ─────────────────────────────────────────────────────────────

const baseStyle = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; background: #f3f4f6; padding: 20px; }
    .card { background: white; border-radius: 20px; padding: 48px 40px;
            text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.10);
            max-width: 480px; width: 100%; }
    .icon  { font-size: 52px; margin-bottom: 20px; }
    h1     { font-size: 24px; font-weight: 700; margin-bottom: 10px; }
    p      { color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
    p code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px;
             font-size: 13px; color: #374151; }
    .btn   { display: inline-block; padding: 13px 28px; border-radius: 10px;
             font-size: 15px; font-weight: 600; text-decoration: none;
             cursor: pointer; border: none; }
    .btn-primary { background: #166534; color: white; }
    .btn-danger  { background: #991b1b; color: white; }
    .page-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .page-item { display: block; background: #eff6ff; border: 2px solid #bfdbfe;
                 border-radius: 12px; padding: 14px 18px; text-decoration: none;
                 color: #1e3a8a; text-align: left; transition: all 0.15s; }
    .page-item:hover { background: #dbeafe; border-color: #60a5fa; }
    .page-item strong { display: block; font-size: 15px; }
    .page-item small  { color: #6b7280; font-size: 12px; }
  </style>`;

function successPage(title, detail, icon = '✅') {
  return `<!DOCTYPE html><html><head><title>${title}</title>${baseStyle}</head><body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1 style="color:#166534">${title}</h1>
    <p>${escHtml(detail)}</p>
    <a href="/settings.html" class="btn btn-primary">← Back to Settings</a>
  </div></body></html>`;
}

function errorPage(title, detail = '') {
  return `<!DOCTYPE html><html><head><title>Error</title>${baseStyle}</head><body>
  <div class="card">
    <div class="icon">❌</div>
    <h1 style="color:#991b1b">${escHtml(title)}</h1>
    <p>${detail}</p>
    <a href="/settings.html" class="btn btn-danger">← Back to Settings</a>
  </div></body></html>`;
}

function pagePickerPage(pages) {
  const items = pages.map(p => `
    <a class="page-item" href="/auth/facebook/select?id=${encodeURIComponent(p.id)}&name=${encodeURIComponent(p.name)}&token=${encodeURIComponent(p.access_token)}">
      <strong>${escHtml(p.name)}</strong>
      <small>Page ID: ${escHtml(p.id)}</small>
    </a>`).join('');

  return `<!DOCTYPE html><html><head><title>Select a Page</title>${baseStyle}</head><body>
  <div class="card">
    <div class="icon">📄</div>
    <h1 style="color:#1e3a8a">Select Your Facebook Page</h1>
    <p>Which page should AgroMarket post to?</p>
    <div class="page-list">${items}</div>
    <a href="/settings.html" class="btn" style="background:#f3f4f6;color:#374151">Cancel</a>
  </div></body></html>`;
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = router;
