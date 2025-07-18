const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { ApiError } = require('./errorHandler');

/**
 * Rate limiting middleware to prevent API abuse
 * Configures different rate limits for various endpoints
 */

// Helper function to create a consistent rate limiter with custom options
const createRateLimiter = (options) => {
  const defaultOptions = {
    // Standard response for rate-limited requests
    handler: (req, res, next) => {
      next(new ApiError('Too many requests, please try again later', 429));
    },
    // Enable support for X-Forwarded-For header for proxied setups
    trustProxy: true,
    // Standardized headers in the HTTP spec
    standardHeaders: true,
    // Skip the legacy headers (X-RateLimit-*)
    legacyHeaders: false
  };

  // If Redis client is available, use Redis store for distributed rate limiting
  // This supports horizontal scaling of your API servers
  if (process.env.REDIS_URL) {
    try {
      const Redis = require('ioredis');
      const redisClient = new Redis(process.env.REDIS_URL);
      
      defaultOptions.store = new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        prefix: 'rl:'
      });
    } catch (error) {
      console.warn('Redis connection failed, using memory store for rate limiting:', error.message);
    }
  }

  return rateLimit({
    ...defaultOptions,
    ...options
  });
};

// General API rate limiter - reasonable limits for most API endpoints
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP per 15 minutes
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Strict limiter for authentication endpoints to prevent brute force attacks
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per IP per hour
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after an hour'
  }
});

// Very strict limiter for sensitive operations (password reset, admin actions)
const sensitiveActionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per IP per hour
  message: {
    status: 'error',
    message: 'Too many sensitive operations from this IP, please try again after an hour'
  }
});

// Public API limiter - for public endpoints that don't require authentication
const publicApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP per 15 minutes
  message: {
    status: 'error',
    message: 'Rate limit exceeded for public API. Please try again later.'
  }
});

// User-specific limiter for workout creation/updates
const workoutLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 workout operations per hour
  message: {
    status: 'error',
    message: 'You have reached the limit for workout operations. Please try again later.'
  },
  // Use user ID as key if available, otherwise use IP
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  }
});

// Custom middleware to bypass rate limits for admin users
const skipRateLimitForAdmins = (limiter) => {
  return (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'support')) {
      // Skip rate limiting for admins
      return next();
    }
    
    // Apply rate limiting for non-admin users
    return limiter(req, res, next);
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveActionLimiter,
  publicApiLimiter,
  workoutLimiter,
  skipRateLimitForAdmins
};