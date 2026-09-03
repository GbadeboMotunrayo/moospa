require('dotenv').config();
const path      = require('path');
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const productRoutes  = require('./routes/products');
const orderRoutes    = require('./routes/orders');
const bookingRoutes  = require('./routes/bookings');
const paystackRoutes = require('./routes/paystack');
const uploadRoutes   = require('./routes/upload');
const salesRoutes    = require('./routes/sales');
const dispatchRoutes = require('./routes/dispatch');
const spaServiceRoutes = require('./routes/spa-services');
const telegramRoutes = require('./routes/telegram');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ──
// CSP disabled: this server also serves the React build, which loads
// Google Fonts + Google Analytics from external origins.
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──
// The API also serves the storefront from the same origin, so same-origin calls
// never hit CORS. This reflects the request's own origin (plus localhost for
// dev) so an admin panel opened from any of the site's own domains still works,
// instead of being pinned to a single FRONTEND_URL.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://houseofmoo.shop',
  'https://www.houseofmoo.shop',
  'http://localhost:3000',
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // Allow any houseofmoo.shop subdomain, otherwise fall back to same-origin only.
    if (/\.houseofmoo\.shop$/.test(new URL(origin).hostname)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Telegram webhooks ──
// Mounted BEFORE the rate limiter on purpose. 200 requests per 15 minutes is a
// sensible cap for storefront traffic and far too low for a busy group — and a
// throttled webhook isn't just a dropped message, it's one Telegram will retry
// in a loop. These endpoints authenticate with a shared secret header instead
// (see routes/telegram.js), so they don't need the limiter's protection.
// Carries its own body parser because express.json() is registered further down.
app.use('/api/telegram', express.json({ limit: '1mb' }), telegramRoutes);

// ── Rate limiting ──
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));

// ── Body parsing
// Paystack webhook needs raw body for signature verification
app.use('/api/paystack/webhook', express.raw({ type: 'application/json' }));
// strict:false so a bare JSON number/string body still parses instead of 400ing
app.use(express.json({ limit: '10mb', strict: false }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/sales',    salesRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/spa-services', spaServiceRoutes);

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'House of Moo API', time: new Date().toISOString() });
});

// ── 404 for unmatched API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Serve the built React frontend (single-page app, no client-side router) ──
// build/ lives inside server/ so this whole folder is one self-contained deploy unit
const buildDir = path.join(__dirname, 'build');
app.use(express.static(buildDir));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`\n  House of Moo API running on http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
