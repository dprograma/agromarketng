/**
 * videoService.js — Creates professional slideshow videos for TikTok
 *
 * Features:
 *  - Ken Burns zoom/pan effect (alternating per slide)
 *  - Smooth xfade crossfade transitions between slides
 *  - Semi-transparent gradient overlay for text readability
 *  - Animated caption text (fade-in per line)
 *  - Hashtag row at bottom
 *  - AgroMarket brand watermark at top
 *  - 9:16 portrait format (1080x1920) at 25fps
 */

const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const axios  = require('axios');
const ffmpeg = require('fluent-ffmpeg');

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// ─── Constants ────────────────────────────────────────────────────────────────

const SLIDE_DURATION = 5;      // seconds per image
const FADE_DURATION  = 0.8;    // xfade crossfade duration (seconds)
const VIDEO_WIDTH    = 1080;
const VIDEO_HEIGHT   = 1920;   // 9:16 portrait
const FPS            = 25;
const FRAMES         = SLIDE_DURATION * FPS; // frames per slide

// Try common Linux/macOS font paths
const FONT_CANDIDATES = [
  '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf',
  '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
  '/usr/share/fonts/truetype/freefont/FreeSansBold.ttf',
  '/System/Library/Fonts/Supplemental/Arial Bold.ttf',   // macOS
  '/System/Library/Fonts/Helvetica.ttc',                 // macOS fallback
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findFont() {
  for (const p of FONT_CANDIDATES) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Escape text for FFmpeg drawtext filter */
function esc(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/'/g,  "’")   // curly apostrophe avoids escaping issues
    .replace(/:/g,  '\\:')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/,/g,  '\\,')
    .replace(/;/g,  '\\;')
    .replace(/\n/g, ' ')
    .replace(/[^\x20-\x7E]/g, '') // strip non-ASCII (emoji etc.)
    .trim();
}

/** Wrap text into lines of max N characters, max 4 lines */
function wrapText(text, maxChars = 30) {
  const words = text.replace(/\n/g, ' ').split(/\s+/);
  const lines = [];
  let line    = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length <= maxChars) {
      line = (line + ' ' + word).trim();
    } else {
      if (line) lines.push(line);
      line = word.substring(0, maxChars);
    }
    if (lines.length >= 4) break;
  }
  if (line && lines.length < 4) lines.push(line);
  return lines;
}

/** Extract hashtags from content */
function extractHashtags(text) {
  const tags = (text.match(/#\w+/g) || []).slice(0, 5);
  return tags.join(' ');
}

/** Strip hashtags from main caption */
function stripHashtags(text) {
  return text.replace(/#\w+/g, '').replace(/\s{2,}/g, ' ').trim();
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Create a professional TikTok slideshow video.
 * @param {string[]} imageUrls  – 2–4 image URLs (Unsplash/Pexels)
 * @param {string}   caption    – Full post caption including hashtags
 * @returns {Promise<string>}   – Absolute path to generated .mp4
 */
async function createSlideshowVideo(imageUrls, caption = '') {
  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'agro-video-'));
  const imgPaths = [];
  const font     = findFont();
  const fontArg  = font ? `:fontfile=${font}` : '';

  console.log(`[Video] 🎬 Creating slideshow (${imageUrls.length} slides, font: ${font || 'default'})`);

  // ── 1. Download images ─────────────────────────────────────────────────────
  for (let i = 0; i < imageUrls.length; i++) {
    const dest = path.join(tmpDir, `img${i}.jpg`);
    try {
      const res = await axios.get(imageUrls[i], { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(dest, Buffer.from(res.data));
      imgPaths.push(dest);
    } catch (e) {
      console.warn(`[Video] ⚠ Image ${i} download failed, skipping:`, e.message);
    }
  }

  if (imgPaths.length === 0) throw new Error('No images could be downloaded for video');

  const n           = imgPaths.length;
  const totalDur    = n * SLIDE_DURATION;
  const outputPath  = path.join(tmpDir, 'tiktok.mp4');

  // ── 2. Prepare text ────────────────────────────────────────────────────────
  const hashText   = esc(extractHashtags(caption)).substring(0, 60);
  const cleanCap   = stripHashtags(caption).replace(/🌐.*$/,'').trim(); // strip backlink
  const captionEsc = esc(cleanCap);
  const lines      = wrapText(cleanCap, 28);
  const brandText  = 'AgroMarket Nigeria';

  // ── 3. Build FFmpeg filter complex ────────────────────────────────────────
  const filters = [];

  // Per-slide: scale → crop → Ken Burns zoompan → setpts
  imgPaths.forEach((_, i) => {
    const zoomIn = i % 2 === 0;
    // Alternate: even slides zoom in from center, odd slides zoom out
    const zExpr = zoomIn
      ? `min(zoom+0.0012,1.12)`
      : `if(lte(on\\,1)\\,1.12\\,max(zoom-0.0012\\,1.0))`;
    // Pan direction alternates for visual variety
    const xExpr = i % 4 < 2 ? `iw/2-(iw/zoom/2)` : `iw/4-(iw/zoom/4)`;
    const yExpr = i % 3 === 0 ? `ih/2-(ih/zoom/2)` : `ih/3-(ih/zoom/3)`;

    filters.push(
      `[${i}:v]` +
      `scale=${VIDEO_WIDTH * 2}:${VIDEO_HEIGHT * 2}:force_original_aspect_ratio=increase,` +
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},` +
      `setsar=1,` +
      `zoompan=z='${zExpr}':d=${FRAMES}:x='${xExpr}':y='${yExpr}':s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=${FPS},` +
      `setpts=PTS-STARTPTS` +
      `[z${i}]`
    );
  });

  // xfade chain between slides
  if (n === 1) {
    filters.push(`[z0]copy[base]`);
  } else {
    let prev = '[z0]';
    for (let i = 1; i < n; i++) {
      const offset   = (i * SLIDE_DURATION) - FADE_DURATION;
      const outLabel = i === n - 1 ? '[base]' : `[xf${i}]`;
      filters.push(`${prev}[z${i}]xfade=transition=fade:duration=${FADE_DURATION}:offset=${offset}${outLabel}`);
      prev = `[xf${i}]`;
    }
  }

  // Semi-transparent dark overlay at bottom (for text readability)
  filters.push(
    `[base]drawbox=x=0:y=ih*0.55:w=iw:h=ih*0.45:color=0x000000@0.65:t=fill[overlay]`
  );

  // Build chained drawtext on top of overlay
  // Start with brand watermark at top
  let current = '[overlay]';

  const addText = (inputLabel, outLabel, opts) => {
    filters.push(`${inputLabel}drawtext=${opts}${outLabel}`);
  };

  // Brand watermark — top center
  addText(
    current,
    '[wm]',
    `text='${esc(brandText)}'${fontArg}:` +
    `fontsize=40:fontcolor=white:` +
    `box=1:boxcolor=0x22772288:boxborderw=18:` +
    `x=(w-text_w)/2:y=60:` +
    `alpha='if(lt(t\\,0.5)\\,t/0.5\\,1)'`
  );
  current = '[wm]';

  // Caption lines — stacked above hashtags
  const lineH     = 62;
  const hashH     = 80; // space reserved for hashtags at bottom
  const blockH    = lines.length * lineH;
  const blockTop  = VIDEO_HEIGHT - hashH - blockH - 40;

  lines.forEach((lineText, i) => {
    const y         = blockTop + i * lineH;
    const fadeStart = 0.4 + i * 0.18;
    const fadeEnd   = fadeStart + 0.35;
    const outLabel  = `[cl${i}]`;
    addText(
      current,
      outLabel,
      `text='${esc(lineText)}'${fontArg}:` +
      `fontsize=52:fontcolor=white:` +
      `box=1:boxcolor=0x00000088:boxborderw=12:` +
      `x=(w-text_w)/2:y=${y}:` +
      `alpha='if(lt(t\\,${fadeStart})\\,0\\,if(lt(t\\,${fadeEnd})\\,(t-${fadeStart})/${(fadeEnd-fadeStart).toFixed(2)}\\,1))'`
    );
    current = outLabel;
  });

  // Hashtag row — bottom
  if (hashText) {
    addText(
      current,
      '[ht]',
      `text='${hashText}'${fontArg}:` +
      `fontsize=34:fontcolor=0x88FF88:` +
      `x=(w-text_w)/2:y=${VIDEO_HEIGHT - 70}:` +
      `alpha='if(lt(t\\,0.9)\\,0\\,if(lt(t\\,1.3)\\,(t-0.9)/0.4\\,1))'`
    );
    current = '[ht]';
  }

  // Website URL — very bottom
  const siteUrl = process.env.SITE_URL || 'www.agromarketng.com';
  addText(
    current,
    '[out]',
    `text='${esc(siteUrl)}'${fontArg}:` +
    `fontsize=28:fontcolor=0xCCCCCC:` +
    `x=(w-text_w)/2:y=${VIDEO_HEIGHT - 30}:` +
    `alpha='if(lt(t\\,1.2)\\,0\\,if(lt(t\\,1.5)\\,(t-1.2)/0.3\\,0.8))'`
  );

  const filterComplex = filters.join('; ');

  // ── 4. Run FFmpeg ──────────────────────────────────────────────────────────
  await new Promise((resolve, reject) => {
    let cmd = ffmpeg();

    imgPaths.forEach(p => {
      cmd = cmd.input(p).inputOptions(['-loop 1', `-t ${SLIDE_DURATION + FADE_DURATION}`]);
    });

    cmd
      .complexFilter(filterComplex)
      .outputOptions([
        '-map [out]',
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        `-t ${totalDur}`,
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        `-r ${FPS}`,
      ])
      .output(outputPath)
      .on('start', () => console.log('[Video] ⚙ FFmpeg encoding started…'))
      .on('progress', p => {
        if (p.percent) process.stdout.write(`\r[Video] ⏳ ${Math.round(p.percent)}%`);
      })
      .on('end', () => {
        process.stdout.write('\n');
        console.log(`[Video] ✅ Slideshow ready: ${outputPath}`);
        resolve(outputPath);
      })
      .on('error', (err, stdout, stderr) => {
        console.error('[Video] ❌ FFmpeg error:', err.message);
        if (stderr) console.error('[Video] stderr:', stderr.slice(-500));
        reject(err);
      })
      .run();
  });

  return outputPath;
}

/**
 * Create a landscape (16:9) video for Facebook / LinkedIn / Twitter.
 * Same Ken Burns zoom+pan and text overlay as the TikTok portrait, but
 * adapted to 1920×1080 with a shorter caption overlay.
 *
 * @param {string[]} imageUrls  – 1–3 image URLs
 * @param {string}   caption    – Post caption (used for bottom overlay text)
 * @returns {Promise<string>}   – Absolute path to generated .mp4
 */
async function createLandscapeVideo(imageUrls, caption = '') {
  const LS_WIDTH  = 1920;
  const LS_HEIGHT = 1080;
  const LS_FPS    = 25;
  const LS_SLIDE  = 5;   // seconds per image
  const LS_FADE   = 0.6;
  const LS_FRAMES = LS_SLIDE * LS_FPS;

  const tmpDir   = fs.mkdtempSync(path.join(os.tmpdir(), 'agro-ls-'));
  const imgPaths = [];
  const font     = findFont();
  const fontArg  = font ? `:fontfile=${font}` : '';

  console.log(`[Video] 🎬 Creating landscape video (${imageUrls.length} slides)`);

  for (let i = 0; i < imageUrls.length; i++) {
    const dest = path.join(tmpDir, `img${i}.jpg`);
    try {
      const res = await axios.get(imageUrls[i], { responseType: 'arraybuffer', timeout: 15000 });
      fs.writeFileSync(dest, Buffer.from(res.data));
      imgPaths.push(dest);
    } catch (e) {
      console.warn(`[Video] ⚠ Image ${i} download failed:`, e.message);
    }
  }

  if (imgPaths.length === 0) throw new Error('No images could be downloaded for landscape video');

  const n          = imgPaths.length;
  const totalDur   = n * LS_SLIDE;
  const outputPath = path.join(tmpDir, 'landscape.mp4');

  const filters = [];

  // Ken Burns per slide
  imgPaths.forEach((_, i) => {
    const zoomIn = i % 2 === 0;
    const zExpr  = zoomIn
      ? `min(zoom+0.0008,1.08)`
      : `if(lte(on\\,1)\\,1.08\\,max(zoom-0.0008\\,1.0))`;
    filters.push(
      `[${i}:v]` +
      `scale=${LS_WIDTH * 2}:${LS_HEIGHT * 2}:force_original_aspect_ratio=increase,` +
      `crop=${LS_WIDTH}:${LS_HEIGHT},setsar=1,` +
      `zoompan=z='${zExpr}':d=${LS_FRAMES}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${LS_WIDTH}x${LS_HEIGHT}:fps=${LS_FPS},` +
      `setpts=PTS-STARTPTS[z${i}]`
    );
  });

  // xfade chain
  if (n === 1) {
    filters.push(`[z0]copy[base]`);
  } else {
    let prev = '[z0]';
    for (let i = 1; i < n; i++) {
      const offset   = i * LS_SLIDE - LS_FADE;
      const outLabel = i === n - 1 ? '[base]' : `[xf${i}]`;
      filters.push(`${prev}[z${i}]xfade=transition=fade:duration=${LS_FADE}:offset=${offset}${outLabel}`);
      prev = `[xf${i}]`;
    }
  }

  // Dark gradient overlay at bottom 25%
  filters.push(
    `[base]drawbox=x=0:y=ih*0.75:w=iw:h=ih*0.25:color=0x000000@0.6:t=fill[ov]`
  );

  // Brand watermark — bottom-left
  const brandText = esc(process.env.SITE_NAME || 'AgroMarket Nigeria');
  filters.push(
    `[ov]drawtext=text='${brandText}'${fontArg}:` +
    `fontsize=36:fontcolor=white:` +
    `x=40:y=ih-70:` +
    `alpha='if(lt(t\\,0.5)\\,t/0.5\\,1)'[wm]`
  );

  // Site URL — bottom-right
  const siteUrl = esc(process.env.SITE_URL || 'www.agromarketng.com');
  filters.push(
    `[wm]drawtext=text='${siteUrl}'${fontArg}:` +
    `fontsize=28:fontcolor=0xCCCCCC:` +
    `x=iw-text_w-40:y=ih-42:` +
    `alpha='if(lt(t\\,0.8)\\,0\\,if(lt(t\\,1.1)\\,(t-0.8)/0.3\\,0.85))'[out]`
  );

  const filterComplex = filters.join('; ');

  await new Promise((resolve, reject) => {
    let cmd = ffmpeg();
    imgPaths.forEach(p => cmd = cmd.input(p).inputOptions(['-loop 1', `-t ${LS_SLIDE + LS_FADE}`]));

    cmd
      .complexFilter(filterComplex)
      .outputOptions([
        '-map [out]',
        '-c:v libx264',
        '-preset fast',
        '-crf 22',
        `-t ${totalDur}`,
        '-pix_fmt yuv420p',
        '-movflags +faststart',
        `-r ${LS_FPS}`,
      ])
      .output(outputPath)
      .on('start', () => console.log('[Video] ⚙ Landscape FFmpeg encoding started…'))
      .on('progress', p => { if (p.percent) process.stdout.write(`\r[Video] ⏳ ${Math.round(p.percent)}%`); })
      .on('end', () => { process.stdout.write('\n'); console.log(`[Video] ✅ Landscape video ready: ${outputPath}`); resolve(outputPath); })
      .on('error', (err, _stdout, stderr) => {
        console.error('[Video] ❌ FFmpeg error:', err.message);
        if (stderr) console.error('[Video] stderr:', stderr.slice(-400));
        reject(err);
      })
      .run();
  });

  return outputPath;
}

/** Remove temp directory after upload */
function cleanupVideo(videoPath) {
  try {
    fs.rmSync(path.dirname(videoPath), { recursive: true, force: true });
    console.log('[Video] 🗑 Temp files cleaned up');
  } catch (e) {
    console.warn('[Video] Could not clean temp files:', e.message);
  }
}

module.exports = { createSlideshowVideo, createLandscapeVideo, cleanupVideo };
