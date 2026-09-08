const cron   = require('node-cron');
const { v4: uuidv4 } = require('uuid');
const jwt    = require('jsonwebtoken');
const { db } = require('../config/database');
const { generateAllPosts }          = require('./claudeService');
const { fetchImagesForAllPlatforms }= require('./imageService');
const { sendApprovalEmail }         = require('./emailService');
const { publishBatch }              = require('./socialMediaService');
const { broadcast }                 = require('./sseService');

const SITE_URL = process.env.SITE_URL || 'https://www.agromarketng.com';

const PLATFORMS = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];

// WAT = UTC+1
// 7:00 AM WAT  → 06:00 UTC → "0 6 * * *"
// 12:00 PM WAT → 11:00 UTC → "0 11 * * *"
const SCHEDULES = [
  { cron: '0 6 * * *',  label: '07:00 WAT' },
  { cron: '0 11 * * *', label: '12:00 WAT' },
];

let activeTasks = [];
let isRunning   = false;   // prevent overlap

function startScheduler() {
  SCHEDULES.forEach(({ cron: expression, label }) => {
    const task = cron.schedule(expression, async () => {
      console.log(`[Scheduler] ⏰ Triggered: ${label} (${new Date().toISOString()})`);
      try {
        await runPostGeneration(label);
      } catch (err) {
        console.error(`[Scheduler] ❌ Run failed (${label}):`, err.message);
      }
    }, { timezone: 'UTC' });

    activeTasks.push(task);
    console.log(`[Scheduler] ✅ Registered: ${label} (${expression} UTC)`);
  });
}

function stopScheduler() {
  activeTasks.forEach(t => t.stop());
  activeTasks = [];
}

function getNextSchedule() {
  const now = new Date();
  const watHour = (now.getUTCHours() + 1) % 24;
  const watMinute = now.getUTCMinutes();
  if (watHour < 7 || (watHour === 7 && watMinute === 0)) return '07:00 WAT today';
  if (watHour < 12) return '12:00 WAT today';
  return '07:00 WAT tomorrow';
}

/**
 * Core pipeline: generate posts → fetch images → save to DB → send email.
 * Also broadcasts SSE events so the dashboard updates in real-time.
 */
async function runPostGeneration(scheduleLabel = 'manual', themeOverride = null) {
  if (isRunning) {
    throw new Error('A generation is already in progress. Please wait.');
  }
  isRunning = true;
  broadcast('generation_started', { scheduleLabel, time: new Date().toISOString() });

  const batchId     = uuidv4();
  const scheduledAt = new Date().toISOString();
  const jwtSecret   = process.env.APP_SECRET || 'fallback_secret_change_me';

  const token = jwt.sign(
    { batchId, type: 'approval' },
    jwtSecret,
    { expiresIn: '48h' }
  );
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  try {
    // ── 1. Generate content ──────────────────────────────────────────────────
    console.log(`[Scheduler] 🤖 Generating posts (batch ${batchId})…`);
    broadcast('generation_progress', { step: 'generating', batchId });

    const generated = await generateAllPosts(themeOverride);
    const { posts: generatedPosts, imageKeywords = [], theme } = generated;

    // ── 2. Fetch images ──────────────────────────────────────────────────────
    console.log(`[Scheduler] 🖼 Fetching images (${imageKeywords.join(', ')})…`);
    broadcast('generation_progress', { step: 'fetching_images', batchId, imageKeywords });

    const images = await fetchImagesForAllPlatforms(imageKeywords);

    // ── 3. Persist batch ─────────────────────────────────────────────────────
    db.prepare(`
      INSERT INTO post_batches (id, scheduled_at, status, token, token_expires_at, notes)
      VALUES (?, ?, 'pending', ?, ?, ?)
    `).run(batchId, scheduledAt, token, tokenExpiresAt, theme || null);

    const insertPost   = db.prepare(`
      INSERT INTO posts (id, batch_id, platform, content, hashtags, image_url, image_alt, image_credit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    const insertedPosts = [];

    for (const platform of PLATFORMS) {
      const postData = generatedPosts[platform];
      if (!postData) {
        console.warn(`[Scheduler] ⚠ No post for ${platform}`);
        continue;
      }

      const hashtags   = Array.isArray(postData.hashtags) ? postData.hashtags : [];
      const hashtagStr = hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ');
      let   content    = (postData.content || '').trim();

      // Replace URL placeholder for Twitter (already in content)
      if (platform === 'twitter') {
        content = content.replace('[SITE_URL]', SITE_URL);
        // Add URL at end if placeholder wasn't present
        if (!content.includes(SITE_URL)) content = `${content} ${SITE_URL}`;
      } else {
        // Append hashtags block if not already embedded
        if (hashtagStr && !content.includes('#')) {
          content = `${content}\n\n${hashtagStr}`;
        }
        // Append backlink to site
        if (!content.includes(SITE_URL)) {
          content = `${content}\n\n🌐 ${SITE_URL}`;
        }
      }

      const image  = images[platform];
      const postId = uuidv4();

      insertPost.run(
        postId, batchId, platform, content,
        JSON.stringify(hashtags),
        image?.url || null, image?.alt || null, image?.credit || null
      );

      insertedPosts.push({
        id: postId, batch_id: batchId, platform, content,
        hashtags: JSON.stringify(hashtags),
        image_url: image?.url || null, image_alt: image?.alt || null,
        image_credit: image?.credit || null, status: 'pending',
      });
    }

    // ── 4. Activity log ──────────────────────────────────────────────────────
    db.prepare(
      `INSERT INTO activity_log (id, event, batch_id, details) VALUES (?, 'batch_generated', ?, ?)`
    ).run(uuidv4(), batchId, JSON.stringify({ scheduleLabel, theme, postCount: insertedPosts.length }));

    // ── 5. Auto-approve all posts and publish immediately ────────────────────
    broadcast('generation_progress', { step: 'publishing', batchId });

    db.prepare(`UPDATE posts SET status = 'approved' WHERE batch_id = ?`).run(batchId);
    db.prepare(`UPDATE post_batches SET status = 'approved' WHERE id = ?`).run(batchId);

    const approvedPosts = insertedPosts.map(p => ({ ...p, status: 'approved' }));
    console.log(`[Scheduler] 🚀 Auto-publishing ${approvedPosts.length} posts…`);

    const publishResults = await publishBatch(approvedPosts);
    const succeeded = publishResults.filter(r => r.status === 'posted').length;
    const failed    = publishResults.filter(r => r.status === 'failed').length;

    db.prepare(`UPDATE post_batches SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(batchId);
    db.prepare(
      `INSERT INTO activity_log (id, event, batch_id, details) VALUES (?, 'batch_published', ?, ?)`
    ).run(uuidv4(), batchId, JSON.stringify({ succeeded, failed }));

    // ── 6. Email summary (non-fatal — publishing already done) ───────────────
    const batchRow = db.prepare('SELECT * FROM post_batches WHERE id = ?').get(batchId);
    try {
      await sendApprovalEmail(batchRow, insertedPosts);
      console.log(`[Scheduler] 📧 Summary email sent.`);
    } catch (emailErr) {
      console.warn(`[Scheduler] ⚠️  Email failed (posts already published): ${emailErr.message}`);
    }

    // ── 7. SSE broadcast ──────────────────────────────────────────────────────
    broadcast('batch_generated', {
      batchId,
      postCount: insertedPosts.length,
      theme,
      scheduleLabel,
      time: new Date().toISOString(),
    });

    console.log(`[Scheduler] ✅ Batch ${batchId} — ${succeeded} published, ${failed} failed.`);
    return { batchId, postCount: insertedPosts.length, theme };

  } catch (err) {
    console.error(`[Scheduler] ❌ Batch ${batchId} failed:`, err);
    try { db.prepare(`UPDATE post_batches SET status = 'failed' WHERE id = ?`).run(batchId); } catch (_) {}
    db.prepare(
      `INSERT INTO activity_log (id, event, batch_id, details) VALUES (?, 'batch_failed', ?, ?)`
    ).run(uuidv4(), batchId, JSON.stringify({ error: err.message }));

    broadcast('generation_failed', { batchId, error: err.message });
    throw err;
  } finally {
    isRunning = false;
  }
}

module.exports = { startScheduler, stopScheduler, runPostGeneration, getNextSchedule, isGenerating: () => isRunning };
