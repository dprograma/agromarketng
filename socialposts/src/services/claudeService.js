/**
 * claudeService.js — powered by Groq
 * Model: openai/gpt-oss-120b — Meta Llama models on Groq now require an
 * Enterprise plan; GPT-OSS models are usable on standard accounts.
 * Fallback env var GROQ_MODEL lets you swap model without redeploying.
 * Current model list: https://console.groq.com/docs/models
 */

const axios = require('axios');
const siteConfig = require('./siteConfigService');

// Pricing (per 1M tokens) as of the models page above — cost per generation
// call is negligible at our volume (~1500-2500 output tokens per call):
//   openai/gpt-oss-120b — $0.15 in / $0.60 out, 500 t/s, best quality
//   openai/gpt-oss-20b  — $0.075 in / $0.30 out, 1000 t/s, faster/cheaper
const GROQ_MODEL   = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Minimum gap between calls — keeps us safely under 30 RPM free limit
const CALL_INTERVAL_MS = 6000;
let lastCallAt = 0;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Call Groq API with automatic throttling and retry on 429.
 */
async function generateWithRetry(prompt, attempt = 1) {
  // Throttle: enforce minimum gap between calls
  const elapsed = Date.now() - lastCallAt;
  if (elapsed < CALL_INTERVAL_MS) {
    const wait = CALL_INTERVAL_MS - elapsed;
    console.log(`[Groq] Throttling: waiting ${(wait / 1000).toFixed(1)}s…`);
    await sleep(wait);
  }

  const apiKey = process.env.GROQ_API_KEY || '';
  lastCallAt = Date.now();

  try {
    const response = await axios.post(GROQ_API_URL, {
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 2048,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      timeout: 60000,
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Groq returned empty response');
    return text;
  } catch (err) {
    const status = err.response?.status;
    const is429 = status === 429;
    if (is429 && attempt < 4) {
      // Respect Retry-After header if present, else back off exponentially
      const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '0', 10);
      const waitSec = retryAfter > 0 ? retryAfter + 1 : attempt * 15;
      console.warn(`[Groq] Rate limited. Retrying in ${waitSec}s (attempt ${attempt}/3)…`);
      await sleep(waitSec * 1000);
      return generateWithRetry(prompt, attempt + 1);
    }
    const errMsg = err.response?.data?.error?.message || err.message;
    throw new Error(`[Groq] ${status || ''} ${errMsg}`);
  }
}

/** Build the system prompt dynamically from DB/env config */
function buildSystemPrompt() {
  const cfg = siteConfig.getAll();
  return `You are a creative social media manager for ${cfg.site_name}.

About the website:
${cfg.site_concept}
Website: ${cfg.site_url}
Target audience: ${cfg.target_audience}
Post tone: ${cfg.post_tone}
Key topics: ${cfg.topics}

Your tone should feel human, warm, and authentic — like a real person who loves agriculture and the farming community, not a robot. Use local expressions (Nigerian/West African context), emojis where appropriate, and vary your writing style each time. Never repeat the same post structure twice. Mix short sentences with longer ones for rhythm.`;
}

const PLATFORM_SPECS = {
  facebook: {
    name: 'Facebook',
    maxChars: 500,
    instructions: `Write a Facebook post that is engaging and community-oriented.
    Use 2-4 short paragraphs. Include a compelling hook in the first line.
    Add 3-5 relevant hashtags at the end. Use emojis naturally (not excessively).
    Include a clear call-to-action (visit site, comment, share, tag a farmer friend, etc.).
    Character limit: 500 characters for the main body (hashtags extra).`,
  },
  twitter: {
    name: 'Twitter/X',
    maxChars: 280,
    instructions: `Write a punchy, attention-grabbing tweet.
    STRICT 280 character limit including hashtags, emojis and the URL.
    Replace the site URL with exactly the text: [SITE_URL]
    Be witty or thought-provoking. Use 1-3 hashtags max.
    Every character counts — make it snappy and shareable.`,
  },
  instagram: {
    name: 'Instagram',
    maxChars: 2200,
    instructions: `Write an Instagram caption with a STRONG emotional hook in the first 125 characters (critical — this is what shows before "more").
    Tell a mini-story or share a farming insight/tip.
    End with a question to drive comments.
    On a new line after the caption, add 15-25 targeted agriculture hashtags.
    Use emojis freely but naturally throughout.`,
  },
  linkedin: {
    name: 'LinkedIn',
    maxChars: 700,
    instructions: `Write a professional yet warm LinkedIn post.
    Share a business insight, success story, or agri-market opportunity.
    Bold opening statement. One or two paragraphs of real value.
    End with a thought-provoking question or CTA for agri-professionals/investors.
    Add 3-5 professional hashtags. Avoid corporate-speak; keep it human.`,
  },
  tiktok: {
    name: 'TikTok',
    maxChars: 300,
    instructions: `Write a short, trendy TikTok caption. Maximum 300 characters total.
    Energetic, casual, Gen-Z/millennial tone. Use hook language:
    "POV:", "Nobody talks about...", "Day in the life of...", "Things farmers won't tell you..."
    Include 5-8 trending hashtags: #fyp #foryoupage #agriculture #farming #nigeria
    Write as if narrating an exciting farming/market video scene.`,
  },
};

// ─── Theme bank ───────────────────────────────────────────────────────────────

const THEMES = [
  { theme: 'Fresh harvest season',         focus: 'fresh produce and grains now available on AgroMarket',            imageHint: 'farm harvest Nigeria' },
  { theme: 'Connecting farmers to buyers', focus: 'free classified listings bridging farmers and buyers directly',    imageHint: 'farmer market West Africa' },
  { theme: 'Agro equipment deals',         focus: 'affordable tractors, irrigation systems and farm tools',           imageHint: 'tractor farm equipment Africa' },
  { theme: 'Livestock marketplace',        focus: 'buying and selling cattle, poultry, goats and pigs',              imageHint: 'livestock cattle Nigeria' },
  { theme: 'Seeds and fertilizers',        focus: 'quality seeds and fertilizers ready for planting season',          imageHint: 'seeds planting agriculture' },
  { theme: 'Small farmer empowerment',     focus: 'how smallholder farmers grow income using the platform',           imageHint: 'small farmer africa smiling' },
  { theme: 'Crop market price update',     focus: 'current market prices for maize, cassava, yam, rice, tomatoes',   imageHint: 'grain market Nigeria price' },
  { theme: 'Agro business opportunity',    focus: 'entrepreneurship and investment in agribusiness in West Africa',   imageHint: 'agribusiness Africa investment' },
  { theme: 'Post a free ad today',         focus: 'encouraging users to post their first free classified ad',         imageHint: 'online marketplace mobile phone' },
  { theme: 'Fish farming & aquaculture',   focus: 'catfish, tilapia, shrimp listings and pond equipment',            imageHint: 'fish farming catfish Nigeria' },
  { theme: 'Poultry farming tips',         focus: 'day-old chicks, egg layers, broiler farms listings and tips',      imageHint: 'poultry farm chickens' },
  { theme: 'Organic produce spotlight',    focus: 'organic vegetables, herbs and natural farm products',              imageHint: 'organic vegetables farm fresh' },
  { theme: 'Agro logistics & storage',     focus: 'cold chain, warehousing and transport solutions for farmers',      imageHint: 'farm logistics storage warehouse' },
  { theme: 'Women in agriculture',         focus: 'celebrating female farmers and agro entrepreneurs in West Africa', imageHint: 'woman farmer Africa' },
  { theme: 'Youth in agribusiness',        focus: 'young people building profitable farming businesses',              imageHint: 'young farmer Africa technology' },
];

function pickRandomTheme(excludeTheme = null) {
  const pool = excludeTheme ? THEMES.filter(t => t.theme !== excludeTheme) : THEMES;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Core generation ──────────────────────────────────────────────────────────

/**
 * Generate posts for all 5 platforms in a single Groq call.
 */
async function generateAllPosts(overrideTheme = null) {
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'afternoon';
  const topic = overrideTheme
    ? { theme: overrideTheme, focus: overrideTheme, imageHint: overrideTheme }
    : pickRandomTheme();

  const systemPrompt = buildSystemPrompt();
  const userPrompt = `
Today's post session: ${timeOfDay} post
Theme: "${topic.theme}"
Focus angle: ${topic.focus}
Suggested image keywords: ${topic.imageHint}

Generate unique, human-like social media posts for ALL FIVE platforms.
Each post must feel tailored to that platform's culture — vary tone, structure, and angle as if different team members wrote each one.

Return ONLY a valid JSON object with this exact shape (no markdown fences, no text outside the JSON):
{
  "theme": "brief theme label",
  "imageKeywords": ["keyword1", "keyword2", "keyword3"],
  "posts": {
    "facebook":  { "content": "...", "hashtags": ["tag1","tag2"] },
    "twitter":   { "content": "...(max 280 chars including [SITE_URL] placeholder)", "hashtags": ["tag1"] },
    "instagram": { "content": "...", "hashtags": ["tag1","tag2","...up to 25"] },
    "linkedin":  { "content": "...", "hashtags": ["tag1","tag2"] },
    "tiktok":    { "content": "...(max 300 chars)", "hashtags": ["fyp","foryoupage","tag1"] }
  }
}

Platform requirements:
${Object.entries(PLATFORM_SPECS).map(([, v]) => `\n[${v.name}]\n${v.instructions}`).join('\n')}
`;

  const text = await generateWithRetry(`${systemPrompt}\n\n${userPrompt}`);
  return parseGroqJSON(text);
}

/**
 * Preview-only generation — does NOT save to DB or send email.
 */
async function previewGenerate(theme = null) {
  return generateAllPosts(theme);
}

/**
 * Regenerate one platform's post (improved / fresh take).
 */
async function regeneratePost(platform, currentContent, userNote = '') {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) throw new Error(`Unknown platform: ${platform}`);

  const systemPrompt = buildSystemPrompt();
  const userPrompt = `
Rewrite this ${spec.name} post. Make it noticeably different — fresher angle, new hook, different structure.
${userNote ? `Specific instruction from editor: "${userNote}"` : ''}

Current post:
"""
${currentContent}
"""

${spec.instructions}

Return ONLY a JSON object (no markdown fences):
{
  "content": "new post text",
  "hashtags": ["tag1", "tag2"]
}`;

  const text = await generateWithRetry(`${systemPrompt}\n\n${userPrompt}`);
  return parseGroqJSON(text);
}

/**
 * Generate a post from a custom user prompt (freeform).
 */
async function generateCustomPost(platform, userPrompt) {
  const spec = PLATFORM_SPECS[platform];
  if (!spec) throw new Error(`Unknown platform: ${platform}`);

  const systemPrompt = buildSystemPrompt();
  const prompt = `
Write a ${spec.name} post based on this brief from the editor:
"${userPrompt}"

${spec.instructions}

Return ONLY a JSON object:
{
  "content": "post text",
  "hashtags": ["tag1", "tag2"],
  "imageKeywords": ["keyword1", "keyword2"]
}`;

  const text = await generateWithRetry(`${systemPrompt}\n\n${prompt}`);
  return parseGroqJSON(text);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Walk the raw string character-by-character and escape any literal control
 * characters (newlines, carriage returns, tabs) that appear inside JSON string
 * values. LLMs sometimes emit real newlines inside strings which breaks JSON.parse.
 */
function sanitizeJSONControlChars(str) {
  let out = '';
  let inStr = false;
  let esc = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (esc)          { out += c; esc = false; continue; }
    if (c === '\\' && inStr) { out += c; esc = true;  continue; }
    if (c === '"')    { out += c; inStr = !inStr; continue; }
    if (inStr) {
      if (c === '\n') { out += '\\n'; continue; }
      if (c === '\r') { out += '\\r'; continue; }
      if (c === '\t') { out += '\\t'; continue; }
    }
    out += c;
  }
  return out;
}

function parseGroqJSON(raw) {
  const text = raw.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // First attempt: parse as-is
  try { return JSON.parse(text); } catch (_) {}

  // Second attempt: sanitize literal control chars inside strings, then retry
  try {
    return JSON.parse(sanitizeJSONControlChars(text));
  } catch (err) {
    console.error('[Groq] Raw response:', raw);
    throw new Error('Groq returned malformed JSON: ' + err.message);
  }
}

module.exports = {
  generateAllPosts,
  previewGenerate,
  regeneratePost,
  generateCustomPost,
  PLATFORM_SPECS,
  THEMES,
};
