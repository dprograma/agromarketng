require('dotenv').config();

const express    = require('express');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const { initializeDatabase }  = require('./src/config/database');
const { startScheduler }      = require('./src/services/schedulerService');
const postRoutes              = require('./src/routes/postRoutes');
const settingsRoutes          = require('./src/routes/settingsRoutes');
const authRoutes              = require('./src/routes/authRoutes');

const app  = express();
app.set('trust proxy', 1); // Render uses a reverse proxy — trust first hop
// Railway injects $PORT dynamically; fall back to APP_PORT then 3000
const PORT = parseInt(process.env.PORT || process.env.APP_PORT || '3000', 10);

// ─── Rate limiters ────────────────────────────────────────────────────────────

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max:      60,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Too many requests. Please wait.' },
});

// Stricter limiter for Claude-powered generation endpoints
const generateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max:      5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { ok: false, error: 'Too many generation requests. Please wait 10 minutes.' },
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Request logger (API only)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (!req.path.startsWith('/api')) return;
    const ms  = Date.now() - start;
    const col = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${col}[${new Date().toISOString()}] ${req.method} ${req.path} → ${res.statusCode} (${ms}ms)\x1b[0m`);
  });
  next();
});

// Apply rate limiters
app.use('/api', generalLimiter);
app.use('/api/generate', generateLimiter);
app.use('/api/preview',  generateLimiter);
app.use('/api/posts',    rateLimit({
  windowMs: 60 * 1000, max: 30,
  message: { ok: false, error: 'Too many post requests.' },
}));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api', postRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/auth', authRoutes);

// ─── Frontend page routes ─────────────────────────────────────────────────────

// Review page (handles both /review/<JWT-token> and /review/batch-<id>)
app.get('/review/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'review.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/', (req, res) => res.redirect('/dashboard'));

app.get('/terms',   (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));

// Simple health check for Railway/Render (always responds 200)
app.get('/health', (req, res) => res.json({ ok: true, status: 'running' }));

// ─── Global error handler ─────────────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({ ok: false, error: err.message || 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: 'Route not found' });
});

// ─── Boot ─────────────────────────────────────────────────────────────────────

async function boot() {
  initializeDatabase();
  startScheduler();

  app.listen(PORT, '0.0.0.0', () => {
    const divider = '═'.repeat(55);
    console.log(`
\x1b[32m╔${divider}╗
║  🌾  ${(process.env.SITE_NAME || 'AgroMarket').padEnd(20)} Social Post Manager        ║
╠${divider}╣
║  Server :  http://localhost:${PORT}${' '.repeat(Math.max(0, 27 - PORT.toString().length))}║
║  Dashboard:  http://localhost:${PORT}/dashboard${' '.repeat(Math.max(0, 19 - PORT.toString().length))}║
║  Settings:   http://localhost:${PORT}/settings${' '.repeat(Math.max(0, 20 - PORT.toString().length))}║
║  Schedules:  07:00 WAT  &  12:00 WAT (daily)         ║
╚${divider}╝\x1b[0m`);
  });
}

boot().catch(err => {
  console.error('\x1b[31m[Boot] Fatal error:\x1b[0m', err);
  process.exit(1);
});
