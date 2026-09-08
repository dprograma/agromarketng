/**
 * replicateVideoService.js
 *
 * Generates a short animated video from a still image using Replicate's
 * Stable Video Diffusion model (SVD-XT, 25 frames, ~4 seconds, 16:9).
 *
 * Requires: REPLICATE_API_TOKEN env var.
 * Returns null gracefully when the token is absent so callers can fall back
 * to the local ffmpeg slideshow without crashing.
 */

const Replicate = require('replicate');
const axios     = require('axios');
const fs        = require('fs');
const os        = require('os');
const path      = require('path');

const SVD_MODEL =
  'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438';

/**
 * Animate a still image into a short MP4 via Stable Video Diffusion.
 *
 * @param {string} imageUrl  – Publicly accessible image URL (Unsplash/Pexels)
 * @returns {Promise<{localPath: string, publicUrl: string} | null>}
 *   localPath  – Absolute path to downloaded .mp4 temp file
 *   publicUrl  – Original Replicate CDN URL (needed for Instagram Reels)
 *   null       – Token not configured or generation failed
 */
async function generateAnimatedVideo(imageUrl) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken || apiToken === 'your_replicate_api_token') {
    console.log('[Replicate] REPLICATE_API_TOKEN not set — skipping AI video generation');
    return null;
  }

  const replicate = new Replicate({ auth: apiToken });

  console.log('[Replicate] 🎬 Generating animated video from image…');

  const output = await replicate.run(SVD_MODEL, {
    input: {
      input_image:        imageUrl,
      video_length:       '25_frames_with_svd_xt', // ~4 seconds
      sizing_strategy:    'crop_to_16_9',           // landscape, safe for all platforms
      frames_per_second:  6,
      motion_bucket_id:   40,  // moderate, natural-looking motion
      cond_aug:           0.02,
    },
  });

  const videoUrl = Array.isArray(output) ? output[0] : String(output);
  if (!videoUrl) throw new Error('Replicate returned empty output');

  console.log(`[Replicate] ✅ Video URL: ${videoUrl}`);

  // Download to a temp file so platform publishers can do binary uploads
  const tmpDir    = fs.mkdtempSync(path.join(os.tmpdir(), 'agro-svd-'));
  const localPath = path.join(tmpDir, 'post.mp4');

  const dlRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 90000 });
  fs.writeFileSync(localPath, Buffer.from(dlRes.data));
  console.log(`[Replicate] ⬇ Downloaded to ${localPath} (${Math.round(dlRes.data.byteLength / 1024)} KB)`);

  return { localPath, publicUrl: videoUrl };
}

module.exports = { generateAnimatedVideo };
