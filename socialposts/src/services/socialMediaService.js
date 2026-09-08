const axios = require('axios');
const fs    = require('fs');
const FormData = require('form-data');
const { db } = require('../config/database');
const { createSlideshowVideo, cleanupVideo } = require('./videoService');

// ─── Token resolver — DB first, then .env fallback ────────────────────────────

function getAccount(platform) {
  const row = db.prepare(
    `SELECT access_token, token_secret, account_id, extra
     FROM social_accounts WHERE platform = ? AND is_active = 1`
  ).get(platform);
  if (!row) return null;
  return {
    accessToken: row.access_token,
    tokenSecret: row.token_secret,
    accountId:   row.account_id,
    extra:       row.extra ? JSON.parse(row.extra) : {},
  };
}

/**
 * Post to all approved platforms in a batch.
 * Returns array of { platform, status, postId, error }
 */
async function publishBatch(posts) {
  const results = [];
  for (const post of posts) {
    if (post.status !== 'approved') continue;
    const content = post.edited_content || post.content;
    const result  = await publishToPlatform(post.platform, content, post.image_url);
    results.push({ ...result, platform: post.platform });

    db.prepare(`
      UPDATE posts
      SET status = ?, posted_at = datetime('now'), post_id = ?, error = ?
      WHERE id = ?
    `).run(result.status, result.postId || null, result.error || null, post.id);
  }
  return results;
}

/**
 * Retry a single previously-failed or pending post.
 */
async function retryPost(postId) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) throw new Error('Post not found');
  if (!['failed', 'pending', 'approved'].includes(post.status)) {
    throw new Error(`Cannot retry a post with status: ${post.status}`);
  }
  const content = post.edited_content || post.content;
  const result  = await publishToPlatform(post.platform, content, post.image_url);

  db.prepare(`
    UPDATE posts
    SET status = ?, posted_at = datetime('now'), post_id = ?, error = ?
    WHERE id = ?
  `).run(result.status, result.postId || null, result.error || null, postId);

  return { ...result, platform: post.platform };
}

async function publishToPlatform(platform, content, imageUrl) {
  try {
    let postId;
    switch (platform) {
      case 'facebook':  postId = await postToFacebook(content, imageUrl);  break;
      case 'twitter':   postId = await postToTwitter(content, imageUrl);   break;
      case 'instagram': postId = await postToInstagram(content, imageUrl); break;
      case 'linkedin':  postId = await postToLinkedIn(content, imageUrl);  break;
      case 'tiktok':    postId = await postToTikTok(content, imageUrl);    break;
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
    console.log(`[Social] ✅ Posted to ${platform}: ${postId}`);
    return { status: 'posted', postId };
  } catch (err) {
    // Log full API error body so we can see the real reason (not just HTTP status)
    const apiError = err.response?.data?.error || err.response?.data || null;
    const msg = apiError ? `${err.message} — API: ${JSON.stringify(apiError)}` : err.message;
    console.error(`[Social] ❌ Failed [${platform}]:`, msg);
    return { status: 'failed', error: msg };
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

async function postToFacebook(content, imageUrl) {
  const acc    = getAccount('facebook');
  const pageId = acc?.accountId    || process.env.FACEBOOK_PAGE_ID;
  const token  = acc?.accessToken  || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new Error('Facebook not connected — click Connect in Settings');

  if (imageUrl) {
    console.log(`[Facebook] 📷 Downloading image: ${imageUrl.substring(0, 100)}…`);
    // Download image ourselves and upload as binary — more reliable than passing URL
    const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    const imgBuffer = Buffer.from(imgRes.data);
    const contentType = imgRes.headers['content-type'] || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';

    const form = new FormData();
    form.append('source', imgBuffer, { filename: `post.${ext}`, contentType });
    form.append('caption', content);
    form.append('access_token', token);

    const res = await axios.post(
      `https://graph.facebook.com/v21.0/${pageId}/photos`,
      form,
      { headers: form.getHeaders(), timeout: 30000 }
    );
    return res.data.post_id || res.data.id;
  }
  const res = await axios.post(
    `https://graph.facebook.com/v21.0/${pageId}/feed`,
    { message: content, access_token: token }
  );
  return res.data.id;
}

// ─── Twitter / X ──────────────────────────────────────────────────────────────

async function postToTwitter(content, imageUrl) {
  const apiKey      = process.env.TWITTER_API_KEY;
  const apiSecret   = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret= process.env.TWITTER_ACCESS_SECRET;
  if (!apiKey || apiKey === 'your_api_key' || !accessToken || accessToken === 'your_access_token')
    throw new Error('Twitter credentials not configured — skipping');

  let mediaId;
  if (imageUrl) {
    try { mediaId = await uploadTwitterMedia(imageUrl, apiKey, apiSecret, accessToken, accessSecret); }
    catch (e) { console.warn('[Twitter] Media upload skipped:', e.message); }
  }

  const oauthHeader = buildTwitterOAuth(
    'POST', 'https://api.twitter.com/2/tweets',
    {}, apiKey, apiSecret, accessToken, accessSecret
  );
  const body = { text: content };
  if (mediaId) body.media = { media_ids: [mediaId] };

  const res = await axios.post('https://api.twitter.com/2/tweets', body, {
    headers: { Authorization: oauthHeader, 'Content-Type': 'application/json' },
  });
  return res.data.data.id;
}

async function uploadTwitterMedia(imageUrl, apiKey, apiSecret, accessToken, accessSecret) {
  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
  const base64 = Buffer.from(imgRes.data).toString('base64');
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  const oauthHeader = buildTwitterOAuth('POST', uploadUrl, {}, apiKey, apiSecret, accessToken, accessSecret);

  const form = new FormData();
  form.append('media_data', base64);

  const res = await axios.post(uploadUrl, form, {
    headers: { ...form.getHeaders(), Authorization: oauthHeader },
  });
  return res.data.media_id_string;
}

function buildTwitterOAuth(method, url, extraParams, apiKey, apiSecret, accessToken, accessSecret) {
  const crypto    = require('crypto');
  const nonce     = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const params = {
    oauth_consumer_key:     apiKey,
    oauth_nonce:            nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        timestamp,
    oauth_token:            accessToken,
    oauth_version:          '1.0',
    ...extraParams,
  };

  const sortedStr = Object.keys(params).sort()
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  const base       = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sortedStr)].join('&');
  const signingKey = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(accessSecret)}`;
  params.oauth_signature = crypto.createHmac('sha1', signingKey).update(base).digest('base64');

  const headerStr = Object.keys(params).filter(k => k.startsWith('oauth_')).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(params[k])}"`)
    .join(', ');
  return `OAuth ${headerStr}`;
}

// ─── Instagram ────────────────────────────────────────────────────────────────

async function postToInstagram(caption, imageUrl) {
  const acc       = getAccount('instagram');
  const fbAcc     = getAccount('facebook');
  const accountId = acc?.accountId   || process.env.INSTAGRAM_ACCOUNT_ID;
  const token     = acc?.accessToken || fbAcc?.accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!accountId || !token) throw new Error('Instagram not connected — connect Facebook first in Settings');
  if (!imageUrl) throw new Error('Instagram requires an image URL');

  const createRes = await axios.post(
    `https://graph.facebook.com/v21.0/${accountId}/media`,
    { image_url: imageUrl, caption, access_token: token }
  );
  const containerId = createRes.data.id;

  // Poll for readiness (max ~10 s)
  for (let i = 0; i < 5; i++) {
    await sleep(2000);
    const sRes = await axios.get(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`
    );
    if (sRes.data.status_code === 'FINISHED') break;
    if (sRes.data.status_code === 'ERROR') throw new Error('Instagram media container failed to process');
  }

  const pubRes = await axios.post(
    `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
    { creation_id: containerId, access_token: token }
  );
  return pubRes.data.id;
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

async function postToLinkedIn(content, imageUrl) {
  const acc       = getAccount('linkedin');
  const token     = acc?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = acc?.accountId   || process.env.LINKEDIN_ORG_URN || process.env.LINKEDIN_PERSON_URN;
  if (!token || !authorUrn) throw new Error('LinkedIn not connected — click Connect in Settings');

  let mediaAsset;
  if (imageUrl) {
    try { mediaAsset = await uploadLinkedInImage(imageUrl, token, authorUrn); }
    catch (e) { console.warn('[LinkedIn] Image upload skipped:', e.message); }
  }

  const body = {
    author:           authorUrn,
    lifecycleState:   'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary:     { text: content },
        shareMediaCategory:  mediaAsset ? 'IMAGE' : 'NONE',
        ...(mediaAsset && {
          media: [{
            status:      'READY',
            description: { text: content.substring(0, 100) },
            media:       mediaAsset,
            title:       { text: process.env.SITE_NAME || 'AgroMarket' },
          }],
        }),
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });
  return res.headers['x-restli-id'] || res.data.id;
}

async function uploadLinkedInImage(imageUrl, token, authorUrn) {
  const regRes = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner:   authorUrn,
        serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  const uploadUrl = regRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset     = regRes.data.value.asset;

  const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
  await axios.put(uploadUrl, imgRes.data, {
    headers: {
      Authorization:  `Bearer ${token}`,
      'Content-Type': imgRes.headers['content-type'] || 'image/jpeg',
    },
  });
  return asset;
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function postToTikTok(content, imageUrl) {
  const acc    = getAccount('tiktok');
  const token  = acc?.accessToken || process.env.TIKTOK_ACCESS_TOKEN;
  if (!token || token === 'your_tiktok_access_token')
    throw new Error('TikTok not connected — click Connect in Settings');

  // Generate a slideshow video from the image (TikTok requires video)
  // Use the same image 3 times — Ken Burns zoom/pan will make each slide look different
  if (!imageUrl) throw new Error('TikTok requires an image to generate video from');
  const imageUrls = [imageUrl, imageUrl, imageUrl];

  let videoPath;
  try {
    console.log('[TikTok] 🎬 Generating slideshow video…');
    videoPath = await createSlideshowVideo(imageUrls, content);
  } catch (e) {
    throw new Error(`TikTok video generation failed: ${e.message}`);
  }

  try {
    const videoBuffer = fs.readFileSync(videoPath);
    const videoSize   = fs.statSync(videoPath).size;

    // Step 1: Initialize upload
    const initRes = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title:           content.substring(0, 150),
          privacy_level:   'PUBLIC_TO_EVERYONE',
          disable_duet:    false,
          disable_comment: false,
          disable_stitch:  false,
        },
        source_info: {
          source:     'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: videoSize,
          total_chunk_count: 1,
        },
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }
    );

    const { publish_id, upload_url } = initRes.data.data;
    console.log(`[TikTok] 📤 Uploading video (${Math.round(videoSize / 1024)}KB)…`);

    // Step 2: Upload video bytes
    await axios.put(upload_url, videoBuffer, {
      headers: {
        'Content-Type':  'video/mp4',
        'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
        'Content-Length': videoSize,
      },
      maxBodyLength: Infinity,
      timeout: 60000,
    });

    console.log(`[TikTok] ✅ Video uploaded, publish_id: ${publish_id}`);
    return publish_id;

  } finally {
    if (videoPath) cleanupVideo(videoPath);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { publishBatch, publishToPlatform, retryPost };
