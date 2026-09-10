const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const { db }                 = require('../config/database');
const { runPostGeneration, isGenerating, getNextSchedule } = require('../services/schedulerService');
const { publishBatch, retryPost }     = require('../services/socialMediaService');
const { sendPublishedConfirmation }   = require('../services/emailService');
const { regeneratePost, generateCustomPost, previewGenerate, THEMES } = require('../services/geminiService');
const { fetchImage, fetchImageGrid }  = require('../services/imageService');
const { addClient, broadcast }        = require('../services/sseService');
const { validatePostPatch, validateBatchApprove } = require('../middleware/validate');
const siteConfig                      = require('../services/siteConfigService');

// ─── SSE ─────────────────────────────────────────────────────────────────────

router.get('/events', (req, res) => {
  addClient(res);
});

// ─── Dashboard stats ─────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  const batches = db.prepare(`
    SELECT
      COUNT(*) AS total_batches,
      SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status IN ('sent','partially_sent') THEN 1 ELSE 0 END) AS sent,
      SUM(CASE WHEN status = 'failed'   THEN 1 ELSE 0 END) AS failed
    FROM post_batches
  `).get();

  const posts = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'posted'  THEN 1 ELSE 0 END) AS posted,
      SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END) AS failed,
      SUM(CASE WHEN status = 'skipped' THEN 1 ELSE 0 END) AS skipped
    FROM posts
  `).get();

  const byPlatform = db.prepare(`
    SELECT platform,
           COUNT(*) AS total,
           SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) AS posted
    FROM posts GROUP BY platform
  `).all();

  const recentBatches = db.prepare(`
    SELECT id, scheduled_at, generated_at, status, notes AS theme
    FROM post_batches ORDER BY generated_at DESC LIMIT 5
  `).all();

  const recentActivity = db.prepare(
    `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 10`
  ).all();

  res.json({
    ok: true, batches, posts, byPlatform,
    recentBatches, recentActivity,
    nextSchedule: getNextSchedule(),
    isGenerating: isGenerating(),
  });
});

// ─── Batches ─────────────────────────────────────────────────────────────────

router.get('/batches', (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page  || '1',  10));
  const limit  = Math.min(100, parseInt(req.query.limit || '20', 10));
  const offset = (page - 1) * limit;

  const batches = db.prepare(`
    SELECT b.*,
           COUNT(p.id) AS post_count,
           SUM(CASE WHEN p.status = 'posted'  THEN 1 ELSE 0 END) AS posted_count,
           SUM(CASE WHEN p.status = 'failed'  THEN 1 ELSE 0 END) AS failed_count,
           SUM(CASE WHEN p.status = 'skipped' THEN 1 ELSE 0 END) AS skipped_count
    FROM post_batches b
    LEFT JOIN posts p ON p.batch_id = b.id
    GROUP BY b.id ORDER BY b.generated_at DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM post_batches').get();
  res.json({ ok: true, batches, total: count, page, limit });
});

router.get('/batches/:id', (req, res) => {
  const batch = db.prepare('SELECT * FROM post_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
  const posts = db.prepare('SELECT * FROM posts WHERE batch_id = ? ORDER BY platform').all(req.params.id);
  res.json({ ok: true, batch, posts });
});

router.delete('/batches/:id', (req, res) => {
  const batch = db.prepare('SELECT * FROM post_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
  if (batch.status === 'sent') return res.status(400).json({ ok: false, error: 'Cannot delete an already-sent batch' });
  db.prepare('DELETE FROM post_batches WHERE id = ?').run(req.params.id);
  res.json({ ok: true, message: 'Batch deleted' });
});

// ─── External cron trigger (called by cron-job.org or similar) ───────────────
// Protected by CRON_SECRET env var — safe to expose publicly

router.post('/cron/trigger', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return res.status(503).json({ ok: false, error: 'CRON_SECRET not configured' });

  const provided = req.headers['x-cron-secret'] || req.query.secret;
  if (provided !== secret) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  if (isGenerating()) return res.status(409).json({ ok: false, error: 'Already running' });

  // Respond immediately so the cron service doesn't time out, then run in background
  res.json({ ok: true, message: 'Triggered' });

  try {
    await runPostGeneration('cron-external');
  } catch (err) {
    console.error('[Cron] External trigger failed:', err.message);
  }
});

// ─── Generate ─────────────────────────────────────────────────────────────────

router.post('/generate', async (req, res) => {
  if (isGenerating()) {
    return res.status(409).json({ ok: false, error: 'A generation is already in progress. Please wait.' });
  }
  try {
    const { theme } = req.body;
    const result = await runPostGeneration('manual', theme || null);
    res.json({ ok: true, message: 'Posts generated and email sent', ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Preview only — no DB save, no email
router.post('/preview', async (req, res) => {
  try {
    const result = await previewGenerate(req.body.theme || null);
    res.json({ ok: true, preview: result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Available themes for dropdown
router.get('/themes', (req, res) => {
  res.json({ ok: true, themes: THEMES.map(t => ({ theme: t.theme, focus: t.focus })) });
});

// ─── Review (JWT token from email link) ──────────────────────────────────────

router.get('/review/:token', (req, res) => {
  try {
    const payload = jwt.verify(
      req.params.token,
      process.env.APP_SECRET || 'fallback_secret_change_me'
    );
    if (payload.type !== 'approval') throw new Error('Invalid token type');
    const batch = db.prepare('SELECT * FROM post_batches WHERE id = ? AND token = ?')
      .get(payload.batchId, req.params.token);
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
    const posts = db.prepare('SELECT * FROM posts WHERE batch_id = ? ORDER BY platform').all(batch.id);
    res.json({ ok: true, batch, posts });
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Approval link has expired (48-hour limit). Go to the Dashboard to find this batch.'
      : err.message;
    res.status(401).json({ ok: false, error: msg });
  }
});

// ─── Individual posts ─────────────────────────────────────────────────────────

router.patch('/posts/:id', validatePostPatch, (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ ok: false, error: 'Post not found' });

  const { content, imageUrl, status } = req.body;
  const updates = [], values = [];
  if (content  !== undefined) { updates.push('edited_content = ?'); values.push(content.trim()); }
  if (imageUrl !== undefined) { updates.push('image_url = ?');      values.push(imageUrl); }
  if (status   !== undefined) { updates.push('status = ?');         values.push(status); }
  if (!updates.length) return res.status(400).json({ ok: false, error: 'Nothing to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  res.json({ ok: true, post: db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id) });
});

// Regenerate with Claude (improve existing)
router.post('/posts/:id/regenerate', async (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ ok: false, error: 'Post not found' });
  try {
    const current = post.edited_content || post.content;
    const result  = await regeneratePost(post.platform, current, req.body.note || '');

    const tags    = Array.isArray(result.hashtags) ? result.hashtags : [];
    const tagStr  = tags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
    let content   = (result.content || '').trim();
    if (post.platform !== 'twitter' && tagStr && !content.includes('#')) {
      content = `${content}\n\n${tagStr}`;
    }
    db.prepare('UPDATE posts SET edited_content = ?, hashtags = ? WHERE id = ?')
      .run(content, JSON.stringify(tags), post.id);
    res.json({ ok: true, post: db.prepare('SELECT * FROM posts WHERE id = ?').get(post.id) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Generate from custom freeform prompt
router.post('/posts/:id/custom', async (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ ok: false, error: 'Post not found' });
  if (!req.body.prompt) return res.status(400).json({ ok: false, error: 'prompt is required' });
  try {
    const result  = await generateCustomPost(post.platform, req.body.prompt);
    const tags    = Array.isArray(result.hashtags) ? result.hashtags : [];
    const tagStr  = tags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
    let content   = (result.content || '').trim();
    if (post.platform !== 'twitter' && tagStr && !content.includes('#')) {
      content = `${content}\n\n${tagStr}`;
    }
    db.prepare('UPDATE posts SET edited_content = ?, hashtags = ? WHERE id = ?')
      .run(content, JSON.stringify(tags), post.id);
    res.json({ ok: true, post: db.prepare('SELECT * FROM posts WHERE id = ?').get(post.id) });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Retry a failed/pending post
router.post('/posts/:id/retry', async (req, res) => {
  try {
    const result = await retryPost(req.params.id);
    broadcast('post_retried', result);
    res.json({ ok: true, result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Refresh image
router.post('/posts/:id/refresh-image', async (req, res) => {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ ok: false, error: 'Post not found' });
  try {
    const keywords = req.body.keywords || post.image_alt || 'agriculture farm';
    const image    = await fetchImage(keywords, post.platform);
    db.prepare('UPDATE posts SET image_url = ?, image_alt = ?, image_credit = ? WHERE id = ?')
      .run(image.url, image.alt, image.credit, post.id);
    res.json({ ok: true, image });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── Image search grid ────────────────────────────────────────────────────────

router.get('/images/search', async (req, res) => {
  const { q, count } = req.query;
  if (!q) return res.status(400).json({ ok: false, error: 'q (query) is required' });
  try {
    const images = await fetchImageGrid(q, Math.min(12, parseInt(count || '6', 10)));
    res.json({ ok: true, images });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ─── Batch approval ───────────────────────────────────────────────────────────

router.post('/batches/:id/approve', validateBatchApprove, (req, res) => {
  const batch = db.prepare('SELECT * FROM post_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });

  const { platformStatuses } = req.body;
  if (platformStatuses) {
    const stmt = db.prepare(
      `UPDATE posts SET status = ? WHERE batch_id = ? AND platform = ? AND status = 'pending'`
    );
    for (const [plat, stat] of Object.entries(platformStatuses)) stmt.run(stat, batch.id, plat);
  } else {
    db.prepare(`UPDATE posts SET status = 'approved' WHERE batch_id = ? AND status = 'pending'`)
      .run(batch.id);
  }

  db.prepare(`UPDATE post_batches SET status = 'approved', approved_at = datetime('now') WHERE id = ?`)
    .run(batch.id);

  res.json({ ok: true, message: 'Batch approved' });
});

// ─── Batch publish ────────────────────────────────────────────────────────────

router.post('/batches/:id/publish', async (req, res) => {
  const batch = db.prepare('SELECT * FROM post_batches WHERE id = ?').get(req.params.id);
  if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });

  const approvedPosts = db.prepare(
    `SELECT * FROM posts WHERE batch_id = ? AND status = 'approved'`
  ).all(batch.id);

  if (!approvedPosts.length) {
    return res.status(400).json({ ok: false, error: 'No approved posts to publish. Mark at least one post as Approved first.' });
  }

  try {
    const results   = await publishBatch(approvedPosts);
    const allPosted = results.every(r => r.status === 'posted');
    const anyPosted = results.some(r => r.status === 'posted');
    const newStatus = allPosted ? 'sent' : anyPosted ? 'partially_sent' : 'failed';

    db.prepare(`UPDATE post_batches SET status = ?, sent_at = datetime('now') WHERE id = ?`)
      .run(newStatus, batch.id);
    db.prepare(`INSERT INTO activity_log (id, event, batch_id, details) VALUES (?, 'batch_published', ?, ?)`)
      .run(uuidv4(), batch.id, JSON.stringify(results));

    broadcast('batch_published', { batchId: batch.id, results, status: newStatus });
    try { await sendPublishedConfirmation(batch, results); } catch (_) {}

    res.json({ ok: true, results, status: newStatus });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Retry all failed posts in a batch
router.post('/batches/:id/retry-failed', async (req, res) => {
  const failedPosts = db.prepare(
    `SELECT * FROM posts WHERE batch_id = ? AND status = 'failed'`
  ).all(req.params.id);

  if (!failedPosts.length) {
    return res.status(400).json({ ok: false, error: 'No failed posts in this batch' });
  }

  const results = [];
  for (const post of failedPosts) {
    try { results.push(await retryPost(post.id)); }
    catch (e) { results.push({ platform: post.platform, status: 'failed', error: e.message }); }
  }

  broadcast('batch_retried', { batchId: req.params.id, results });
  res.json({ ok: true, results });
});

// ─── Activity log ─────────────────────────────────────────────────────────────

router.get('/activity', (req, res) => {
  const limit = Math.min(200, parseInt(req.query.limit || '50', 10));
  res.json({
    ok: true,
    logs: db.prepare(`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ?`).all(limit),
  });
});

// ─── Site config ──────────────────────────────────────────────────────────────

router.get('/site-config', (req, res) => {
  res.json({ ok: true, config: siteConfig.getAll() });
});

router.put('/site-config', (req, res) => {
  const ALLOWED = ['site_name','site_concept','site_url','post_tone','topics','target_audience'];
  const updates = {};
  for (const key of ALLOWED) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (!Object.keys(updates).length) {
    return res.status(400).json({ ok: false, error: 'No valid fields provided' });
  }
  siteConfig.setMany(updates);
  res.json({ ok: true, message: 'Site config saved', config: siteConfig.getAll() });
});

module.exports = router;
