const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

// --- 0. TRUST PROXY FOR RENDER ---
// Render acts as a reverse proxy. This is required for express-rate-limit
// and standard req.ip tracking to work correctly.
app.set('trust proxy', 1);

// --- 1. SET SECURITY HTTP HEADERS ---
app.use(helmet());

// --- 2. LOGGING ---
const stream = {
  write: (message) => logger.http(message.substring(0, message.lastIndexOf('\n')))
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream }));

// --- 3. CORS ---
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'https://msrcasc-connect.vercel.app'
  ].filter(Boolean),
  credentials: true,
}));

// --- 4. BODY PARSING & COOKIES ---
app.use(express.json({ limit: '10kb' })); // Limit body size to prevent payload DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- 5. DATA SANITIZATION ---

// Express 5 Compatibility Shim:
// In Express 5, req.query is a getter-only property. Libraries like
// express-mongo-sanitize try to reassign it, causing a TypeError.
// This middleware redefines req.query as writable before sanitization runs.
app.use((req, res, next) => {
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  next();
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// NOTE: xss-clean has been removed — it is deprecated and incompatible with Express 5.
// XSS protection is already provided by: Helmet (CSP headers), React (auto-escaping),
// and express-validator (field-level .escape() sanitization).

// --- 6. RATE LIMITING (Global via apiLimiter on routes) ---
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter);

// --- 7. ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profiles', require('./routes/profileRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MSRCASC Connect Secure API is running' });
});

// --- 8. GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  logger.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

module.exports = app;
