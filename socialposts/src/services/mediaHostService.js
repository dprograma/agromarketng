/**
 * mediaHostService.js
 *
 * Serves locally-generated video files (the ffmpeg slideshow fallback) over
 * a public URL, so platforms that require a fetchable video_url — currently
 * just Instagram's Content Publishing API for Reels — can use them even
 * when Replicate (which provides its own public CDN URL) is unavailable.
 *
 * Files live in a dedicated OS temp directory served as static assets by
 * Express (see server.js: app.use('/media', express.static(...))).
 * Callers are responsible for calling unhostVideo() once publishing
 * completes — see schedulerService.js's cleanup step.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { randomUUID } = require('crypto');

const HOSTED_DIR = path.join(os.tmpdir(), 'agro-hosted-media');
fs.mkdirSync(HOSTED_DIR, { recursive: true });

/**
 * Copy a locally-generated video into the publicly-servable directory.
 * @param {string} localPath – absolute path to the source .mp4
 * @returns {{ publicUrl: string, filename: string }}
 */
function hostVideo(localPath) {
  const filename   = `${randomUUID()}.mp4`;
  const hostedPath = path.join(HOSTED_DIR, filename);
  fs.copyFileSync(localPath, hostedPath);

  const baseUrl = (process.env.APP_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    console.warn('[MediaHost] ⚠ APP_URL not set — Instagram Reels needs a real public URL to fetch this video');
  }
  const publicUrl = `${baseUrl}/media/${filename}`;

  console.log(`[MediaHost] 📡 Hosted at ${publicUrl}`);
  return { publicUrl, filename };
}

/** Remove a previously-hosted video once publishing no longer needs it. */
function unhostVideo(filename) {
  if (!filename) return;
  try {
    fs.unlinkSync(path.join(HOSTED_DIR, filename));
  } catch (_) { /* already gone — fine */ }
}

function getHostedDir() {
  return HOSTED_DIR;
}

module.exports = { hostVideo, unhostVideo, getHostedDir };
