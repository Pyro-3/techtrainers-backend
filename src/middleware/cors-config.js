const cors = require('cors');

/**
 * CORS Configuration for the API
 * This configuration allows for different settings in development and production environments
 * Optimized for cross-platform development including web, iOS, and Android
 */

// List of allowed origins
const allowedOrigins = [
  // Production origins (for future use)
  'https://yourfrontendapp.com',          // Main frontend application
  'https://admin.yourfrontendapp.com',    // Admin dashboard
  'https://staging.yourfrontendapp.com',  // Staging environment
  'https://api.yourfrontendapp.com',      // API itself (for same-origin requests)
  
  // Local development origins
  'http://localhost:3000',     // React default port
  'http://localhost:19000',    // Expo default port
  'http://localhost:19006',    // Expo web default port
  'http://localhost:8080',     // Common webpack port
  'http://localhost:5173',     // Vite default port
  'capacitor://localhost',     // Capacitor apps
  'ionic://localhost',         // Ionic framework
  'exp://localhost:19000'      // Expo Go app
];

// CORS options configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    // (like mobile apps, react-native, Expo, Capacitor, etc)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      // In development mode, we're more permissive
      
      // Accept any localhost or 127.0.0.1 origin regardless of port
      if (origin.match(/^http:\/\/localhost:/) || 
          origin.match(/^http:\/\/127\.0\.0\.1:/) || 
          origin.startsWith('exp://') ||
          origin.startsWith('capacitor://') ||
          origin.startsWith('ionic://')) {
        return callback(null, true);
      }
      
      // Also allow specifically listed origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, log rejected origins but still allow them
      // This makes development easier across multiple devices/emulators
      console.warn(`[CORS] Origin ${origin} not in allowed list, but allowing in development mode`);
      return callback(null, true);
    } 
    
    // In production, strictly check against our allowlist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS] Rejected request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Which HTTP methods to allow
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Which headers to allow
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'x-auth-token',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ],
  
  // Allow credentials (cookies, authorization headers, etc.)
  credentials: true,
  
  // How long browsers should cache preflight requests (in seconds)
  maxAge: 86400, // 24 hours
  
  // Expose these headers to the client
  exposedHeaders: ['Content-Disposition', 'X-Total-Count']
};

// Create the CORS middleware using our options
const corsMiddleware = cors(corsOptions);

// Simple middleware to handle CORS preflight errors
const handleCorsError = (err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'Cross-Origin Request Blocked: The request origin is not permitted'
    });
  }
  next(err);
};

/**
 * Helper function to dynamically add new origins at runtime
 * Useful for adding domains during application lifecycle
 * @param {string} origin - The origin to add
 */
const addAllowedOrigin = (origin) => {
  if (origin && !allowedOrigins.includes(origin)) {
    allowedOrigins.push(origin);
    console.log(`[CORS] Added new allowed origin: ${origin}`);
    return true;
  }
  return false;
};

module.exports = {
  corsMiddleware,
  handleCorsError,
  addAllowedOrigin,
  allowedOrigins, // Export the array so it can be inspected/modified
  corsOptions    // Export raw options in case they're needed elsewhere
};