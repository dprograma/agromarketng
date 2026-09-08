const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Use persistent volume path on cloud platforms, fallback to local ./data
// Note: RENDER without a disk — use app directory (writable), not /data
const DATA_DIR = process.env.DATA_DIR
  || process.env.RAILWAY_VOLUME_MOUNT_PATH
  || path.join(__dirname, '../../data');

const DB_PATH = path.join(DATA_DIR, 'socialposts.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDatabase() {
  db.exec(`
    -- Stores each scheduled run (one batch = one cron trigger)
    CREATE TABLE IF NOT EXISTS post_batches (
      id          TEXT PRIMARY KEY,
      scheduled_at TEXT NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now')),
      status      TEXT NOT NULL DEFAULT 'pending',
      -- 'pending' | 'approved' | 'partially_approved' | 'rejected' | 'sent'
      token       TEXT NOT NULL UNIQUE,
      token_expires_at TEXT NOT NULL,
      approved_at TEXT,
      sent_at     TEXT,
      notes       TEXT
    );

    -- Individual platform post within a batch
    CREATE TABLE IF NOT EXISTS posts (
      id          TEXT PRIMARY KEY,
      batch_id    TEXT NOT NULL REFERENCES post_batches(id) ON DELETE CASCADE,
      platform    TEXT NOT NULL,
      -- 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok'
      content     TEXT NOT NULL,
      hashtags    TEXT,
      image_url   TEXT,
      image_alt   TEXT,
      image_credit TEXT,
      status      TEXT NOT NULL DEFAULT 'pending',
      -- 'pending' | 'approved' | 'skipped' | 'posted' | 'failed'
      posted_at   TEXT,
      post_id     TEXT,
      error       TEXT,
      edited_content TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Social media account credentials (sensitive - store access tokens)
    CREATE TABLE IF NOT EXISTS social_accounts (
      id           TEXT PRIMARY KEY,
      platform     TEXT NOT NULL UNIQUE,
      display_name TEXT,
      access_token TEXT,
      token_secret TEXT,
      account_id   TEXT,
      extra        TEXT,
      -- JSON blob for platform-specific fields
      is_active    INTEGER NOT NULL DEFAULT 1,
      updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Audit log for all posting activity
    CREATE TABLE IF NOT EXISTS activity_log (
      id         TEXT PRIMARY KEY,
      event      TEXT NOT NULL,
      platform   TEXT,
      post_id    TEXT,
      batch_id   TEXT,
      details    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Key-value store for site config (editable from UI)
    CREATE TABLE IF NOT EXISTS site_config (
      key        TEXT PRIMARY KEY,
      value      TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Image search cache to avoid redundant API calls
    CREATE TABLE IF NOT EXISTS image_cache (
      id         TEXT PRIMARY KEY,
      query      TEXT NOT NULL,
      results    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log('[DB] Database initialized at', DB_PATH);
}

module.exports = { db, initializeDatabase };
