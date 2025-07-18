/**
 * Application configuration management
 * Centralizes all environment variables and configuration settings
 */

require("dotenv").config();

const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT, 10) || 5000,
    host: process.env.HOST || "localhost",
    environment: process.env.NODE_ENV || "development",
  },

  // Database configuration
  database: {
    uri: process.env.MONGO_URI,
    name: process.env.DB_NAME || "techtrainer",
    options: {
      serverSelectionTimeoutMS:
        parseInt(process.env.DB_SERVER_TIMEOUT, 10) || 40000,
      connectTimeoutMS: parseInt(process.env.DB_CONNECT_TIMEOUT, 10) || 40000,
      maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 10,
      minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 5,
      maxIdleTimeMS: parseInt(process.env.DB_MAX_IDLE_TIME, 10) || 30000,
    },
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "techtrainer_fallback_secret_key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  // Security configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 12,
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
    lockoutTime: parseInt(process.env.LOCKOUT_TIME, 10) || 300000, // 5 minutes
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000, // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // Email configuration
  email: {
    service: process.env.EMAIL_SERVICE || "gmail",
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@techtrainer.com",
  },

  // File upload configuration
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 10485760, // 10MB
    allowedTypes: (
      process.env.UPLOAD_ALLOWED_TYPES ||
      "image/jpeg,image/png,image/gif,application/pdf"
    ).split(","),
    destination: process.env.UPLOAD_DESTINATION || "uploads/",
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE, 10) || 10485760, // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES, 10) || 5,
    directory: process.env.LOG_DIRECTORY || "logs",
  },

  // API configuration
  api: {
    version: process.env.API_VERSION || "v1",
    baseUrl:
      process.env.API_BASE_URL ||
      `http://localhost:${process.env.PORT || 5000}`,
    docsEnabled: process.env.API_DOCS_ENABLED !== "false",
    pagination: {
      defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT, 10) || 10,
      maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT, 10) || 100,
    },
  },

  // External services
  services: {
    // Microsoft Teams webhook for notifications
    teamsWebhook: process.env.TEAMS_WEBHOOK_URL,

    // Third-party fitness APIs
    fitnessApis: {
      enabled: process.env.FITNESS_APIS_ENABLED === "true",
      // Add API keys for fitness tracking services
      googleFit: process.env.GOOGLE_FIT_API_KEY,
      appleHealth: process.env.APPLE_HEALTH_API_KEY,
    },

    // Push notifications
    pushNotifications: {
      fcmServerKey: process.env.FCM_SERVER_KEY,
      apnsCert: process.env.APNS_CERT_PATH,
      apnsKey: process.env.APNS_KEY_PATH,
    },
  },

  // Feature flags
  features: {
    registration: process.env.FEATURE_REGISTRATION !== "false",
    socialLogin: process.env.FEATURE_SOCIAL_LOGIN === "true",
    emailVerification: process.env.FEATURE_EMAIL_VERIFICATION === "true",
    twoFactorAuth: process.env.FEATURE_2FA === "true",
    adminPanel: process.env.FEATURE_ADMIN_PANEL !== "false",
    chat: process.env.FEATURE_CHAT !== "false",
    notifications: process.env.FEATURE_NOTIFICATIONS !== "false",
  },

  // Development settings
  development: {
    seedData: process.env.DEV_SEED_DATA === "true",
    mockServices: process.env.DEV_MOCK_SERVICES === "true",
    debugMode: process.env.DEBUG === "true",
  },
};

/**
 * Validate required configuration
 */
const validateConfig = () => {
  const required = ["database.uri", "jwt.secret"];

  const missing = [];

  required.forEach((path) => {
    const keys = path.split(".");
    let current = config;

    for (const key of keys) {
      if (!current[key]) {
        missing.push(path);
        break;
      }
      current = current[key];
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }

  // Warn about using default values in production
  if (config.server.environment === "production") {
    if (config.jwt.secret === "techtrainer_fallback_secret_key") {
      console.warn("⚠️  WARNING: Using default JWT secret in production!");
    }
  }
};

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path (e.g., 'database.uri')
 * @param {any} defaultValue - Default value if not found
 * @returns {any} Configuration value
 */
const get = (path, defaultValue = null) => {
  const keys = path.split(".");
  let current = config;

  for (const key of keys) {
    if (current[key] === undefined) {
      return defaultValue;
    }
    current = current[key];
  }

  return current;
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
const isDevelopment = () => config.server.environment === "development";

/**
 * Check if we're in production mode
 * @returns {boolean}
 */
const isProduction = () => config.server.environment === "production";

/**
 * Check if we're in test mode
 * @returns {boolean}
 */
const isTest = () => config.server.environment === "test";

module.exports = {
  ...config,
  validateConfig,
  get,
  isDevelopment,
  isProduction,
  isTest,
};
