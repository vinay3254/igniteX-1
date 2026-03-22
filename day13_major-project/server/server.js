// server.js — EtherX Shop Express Server (MongoDB + EmailJS)
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const mongoose = require('mongoose');
const { connectDB }   = require('./db');
const { initEmailJS } = require('./utils/email');

// ── Import routes
const authRoutes       = require('./routes/auth');
const productRoutes    = require('./routes/products');
const cartRoutes       = require('./routes/cart');
const wishlistRoutes   = require('./routes/wishlist');
const newsletterRoutes = require('./routes/newsletter');
const orderRoutes      = require('./routes/orders');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────────────────────────
//  EMAILJS — initialise and attach sendEmail helper to app.locals
// ─────────────────────────────────────────────────────────────
app.locals.sendEmail = initEmailJS();

// ─────────────────────────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001', 'null'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ── Request logger (dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const ts = new Date().toISOString().slice(11, 23);
      console.log(`[${ts}] ${req.method.padEnd(6)} ${req.path}`);
    }
    next();
  });
}

// ─────────────────────────────────────────────────────────────
//  API ROUTES
// ─────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/orders',     orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'EtherX Shop API',
    version:   '2.0.0',
    database:  mongoose.connection.readyState === 1 ? 'mongodb:connected' : 'mongodb:disconnected',
    emailjs:   !!app.locals.sendEmail,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────────────────────
//  API 404
// ─────────────────────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ─────────────────────────────────────────────────────────────
//  SPA Fallback — serve index.html for non-API routes
// ─────────────────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─────────────────────────────────────────────────────────────
//  GLOBAL ERROR HANDLER
// ─────────────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─────────────────────────────────────────────────────────────
//  CONNECT MONGODB → THEN START SERVER
// ─────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────┐');
    console.log(`  │   EtherX Shop API  🚀  http://localhost:${PORT} │`);
    console.log('  ├─────────────────────────────────────────┤');
    console.log('  │   Database : MongoDB                    │');
    console.log(`  │   EmailJS  : ${app.locals.sendEmail ? 'enabled ✅ ' : 'disabled ⚠️ '}                  │`);
    console.log('  ├─────────────────────────────────────────┤');
    console.log('  │   Endpoints:                            │');
    console.log('  │   POST  /api/auth/register              │');
    console.log('  │   POST  /api/auth/login                 │');
    console.log('  │   GET   /api/auth/me                    │');
    console.log('  │   GET   /api/products                   │');
    console.log('  │   GET   /api/products/:id               │');
    console.log('  │   GET   /api/products/categories        │');
    console.log('  │   GET   /api/cart         (auth)        │');
    console.log('  │   POST  /api/cart         (auth)        │');
    console.log('  │   PUT   /api/cart/:id     (auth)        │');
    console.log('  │   DELETE /api/cart/:id   (auth)        │');
    console.log('  │   GET   /api/wishlist     (auth)        │');
    console.log('  │   POST  /api/wishlist/:id (auth)        │');
    console.log('  │   POST  /api/newsletter/subscribe       │');
    console.log('  │   GET   /api/orders       (auth)        │');
    console.log('  │   POST  /api/orders       (auth)        │');
    console.log('  └─────────────────────────────────────────┘');
    console.log('');
  });
}).catch(err => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
