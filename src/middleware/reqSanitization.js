const xss = require('xss');
const mongoSanitize = require('express-mongo-sanitize');
const { ApiError } = require('./errorHandler');

/**
 * Request sanitization middleware
 * Prevents XSS and NoSQL injection attacks by sanitizing request data
 */

// XSS sanitizer function that recursively sanitizes objects
const xssSanitizer = (data) => {
  if (!data) return data;
  
  // Handle different data types
  if (typeof data === 'string') {
    // Sanitize string values
    return xss(data, {
      whiteList: {}, // No tags allowed by default
      stripIgnoreTag: true, // Strip all tags not in whitelist
      stripIgnoreTagBody: ['script'] // Remove script tags and their content
    });
  } else if (Array.isArray(data)) {
    // Recursively sanitize array items
    return data.map(item => xssSanitizer(item));
  } else if (typeof data === 'object' && data !== null) {
    // Recursively sanitize object properties
    const sanitizedObj = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sanitizing specific fields like passwords or tokens
      if (['password', 'passwordConfirmation', 'token'].includes(key)) {
        sanitizedObj[key] = value;
      } else {
        sanitizedObj[key] = xssSanitizer(value);
      }
    }
    return sanitizedObj;
  }
  
  // Return other types unchanged (numbers, booleans, etc.)
  return data;
};

// Middleware to sanitize request body for XSS attacks
const sanitizeBody = (req, res, next) => {
  try {
    if (req.body && Object.keys(req.body).length) {
      req.body = xssSanitizer(req.body);
    }
    next();
  } catch (error) {
    next(new ApiError('Error sanitizing request body', 400));
  }
};

// Middleware to sanitize URL parameters for XSS attacks
const sanitizeParams = (req, res, next) => {
  try {
    if (req.params && Object.keys(req.params).length) {
      req.params = xssSanitizer(req.params);
    }
    next();
  } catch (error) {
    next(new ApiError('Error sanitizing URL parameters', 400));
  }
};

// Middleware to sanitize query string for XSS attacks
const sanitizeQuery = (req, res, next) => {
  try {
    if (req.query && Object.keys(req.query).length) {
      req.query = xssSanitizer(req.query);
    }
    next();
  } catch (error) {
    next(new ApiError('Error sanitizing query string', 400));
  }
};

// Configure MongoDB sanitization options
const mongoSanitizeOptions = {
  allowDots: true, // Allow fields with dots (e.g., "field.subfield")
  replaceWith: '_', // Replace prohibited characters with underscore
  onSanitize: ({ key, value, path }) => {
    console.warn(`Attempted NoSQL injection detected: ${key} - ${value} at ${path}`);
  }
};

// Middleware to sanitize for NoSQL injection
const sanitizeMongoDb = mongoSanitize(mongoSanitizeOptions);

// Middleware to check for suspicious patterns (SQL injection, etc.)
const checkSuspiciousPatterns = (req, res, next) => {
  try {
    // Common SQL injection patterns
    const suspiciousPatterns = [
      /(\b(select|update|delete|insert|drop|alter|create|truncate|declare)\b.*\b(from|table|database|into|values)\b)/i,
      /'(''|[^'])*'/,
      /--[^\r\n]*/,
      /\/\*[\s\S]*?\*\//
    ];
    
    // Function to check all request parts
    const checkParts = (obj) => {
      if (!obj) return false;
      
      return Object.values(obj).some(value => {
        if (typeof value === 'string') {
          return suspiciousPatterns.some(pattern => pattern.test(value));
        } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          return checkParts(value);
        }
        return false;
      });
    };
    
    // Check body, query, and params
    const hasSuspiciousPattern = checkParts(req.body) || 
                                checkParts(req.query) || 
                                checkParts(req.params);
    
    if (hasSuspiciousPattern) {
      // Log the attempt
      console.warn('Potential injection attack detected:', {
        ip: req.ip,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      return next(new ApiError('Invalid input data', 400));
    }
    
    next();
  } catch (error) {
    next(new ApiError('Error checking request data', 400));
  }
};

// HTML entity encoder for response data (optional)
const encodeHtmlEntities = (data) => {
  if (!data) return data;
  
  const htmlEntities = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;'
  };
  
  if (typeof data === 'string') {
    return data.replace(/[<>"'&]/g, match => htmlEntities[match]);
  }
  
  return data;
};

// Content security policy middleware
const contentSecurityPolicy = (req, res, next) => {
  // Set CSP header to prevent XSS attacks at the browser level
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "media-src 'self'; " +
    "frame-src 'none';"
  );
  next();
};

// Combined middleware for easy application
const sanitizeAll = [
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery,
  sanitizeMongoDb,
  checkSuspiciousPatterns
];

module.exports = {
  sanitizeBody,
  sanitizeParams,
  sanitizeQuery,
  sanitizeMongoDb,
  checkSuspiciousPatterns,
  contentSecurityPolicy,
  sanitizeAll,
  xssSanitizer, // Export for use in other parts of the application
  encodeHtmlEntities
};