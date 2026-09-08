const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');
const { db }   = require('../config/database');
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Post to all approved platforms in a batch.
 * sharedVideo = { localPath: string, publicUrl: string|null } | null
 * Returns array of { platform, status, postId, error }
 */
async function publishBatch(posts, sharedVideo = null) {
  const results = [];
  for (const post of posts) {
    if (post.status !== 'approved') continue;
    const content = post.edited_content || post.content;
    const result  = await publishToPlatform(post.platform, content, post.image_url, sharedVideo);
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
 * No sharedVideo on retry — falls back to image posting gracefully.
 */
async function retryPost(postId) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) throw new Error('Post not found');
  if (!['failed', 'pending', 'approved'].includes(post.status)) {
    throw new Error(`Cannot retry a post with status: ${post.status}`);
  }
  const content = post.edited_content || post.content;
  const result  = await publishToPlatform(post.platform, content, post.image_url, null);

  db.prepare(`
    UPDATE posts
    SET status = ?, posted_at = datetime('now'), post_id = ?, error = ?
    WHERE id = ?
  `).run(result.status, result.postId || null, result.error || null, postId);

  return { ...result, platform: post.platform };
}

async function publishToPlatform(platform, content, imageUrl, sharedVideo = null) {
  try {
    let postId;
    switch (platform) {
      case 'facebook':  postId = await postToFacebook(content, imageUrl, sharedVideo);  break;
      case 'twitter':   postId = await postToTwitter(content, imageUrl, sharedVideo);   break;
      case 'instagram': postId = await postToInstagram(content, imageUrl, sharedVideo); break;
      case 'linkedin':  postId = await postToLinkedIn(content, imageUrl, sharedVideo);  break;
      case 'tiktok':    postId = await postToTikTok(content, imageUrl);                 break;
      default: throw new Error(`Unsupported platform: ${platform}`);
    }
    console.log(`[Social] ✅ Posted to ${platform}: ${postId}`);
    return { status: 'posted', postId };
  } catch (err) {
    const apiError = err.response?.data?.error || err.response?.data || null;
    const msg = apiError ? `${err.message} — API: ${JSON.stringify(apiError)}` : err.message;
    console.error(`[Social] ❌ Failed [${platform}]:`, msg);
    return { status: 'failed', error: msg };
  }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

async function postToFacebook(content, imageUrl, sharedVideo) {
  const acc    = getAccount('facebook');
  const pageId = acc?.accountId   || process.env.FACEBOOK_PAGE_ID;
  const token  = acc?.accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) throw new Error('Facebook not connected — click Connect in Settings');

  // ── Video post (preferred) ───────────────────────────────────────────────
  if (sharedVideo?.localPath && fs.existsSync(sharedVideo.localPath)) {
    console.log('[Facebook] 🎬 Uploading video…');
    const videoBuffer = fs.readFileSync(sharedVideo.localPath);
    const form = new FormData();
    form.append('source', videoBuffer, { filename: 'post.mp4', contentType: 'video/mp4' });
    form.append('description', content);
    form.append('access_token', token);

    const res = await axios.post(
      `https://graph.facebook.com/v21.0/${pageId}/videos`,
      form,
      { headers: form.getHeaders(), timeout: 120000, maxBodyLength: Infinity }
    );
    return res.data.id;
  }

  // ── Image post fallback ──────────────────────────────────────────────────
  if (imageUrl) {
    console.log('[Facebook] 📷 Downloading image for photo post…');
    const imgRes     = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
    const imgBuffer  = Buffer.from(imgRes.data);
    const ext        = (imgRes.headers['content-type'] || '').includes('png') ? 'png' : 'jpg';
    const form       = new FormData();
    form.append('source', imgBuffer, { filename: `post.${ext}`, contentType: imgRes.headers['content-type'] || 'image/jpeg' });
    form.append('caption', content);
    form.append('access_token', token);
    const res = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/photos`, form, { headers: form.getHeaders(), timeout: 30000 });
    return res.data.post_id || res.data.id;
  }

  const res = await axios.post(`https://graph.facebook.com/v21.0/${pageId}/feed`, { message: content, access_token: token });
  return res.data.id;
}

// ─── Twitter / X ──────────────────────────────────────────────────────────────

async function postToTwitter(content, imageUrl, sharedVideo) {
  const apiKey      = process.env.TWITTER_API_KEY;
  const apiSecret   = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret= process.env.TWITTER_ACCESS_SECRET;
  if (!apiKey || apiKey === 'your_api_key' || !accessToken || accessToken === 'your_access_token')
    throw new Error('Twitter credentials not configured — skipping');

  let mediaId;

  // ── Video upload (preferred) ─────────────────────────────────────────────
  if (sharedVideo?.localPath && fs.existsSync(sharedVideo.localPath)) {
    try {
      console.log('[Twitter] 🎬 Uploading video…');
      mediaId = await uploadTwitterVideo(sharedVideo.localPath, apiKey, apiSecret, accessToken, accessSecret);
    } catch (e) {
      console.warn('[Twitter] Video upload failed, trying image:', e.message);
    }
  }

  // ── Image fallback ───────────────────────────────────────────────────────
  if (!mediaId && imageUrl) {
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

async function uploadTwitterVideo(videoPath, apiKey, apiSecret, accessToken, accessSecret) {
  const videoBuffer = fs.readFileSync(videoPath);
  const videoSize   = videoBuffer.length;
  const uploadUrl   = 'https://upload.twitter.com/1.1/media/upload.json';

  // INIT
  const initForm = new FormData();
  initForm.append('command',        'INIT');
  initForm.append('total_bytes',    String(videoSize));
  initForm.append('media_type',     'video/mp4');
  initForm.append('media_category', 'tweet_video');

  const oauthInit = buildTwitterOAuth('POST', uploadUrl, {}, apiKey, apiSecret, accessToken, accessSecret);
  const initRes   = await axios.post(uploadUrl, initForm, { headers: { ...initForm.getHeaders(), Authorization: oauthInit } });
  const mediaId   = initRes.data.media_id_string;

  // APPEND (5 MB chunks)
  const CHUNK = 5 * 1024 * 1024;
  let seg = 0;
  for (let offset = 0; offset < videoSize; offset += CHUNK) {
    const chunk      = videoBuffer.slice(offset, Math.min(offset + CHUNK, videoSize));
    const appendForm = new FormData();
    appendForm.append('command',       'APPEND');
    appendForm.append('media_id',      mediaId);
    appendForm.append('media_data',    chunk.toString('base64'));
    appendForm.append('segment_index', String(seg++));
    const oauthAppend = buildTwitterOAuth('POST', uploadUrl, {}, apiKey, apiSecret, accessToken, accessSecret);
    await axios.post(uploadUrl, appendForm, { headers: { ...appendForm.getHeaders(), Authorization: oauthAppend } });
  }

  // FINALIZE
  const finalForm = new FormData();
  finalForm.append('command',  'FINALIZE');
  finalForm.append('media_id', mediaId);
  const oauthFinal = buildTwitterOAuth('POST', uploadUrl, {}, apiKey, apiSecret, accessToken, accessSecret);
  const finalRes   = await axios.post(uploadUrl, finalForm, { headers: { ...finalForm.getHeaders(), Authorization: oauthFinal } });

  // Poll if async processing needed
  if (finalRes.data.processing_info?.state === 'pending' || finalRes.data.processing_info?.state === 'in_progress') {
    await pollTwitterMedia(mediaId, apiKey, apiSecret, accessToken, accessSecret, uploadUrl);
  }

  return mediaId;
}

async function pollTwitterMedia(mediaId, apiKey, apiSecret, accessToken, accessSecret, uploadUrl) {
  for (let i = 0; i < 20; i++) {
    await sleep(3000);
    const oauthStatus = buildTwitterOAuth('GET', uploadUrl, { command: 'STATUS', media_id: mediaId }, apiKey, apiSecret, accessToken, accessSecret);
    const res = await axios.get(`${uploadUrl}?command=STATUS&media_id=${mediaId}`, { headers: { Authorization: oauthStatus } });
    const info = res.data.processing_info;
    if (!info || info.state === 'succeeded') return;
    if (info.state === 'failed') throw new Error('Twitter video processing failed');
    const waitSec = info.check_after_secs || 3;
    await sleep(waitSec * 1000);
  }
  throw new Error('Twitter video processing timed out');
}

async function uploadTwitterMedia(imageUrl, apiKey, apiSecret, accessToken, accessSecret) {
  const imgRes    = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
  const base64    = Buffer.from(imgRes.data).toString('base64');
  const uploadUrl = 'https://upload.twitter.com/1.1/media/upload.json';
  const oauthHeader = buildTwitterOAuth('POST', uploadUrl, {}, apiKey, apiSecret, accessToken, accessSecret);

  const form = new FormData();
  form.append('media_data', base64);

  const res = await axios.post(uploadUrl, form, { headers: { ...form.getHeaders(), Authorization: oauthHeader } });
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

async function postToInstagram(caption, imageUrl, sharedVideo) {
  const acc       = getAccount('instagram');
  const fbAcc     = getAccount('facebook');
  const accountId = acc?.accountId   || process.env.INSTAGRAM_ACCOUNT_ID;
  const token     = acc?.accessToken || fbAcc?.accessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!accountId || !token) throw new Error('Instagram not connected — connect Facebook first in Settings');

  // ── Reels post via public URL (Replicate) ────────────────────────────────
  if (sharedVideo?.publicUrl) {
    console.log('[Instagram] 🎬 Posting Reels with video URL…');
    const createRes = await axios.post(
      `https://graph.facebook.com/v21.0/${accountId}/media`,
      {
        media_type:    'REELS',
        video_url:     sharedVideo.publicUrl,
        caption,
        access_token:  token,
        share_to_feed: true,
      }
    );
    const containerId = createRes.data.id;

    // Video containers take longer to process — poll up to 90 seconds
    for (let i = 0; i < 18; i++) {
      await sleep(5000);
      const sRes = await axios.get(
        `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`
      );
      if (sRes.data.status_code === 'FINISHED') break;
      if (sRes.data.status_code === 'ERROR') throw new Error('Instagram Reels container failed to process');
    }

    const pubRes = await axios.post(
      `https://graph.facebook.com/v21.0/${accountId}/media_publish`,
      { creation_id: containerId, access_token: token }
    );
    return pubRes.data.id;
  }

  // ── Image post fallback (no public video URL available) ──────────────────
  if (!imageUrl) throw new Error('Instagram requires an image URL');
  console.log('[Instagram] 📷 Posting image (no public video URL — set REPLICATE_API_TOKEN for Reels)');

  const createRes = await axios.post(
    `https://graph.facebook.com/v21.0/${accountId}/media`,
    { image_url: imageUrl, caption, access_token: token }
  );
  const containerId = createRes.data.id;

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

async function postToLinkedIn(content, imageUrl, sharedVideo) {
  const acc       = getAccount('linkedin');
  const token     = acc?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN;
  const authorUrn = acc?.accountId   || process.env.LINKEDIN_ORG_URN || process.env.LINKEDIN_PERSON_URN;
  if (!token || !authorUrn) throw new Error('LinkedIn not connected — click Connect in Settings');

  // ── Video post (preferred) ───────────────────────────────────────────────
  if (sharedVideo?.localPath && fs.existsSync(sharedVideo.localPath)) {
    try {
      console.log('[LinkedIn] 🎬 Uploading video…');
      const mediaAsset = await uploadLinkedInVideo(sharedVideo.localPath, token, authorUrn);

      const body = {
        author:          authorUrn,
        lifecycleState:  'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary:    { text: content },
            shareMediaCategory: 'VIDEO',
            media: [{
              status:      'READY',
              description: { text: content.substring(0, 100) },
              media:       mediaAsset,
              title:       { text: process.env.SITE_NAME || 'AgroMarket' },
            }],
          },
        },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
      };

      const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      });
      return res.headers['x-restli-id'] || res.data.id;
    } catch (e) {
      console.warn('[LinkedIn] Video upload failed, falling back to image:', e.message);
    }
  }

  // ── Image post fallback ──────────────────────────────────────────────────
  let mediaAsset;
  if (imageUrl) {
    try { mediaAsset = await uploadLinkedInImage(imageUrl, token, authorUrn); }
    catch (e) { console.warn('[LinkedIn] Image upload skipped:', e.message); }
  }

  const body = {
    author:          authorUrn,
    lifecycleState:  'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary:    { text: content },
        shareMediaCategory: mediaAsset ? 'IMAGE' : 'NONE',
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
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
  });
  return res.headers['x-restli-id'] || res.data.id;
}

async function uploadLinkedInVideo(videoPath, token, authorUrn) {
  const regRes = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
        owner:   authorUrn,
        serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD'],
      },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  const uploadUrl = regRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset     = regRes.data.value.asset;

  const videoBuffer = fs.readFileSync(videoPath);
  await axios.put(uploadUrl, videoBuffer, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'video/mp4' },
    maxBodyLength: Infinity,
    timeout: 120000,
  });
  return asset;
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
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': imgRes.headers['content-type'] || 'image/jpeg' },
  });
  return asset;
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function postToTikTok(content, imageUrl) {
  const acc   = getAccount('tiktok');
  const token = acc?.accessToken || process.env.TIKTOK_ACCESS_TOKEN;
  if (!token || token === 'your_tiktok_access_token')
    throw new Error('TikTok not connected — click Connect in Settings');

  if (!imageUrl) throw new Error('TikTok requires an image to generate video from');

  // TikTok always uses the portrait ffmpeg slideshow with Ken Burns + text overlay
  const imageUrls = [imageUrl, imageUrl, imageUrl];
  let videoPath;
  try {
    console.log('[TikTok] 🎬 Generating portrait slideshow video…');
    videoPath = await createSlideshowVideo(imageUrls, content);
  } catch (e) {
    throw new Error(`TikTok video generation failed: ${e.message}`);
  }

  try {
    const videoBuffer = fs.readFileSync(videoPath);
    const videoSize   = fs.statSync(videoPath).size;

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
          source:            'FILE_UPLOAD',
          video_size:        videoSize,
          chunk_size:        videoSize,
          total_chunk_count: 1,
        },
      },
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' } }
    );

    const { publish_id, upload_url } = initRes.data.data;
    console.log(`[TikTok] 📤 Uploading video (${Math.round(videoSize / 1024)} KB)…`);

    await axios.put(upload_url, videoBuffer, {
      headers: {
        'Content-Type':   'video/mp4',
        'Content-Range':  `bytes 0-${videoSize - 1}/${videoSize}`,
        'Content-Length': videoSize,
      },
      maxBodyLength: Infinity,
      timeout: 60000,
    });

    console.log(`[TikTok] ✅ Uploaded, publish_id: ${publish_id}`);
    return publish_id;
  } finally {
    if (videoPath) cleanupVideo(videoPath);
  }
}

module.exports = { publishBatch, publishToPlatform, retryPost };
