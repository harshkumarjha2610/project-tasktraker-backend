require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const helmet       = require('helmet');
const connectDB    = require('./src/config/db');
const taskRoutes   = require('./src/routes/tasks');
const noteRoutes   = require('./src/routes/noteRoutes');
const errorHandler = require('./src/middleware/errorHandler');

// ── Create Express app ─────────────────────────────────────────
const app = express();

// ── Ensure MongoDB is connected for every request ──────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// ── Security & middleware ──────────────────────────────────────
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DailyTask API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API routes ─────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);

// ── 404 handler ────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ───────────────────────────────────────
app.use(errorHandler);

// ── Start server (Local only) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`\n🚀  DailyTask API running on http://localhost:${PORT}`);
    console.log(`📡  Environment : ${process.env.NODE_ENV}`);
    console.log(`🌐  CORS origin : ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received – shutting down gracefully');
    server.close(() => process.exit(0));
  });
}

// Export for Vercel Serverless Functions
module.exports = app;
