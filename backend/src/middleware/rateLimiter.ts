import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Global rate limiter: Applies to all API routes to prevent spam scripts & DDoS
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 300, // Max 300 requests per 15 minutes per IP
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req: Request) => {
    // Do not rate limit health check endpoints
    const path = req.originalUrl || req.url || '';
    return path.includes('/health');
  },
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  handler: (_req: Request, res: Response, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});

// Stricter rate limiter for authentication routes (login / brute force prevention)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 15, // Max 15 login attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  handler: (_req: Request, res: Response, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
