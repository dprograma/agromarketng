const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];

// ─── GET /api/settings/accounts — List all configured accounts ────────────────

router.get('/accounts', (req, res) => {
  const accounts = db.prepare('SELECT id, platform, display_name, account_id, is_active, updated_at FROM social_accounts').all();

  // Fill in missing platforms as unconfigured
  const result = PLATFORMS.map(platform => {
    const found = accounts.find(a => a.platform === platform);
    return found || { platform, display_name: null, account_id: null, is_active: 0, configured: false };
  });

  res.json({ ok: true, accounts: result });
});

// ─── PUT /api/settings/accounts/:platform — Save/update account credentials ───

router.put('/accounts/:platform', (req, res) => {
  const { platform } = req.params;
  if (!PLATFORMS.includes(platform)) {
    return res.status(400).json({ ok: false, error: 'Unknown platform' });
  }

  const { display_name, access_token, token_secret, account_id, extra, is_active } = req.body;

  const existing = db.prepare('SELECT id FROM social_accounts WHERE platform = ?').get(platform);

  if (existing) {
    const updates = [];
    const values = [];

    if (display_name !== undefined) { updates.push('display_name = ?'); values.push(display_name); }
    if (access_token !== undefined) { updates.push('access_token = ?'); values.push(access_token); }
    if (token_secret !== undefined) { updates.push('token_secret = ?'); values.push(token_secret); }
    if (account_id !== undefined) { updates.push('account_id = ?'); values.push(account_id); }
    if (extra !== undefined) { updates.push('extra = ?'); values.push(typeof extra === 'object' ? JSON.stringify(extra) : extra); }
    if (is_active !== undefined) { updates.push('is_active = ?'); values.push(is_active ? 1 : 0); }
    updates.push("updated_at = datetime('now')");

    values.push(platform);
    db.prepare(`UPDATE social_accounts SET ${updates.join(', ')} WHERE platform = ?`).run(...values);
  } else {
    db.prepare(`
      INSERT INTO social_accounts (id, platform, display_name, access_token, token_secret, account_id, extra, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      platform,
      display_name || null,
      access_token || null,
      token_secret || null,
      account_id || null,
      extra ? (typeof extra === 'object' ? JSON.stringify(extra) : extra) : null,
      is_active !== false ? 1 : 0
    );
  }

  res.json({ ok: true, message: `${platform} account saved` });
});

// ─── DELETE /api/settings/accounts/:platform — Remove account ────────────────

router.delete('/accounts/:platform', (req, res) => {
  const { platform } = req.params;
  db.prepare('DELETE FROM social_accounts WHERE platform = ?').run(platform);
  res.json({ ok: true, message: `${platform} account removed` });
});

// ─── GET /api/settings/status — Health check of all credentials ───────────────

function dbAccount(platform) {
  return db.prepare(`SELECT access_token FROM social_accounts WHERE platform = ? AND is_active = 1`).get(platform);
}

router.get('/status', (req, res) => {
  const status = {
    gemini: !!process.env.GEMINI_API_KEY,
    unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
    pexels: !!process.env.PEXELS_API_KEY,
    email: !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.APPROVAL_EMAIL),
    facebook: !!(dbAccount('facebook') || (process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN)),
    instagram: !!(dbAccount('instagram') || process.env.INSTAGRAM_ACCOUNT_ID),
    twitter: !!(dbAccount('twitter') || (process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN)),
    linkedin: !!(dbAccount('linkedin') || process.env.LINKEDIN_ACCESS_TOKEN),
    tiktok: !!(dbAccount('tiktok') || process.env.TIKTOK_ACCESS_TOKEN),
    siteConfig: !!(process.env.SITE_NAME && process.env.SITE_CONCEPT),
  };
  res.json({ ok: true, status });
});

module.exports = router;
