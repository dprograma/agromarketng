const { db } = require('../config/database');

const DEFAULTS = {
  site_name:    process.env.SITE_NAME    || 'AgroMarket',
  site_concept: process.env.SITE_CONCEPT || 'A classified marketplace for agricultural products and services.',
  site_url:     process.env.SITE_URL     || 'https://youragromarket.com',
  post_tone:    'warm, human, community-driven',
  topics:       'fresh produce, grains, livestock, equipment, seeds, fertilizers, fish farming, agro business',
  target_audience: 'farmers, agro dealers, buyers, sellers of agricultural products across Nigeria and West Africa',
};

/** Read a config value — DB first, then .env default. */
function get(key) {
  const row = db.prepare('SELECT value FROM site_config WHERE key = ?').get(key);
  return row ? row.value : (DEFAULTS[key] || null);
}

/** Read all config values as a single object. */
function getAll() {
  const rows = db.prepare('SELECT key, value FROM site_config').all();
  const dbMap = {};
  rows.forEach(r => { dbMap[r.key] = r.value; });
  return { ...DEFAULTS, ...dbMap };
}

/** Write a config value to DB. */
function set(key, value) {
  db.prepare(`
    INSERT INTO site_config (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, value);
}

/** Write many config values at once. */
function setMany(obj) {
  const upsert = db.prepare(`
    INSERT INTO site_config (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  const transaction = db.transaction((entries) => {
    for (const [key, value] of entries) upsert.run(key, String(value));
  });
  transaction(Object.entries(obj));
}

module.exports = { get, getAll, set, setMany };
