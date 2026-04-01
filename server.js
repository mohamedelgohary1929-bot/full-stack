require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const morgan     = require('morgan');

const connectDB      = require('./farmlink/config/db');
const authRoutes     = require('./farmlink/routes/authRoutes');
const productRoutes  = require('./farmlink/routes/productRoutes');
const orderRoutes    = require('./farmlink/routes/orderRoutes');
const errorHandler   = require('./farmlink/middlewares/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Security & Parsing ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FarmLink API is running' });
});

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅  Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

server.on('error', (err) => {
  console.error('❌  Server error:', err);
  process.exit(1);
});