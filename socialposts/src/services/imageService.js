const axios = require('axios');
const { db } = require('../config/database');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch one image for a keyword + platform combo.
 * Alternates randomly between Unsplash and Pexels (when both configured)
 * for a richer, more varied image selection. Falls back gracefully.
 */
async function fetchImage(keywords, platform = 'general') {
  const query      = buildQuery(keywords, platform);
  const hasUnsplash = !!process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key';
  const hasPexels   = !!process.env.PEXELS_API_KEY      && process.env.PEXELS_API_KEY      !== 'your_pexels_api_key';

  // Both available — pick randomly for variety
  if (hasUnsplash && hasPexels) {
    const primary   = Math.random() < 0.5 ? 'unsplash' : 'pexels';
    const secondary = primary === 'unsplash' ? 'pexels' : 'unsplash';
    try {
      return primary === 'unsplash' ? await fromUnsplash(query) : await fromPexels(query);
    } catch (e) {
      console.warn(`[Image] ${primary} failed, trying ${secondary}:`, e.message);
      try {
        return secondary === 'unsplash' ? await fromUnsplash(query) : await fromPexels(query);
      } catch (e2) { console.warn(`[Image] ${secondary} also failed:`, e2.message); }
    }
    return staticFallback(keywords);
  }

  // Only one source available
  try {
    if (hasUnsplash) return await fromUnsplash(query);
  } catch (e) { console.warn('[Image] Unsplash failed:', e.message); }

  try {
    if (hasPexels) return await fromPexels(query);
  } catch (e) { console.warn('[Image] Pexels failed:', e.message); }

  return staticFallback(keywords);
}

/**
 * Fetch a grid of N images for a keyword (for the image picker UI).
 * Uses cache to avoid hitting the API on every request.
 */
async function fetchImageGrid(keywords, count = 6) {
  const query    = buildQuery(keywords, 'general');
  const cacheKey = `grid:${query}:${count}`;

  const cached = db.prepare(
    `SELECT results, created_at FROM image_cache WHERE id = ?`
  ).get(cacheKey);

  if (cached) {
    const age = Date.now() - new Date(cached.created_at).getTime();
    if (age < CACHE_TTL_MS) return JSON.parse(cached.results);
  }

  let images = [];
  const hasUnsplash = !!process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key';
  const hasPexels   = !!process.env.PEXELS_API_KEY      && process.env.PEXELS_API_KEY      !== 'your_pexels_api_key';

  // Fetch from both sources in parallel and merge for a richer grid
  const half = Math.ceil(count / 2);
  const [unsplashResults, pexelsResults] = await Promise.allSettled([
    hasUnsplash ? gridFromUnsplash(query, half) : Promise.resolve([]),
    hasPexels   ? gridFromPexels(query, half)   : Promise.resolve([]),
  ]);

  const fromU = unsplashResults.status === 'fulfilled' ? unsplashResults.value : [];
  const fromP = pexelsResults.status   === 'fulfilled' ? pexelsResults.value   : [];

  // Interleave results: U, P, U, P… for variety
  const maxLen = Math.max(fromU.length, fromP.length);
  for (let i = 0; i < maxLen; i++) {
    if (fromU[i]) images.push(fromU[i]);
    if (fromP[i]) images.push(fromP[i]);
  }
  images = images.slice(0, count);

  if (images.length === 0) {
    images = Array.from({ length: count }, (_, i) => staticFallback([keywords, String(i)].flat()));
  }

  db.prepare(`
    INSERT INTO image_cache (id, query, results, created_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET results = excluded.results, created_at = excluded.created_at
  `).run(cacheKey, query, JSON.stringify(images));

  return images;
}

// ─── Unsplash ─────────────────────────────────────────────────────────────────

async function fromUnsplash(query) {
  const res = await axios.get('https://api.unsplash.com/search/photos', {
    params:  { query, per_page: 10, orientation: 'landscape', content_filter: 'high' },
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    timeout: 8000,
  });
  const photos = res.data.results;
  if (!photos?.length) throw new Error('No Unsplash results');
  const pick = photos[Math.floor(Math.random() * Math.min(5, photos.length))];
  return buildUnsplashResult(pick);
}

async function gridFromUnsplash(query, count) {
  const res = await axios.get('https://api.unsplash.com/search/photos', {
    params:  { query, per_page: count, orientation: 'landscape', content_filter: 'high' },
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    timeout: 8000,
  });
  return (res.data.results || []).map(buildUnsplashResult);
}

function buildUnsplashResult(p) {
  return {
    url:       p.urls.regular,
    thumb:     p.urls.small,
    alt:       p.alt_description || 'agriculture',
    credit:    `Photo by ${p.user.name} on Unsplash`,
    creditUrl: `${p.user.links.html}?utm_source=socialposts&utm_medium=referral`,
    source:    'unsplash',
    width:     p.width,
    height:    p.height,
    color:     p.color,
  };
}

// ─── Pexels ───────────────────────────────────────────────────────────────────

async function fromPexels(query) {
  const res = await axios.get('https://api.pexels.com/v1/search', {
    params:  { query, per_page: 10, orientation: 'landscape' },
    headers: { Authorization: process.env.PEXELS_API_KEY },
    timeout: 8000,
  });
  const photos = res.data.photos;
  if (!photos?.length) throw new Error('No Pexels results');
  const pick = photos[Math.floor(Math.random() * Math.min(5, photos.length))];
  return buildPexelsResult(pick);
}

async function gridFromPexels(query, count) {
  const res = await axios.get('https://api.pexels.com/v1/search', {
    params:  { query, per_page: count, orientation: 'landscape' },
    headers: { Authorization: process.env.PEXELS_API_KEY },
    timeout: 8000,
  });
  return (res.data.photos || []).map(buildPexelsResult);
}

function buildPexelsResult(p) {
  return {
    url:       p.src.large2x,
    thumb:     p.src.medium,
    alt:       p.alt || 'agriculture',
    credit:    `Photo by ${p.photographer} on Pexels`,
    creditUrl: p.photographer_url,
    source:    'pexels',
    width:     p.width,
    height:    p.height,
  };
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function staticFallback(keywords) {
  const kw      = Array.isArray(keywords) ? keywords[0] : keywords;
  const encoded = encodeURIComponent(kw || 'agriculture farm Nigeria');
  console.warn(`[Image] ⚠ Using fallback — both Unsplash & Pexels unavailable. Check API keys in env vars.`);
  // Use Pexels stock photo search URL (direct hotlink to a known agriculture image)
  return {
    url:       `https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=1200`,
    thumb:     `https://images.pexels.com/photos/2132250/pexels-photo-2132250.jpeg?auto=compress&cs=tinysrgb&w=400`,
    alt:       kw || 'Agriculture',
    credit:    'Photo from Pexels',
    creditUrl: 'https://www.pexels.com',
    source:    'fallback',
  };
}

// ─── Multi-platform fetch ─────────────────────────────────────────────────────

async function fetchImagesForAllPlatforms(keywords) {
  const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'];
  const results   = {};
  await Promise.allSettled(
    platforms.map(async (p) => {
      try { results[p] = await fetchImage(keywords, p); }
      catch (e) { results[p] = staticFallback(keywords); }
    })
  );
  return results;
}

// ─── Query builder ────────────────────────────────────────────────────────────

function buildQuery(keywords, platform) {
  const base     = Array.isArray(keywords) ? keywords.slice(0, 3).join(' ') : (keywords || '');
  const agriWords= ['farm', 'agri', 'crop', 'livestock', 'harvest', 'market'];
  const hasAgri  = agriWords.some(w => base.toLowerCase().includes(w));
  return `${base}${hasAgri ? '' : ' agriculture'}`.trim();
}

module.exports = { fetchImage, fetchImagesForAllPlatforms, fetchImageGrid };
