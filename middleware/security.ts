import rateLimit from 'express-rate-limit';
import logger from '../lib/logger.ts';

// Global API Limiter: 100 requests every 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes',
    code: 429
  },
  handler: (req, res, next, options) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  }
});

// Auth Limiter: More strict for login/register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
    code: 429
  }
});

// Upload Limiter: Prevent spamming file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    error: 'Upload limit reached. Please try again later.',
    code: 429
  }
});

// Payment Limiter: Protect payment endpoints
export const paymentLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 10,
  message: {
    error: 'Too many transaction attempts. Please wait before trying again.',
    code: 429
  }
});
