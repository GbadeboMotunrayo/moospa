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

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ──
// CSP disabled: this server also serves the React build, which loads
// Google Fonts + Google Analytics from external origins.
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ──
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ──
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' }));

// ── Body parsing
// Paystack webhook needs raw body for signature verification
app.use('/api/paystack/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ──
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/sales',    salesRoutes);

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
