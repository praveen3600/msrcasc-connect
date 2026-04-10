const rateLimit = require('express-rate-limit');

// General API Endpoints Limit (60 req / min)
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Authentication Limit (5 req / min)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again after a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account Creation Limit (5 req / hour)
const accountCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Too many accounts created from this IP, please try again after an hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoints Limit (20 req / min) - Assuming quota managed elsewhere
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: {
    success: false,
    message: 'AI rate limit exceeded for this IP, please wait a minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  accountCreationLimiter,
  aiLimiter
};
