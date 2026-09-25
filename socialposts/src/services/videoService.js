/**
 * videoService.js — Creates professional slideshow videos for TikTok
 *
 * Features:
 *  - Stronger Ken Burns zoom/pan with directional variety per slide
 *  - Rotating xfade transition styles (not just plain fade) for energy
 *  - Color grading (contrast/saturation boost + vignette) for a produced look
 *  - Smooth crossfade transitions between slides
 *  - Semi-transparent gradient overlay for text readability
 *  - Animated caption text (slide-up + fade-in per line)
 *  - Hashtag row at bottom
 *  - AgroMarket brand watermark at top
 *  - 9:16 portrait format (1080x1920) at 25fps
 */

const fs      = require('fs');
const os      = require('os');
const path    = require('path');
const axios   = require('axios');
const ffmpeg  = require('fluent-ffmpeg');
const { execSync } = require('child_process');

const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

/**
 * @ffmpeg-installer/ffmpeg bundles a static binary from 2018 that predates
 * filters like `xfade` (added in ffmpeg 4.3, mid-2020) — used below for
 * slide transitions. Prefer a system-installed ffmpeg (see Dockerfile,
 * `apk add ffmpeg`) when available; fall back to the bundled binary
 * otherwise (e.g. local dev machines without ffmpeg installed).
 */
function resolveFfmpegPath() {
  try {
    const systemPath = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
    if (systemPath) return systemPath;
  } catch (_) { /* system ffmpeg not found — fall back below */ }
  return ffmpegInstaller.path;
}

ffmpeg.setFfmpegPath(resolveFfmpegPath());

// ─── Constants ────────────────────────────────────────────────────────────────

// Kept deliberately light for free-tier hosts (Render/Railway) — see the
// identical note on createLandscapeVideo's constants below for why.
// Slightly shorter slides than before (4s not 5s) for snappier, more
// energetic pacing — this is also a small performance win (fewer total
// frames), not a cost, since fewer seconds at the same fps means less work.
const SLIDE_DURATION = 4;      // seconds per image
const FADE_DURATION  = 0.7;    // xfade crossfade duration (seconds)
const VIDEO_WIDTH    = 720;
const VIDEO_HEIGHT   = 1280;   // 9:16 portrait
const FPS            = 15;
const FRAMES         = SLIDE_DURATION * FPS; // frames per slide

// Rotating set of xfade transitions — cycling through these instead of always
// "fade" makes the slideshow feel like an edited video rather than a static
// PowerPoint. All lightweight, well-established ffmpeg xfade transitions.
const TRANSITIONS = ['fade', 'wiperight', 'slideleft', 'circleopen', 'smoothleft', 'radial'];
function pickTransition(i) {
  return TRANSITIONS[i % TRANSITIONS.length];
}

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

  // Per-slide: scale → crop → Ken Burns zoompan → color grade → setpts
  imgPaths.forEach((_, i) => {
    const zoomIn = i % 2 === 0;
    // Stronger zoom range (20% vs previous 12%) for more noticeable motion.
    // Even slides zoom in from center, odd slides zoom out.
    const zExpr = zoomIn
      ? `min(zoom+0.0033,1.20)`
      : `if(lte(on\\,1)\\,1.20\\,max(zoom-0.0033\\,1.0))`;
    // Pan direction rotates through 4 corners for more visual variety than
    // a simple alternation
    const panSet = i % 4;
    const xExpr = panSet < 2 ? `iw/2-(iw/zoom/2)` : (panSet === 2 ? `iw/6-(iw/zoom/6)` : `iw*5/6-(iw/zoom/2)`);
    const yExpr = i % 3 === 0 ? `ih/2-(ih/zoom/2)` : (i % 3 === 1 ? `ih/6-(ih/zoom/6)` : `ih*5/6-(ih/zoom/2)`);

    filters.push(
      `[${i}:v]` +
      `scale=${Math.round(VIDEO_WIDTH * 1.3)}:${Math.round(VIDEO_HEIGHT * 1.3)}:force_original_aspect_ratio=increase,` +
      `crop=${VIDEO_WIDTH}:${VIDEO_HEIGHT},` +
      `setsar=1,` +
      `zoompan=z='${zExpr}':d=${FRAMES}:x='${xExpr}':y='${yExpr}':s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=${FPS},` +
      // Color grade: punchier contrast/saturation than a flat source photo,
      // plus a subtle vignette to draw the eye toward center — both are
      // cheap per-pixel filters, negligible CPU cost added
      `eq=contrast=1.08:saturation=1.3:brightness=0.02,` +
      `vignette=PI/5,` +
      `setpts=PTS-STARTPTS` +
      `[z${i}]`
    );
  });

  // xfade chain between slides — rotating transition styles instead of
  // always plain fade, so it reads as an edited video, not a slideshow
  if (n === 1) {
    filters.push(`[z0]copy[base]`);
  } else {
    let prev = '[z0]';
    for (let i = 1; i < n; i++) {
      const offset   = (i * SLIDE_DURATION) - FADE_DURATION;
      const outLabel = i === n - 1 ? '[base]' : `[xf${i}]`;
      filters.push(`${prev}[z${i}]xfade=transition=${pickTransition(i - 1)}:duration=${FADE_DURATION}:offset=${offset}${outLabel}`);
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

  // Brand watermark — top center. Appears instantly (no fade delay) since
  // this is the critical first-impression moment before someone scrolls past
  addText(
    current,
    '[wm]',
    `text='${esc(brandText)}'${fontArg}:` +
    `fontsize=40:fontcolor=white:` +
    `box=1:boxcolor=0x22772288:boxborderw=18:` +
    `x=(w-text_w)/2:y=60:` +
    `alpha=1`
  );
  current = '[wm]';

  // Caption lines — stacked above hashtags, slide up + fade in together
  // for a motion-graphics feel instead of a flat fade
  const lineH     = 62;
  const hashH     = 80; // space reserved for hashtags at bottom
  const blockH    = lines.length * lineH;
  const blockTop  = VIDEO_HEIGHT - hashH - blockH - 40;

  lines.forEach((lineText, i) => {
    const y         = blockTop + i * lineH;
    const fadeStart = 0.4 + i * 0.18;
    const fadeEnd   = fadeStart + 0.35;
    const dur       = (fadeEnd - fadeStart).toFixed(2);
    const outLabel  = `[cl${i}]`;
    addText(
      current,
      outLabel,
      `text='${esc(lineText)}'${fontArg}:` +
      `fontsize=52:fontcolor=white:` +
      `box=1:boxcolor=0x00000088:boxborderw=12:` +
      `x=(w-text_w)/2:y=${y}+20*(1-clip((t-${fadeStart})/${dur}\\,0\\,1)):` +
      `alpha='if(lt(t\\,${fadeStart})\\,0\\,if(lt(t\\,${fadeEnd})\\,(t-${fadeStart})/${dur}\\,1))'`
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
        '-preset ultrafast',
        '-crf 26',
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
  // Kept deliberately light — free-tier hosts (Render/Railway) give a
  // fraction of a shared vCPU and ~512MB RAM. 1920x1080@25fps with zoompan
  // + xfade + multiple drawtext filters took 2.5+ minutes for a single
  // 5s slide on Render free tier and got OOM-killed/restarted mid-encode
  // before finishing. 720p@15fps + ultrafast preset cuts pixel count ~65%
  // and frame count ~40%, bringing this back into free-tier territory.
  const LS_WIDTH  = 1280;
  const LS_HEIGHT = 720;
  const LS_FPS    = 15;
  const LS_SLIDE  = 4;   // seconds per image — matches TikTok's snappier pacing
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

  // Ken Burns per slide — stronger zoom range (15%, up from 8%) plus
  // directional pan variety (previously always centered, no drift at all)
  imgPaths.forEach((_, i) => {
    const zoomIn = i % 2 === 0;
    const zExpr  = zoomIn
      ? `min(zoom+0.0025,1.15)`
      : `if(lte(on\\,1)\\,1.15\\,max(zoom-0.0025\\,1.0))`;
    const panSet = i % 4;
    const xExpr  = panSet < 2 ? `iw/2-(iw/zoom/2)` : (panSet === 2 ? `iw/6-(iw/zoom/6)` : `iw*5/6-(iw/zoom/2)`);
    const yExpr  = i % 2 === 0 ? `ih/2-(ih/zoom/2)` : `ih/3-(ih/zoom/3)`;
    filters.push(
      `[${i}:v]` +
      `scale=${Math.round(LS_WIDTH * 1.3)}:${Math.round(LS_HEIGHT * 1.3)}:force_original_aspect_ratio=increase,` +
      `crop=${LS_WIDTH}:${LS_HEIGHT},setsar=1,` +
      `zoompan=z='${zExpr}':d=${LS_FRAMES}:x='${xExpr}':y='${yExpr}':s=${LS_WIDTH}x${LS_HEIGHT}:fps=${LS_FPS},` +
      // Color grade + vignette — same cheap per-pixel treatment as TikTok
      `eq=contrast=1.08:saturation=1.3:brightness=0.02,` +
      `vignette=PI/5,` +
      `setpts=PTS-STARTPTS[z${i}]`
    );
  });

  // xfade chain — rotating transition styles instead of always plain fade
  if (n === 1) {
    filters.push(`[z0]copy[base]`);
  } else {
    let prev = '[z0]';
    for (let i = 1; i < n; i++) {
      const offset   = i * LS_SLIDE - LS_FADE;
      const outLabel = i === n - 1 ? '[base]' : `[xf${i}]`;
      filters.push(`${prev}[z${i}]xfade=transition=${pickTransition(i - 1)}:duration=${LS_FADE}:offset=${offset}${outLabel}`);
      prev = `[xf${i}]`;
    }
  }

  // Dark gradient overlay at bottom 25%
  filters.push(
    `[base]drawbox=x=0:y=ih*0.75:w=iw:h=ih*0.25:color=0x000000@0.6:t=fill[ov]`
  );

  // Brand watermark — bottom-left, instant appear (first-impression moment)
  const brandText = esc(process.env.SITE_NAME || 'AgroMarket Nigeria');
  filters.push(
    `[ov]drawtext=text='${brandText}'${fontArg}:` +
    `fontsize=36:fontcolor=white:` +
    `x=40:y=${LS_HEIGHT - 70}:` +
    `alpha=1[wm]`
  );

  // Site URL — bottom-right
  const siteUrl = esc(process.env.SITE_URL || 'www.agromarketng.com');
  filters.push(
    `[wm]drawtext=text='${siteUrl}'${fontArg}:` +
    `fontsize=28:fontcolor=0xCCCCCC:` +
    `x=w-text_w-40:y=${LS_HEIGHT - 42}:` +
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
        '-preset ultrafast',
        '-crf 26',
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
