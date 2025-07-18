const winston = require("winston");
const path = require("path");
const fs = require("fs");

/**
 * Application logging utility
 */

// Ensure logs directory exists
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    ({ timestamp, level, message, stack, service, ...meta }) => {
      const serviceName = service ? `[${service}] ` : "";
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta)}`
        : "";
      const stackStr = stack ? `\n${stack}` : "";
      return `${timestamp} ${serviceName}[${level.toUpperCase()}]: ${message}${metaStr}${stackStr}`;
    }
  )
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const serviceName = service ? `[${service}] ` : "";
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} ${serviceName}${level}: ${message}${metaStr}`;
  })
);

/**
 * Create a logger instance with service name
 * @param {string} serviceName - Name of the service/module
 * @returns {winston.Logger} - Configured logger instance
 */
const createLogger = (serviceName = "app") => {
  return winston.createLogger({
    level:
      process.env.LOG_LEVEL ||
      (process.env.NODE_ENV === "production" ? "info" : "debug"),
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: consoleFormat,
        silent: process.env.NODE_ENV === "test",
      }),

      // Error log file
      new winston.transports.File({
        filename: path.join(logDir, "error.log"),
        level: "error",
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        format: logFormat,
      }),

      // Combined log file
      new winston.transports.File({
        filename: path.join(logDir, "combined.log"),
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        format: logFormat,
      }),
    ],
  });
};

// Default logger instance
const logger = createLogger("main");

// Add stream for Morgan integration
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

/**
 * Log levels:
 * - error: 0
 * - warn: 1
 * - info: 2
 * - http: 3
 * - verbose: 4
 * - debug: 5
 * - silly: 6
 */

/**
 * Create structured log entry
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @param {string} serviceName - Service name
 */
const createLogEntry = (level, message, meta = {}, serviceName = "app") => {
  const loggerInstance = createLogger(serviceName);
  loggerInstance.log(level, message, meta);
};

/**
 * Log error with stack trace
 * @param {Error} error - Error object
 * @param {Object} meta - Additional metadata
 * @param {string} serviceName - Service name
 */
const logError = (error, meta = {}, serviceName = "app") => {
  const loggerInstance = createLogger(serviceName);
  loggerInstance.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...meta,
  });
};

/**
 * Log HTTP request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in ms
 */
const logHttpRequest = (req, res, responseTime) => {
  const loggerInstance = createLogger("http");
  loggerInstance.http(`${req.method} ${req.originalUrl}`, {
    status: res.statusCode,
    responseTime,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id,
  });
};

/**
 * Log database operation
 * @param {string} operation - Database operation type
 * @param {string} collection - Collection/model name
 * @param {Object} meta - Additional metadata
 */
const logDbOperation = (operation, collection, meta = {}) => {
  const loggerInstance = createLogger("database");
  loggerInstance.debug(`DB ${operation} on ${collection}`, meta);
};

/**
 * Log authentication event
 * @param {string} event - Auth event type
 * @param {string} userId - User ID
 * @param {Object} meta - Additional metadata
 */
const logAuthEvent = (event, userId, meta = {}) => {
  const loggerInstance = createLogger("auth");
  loggerInstance.info(`Auth event: ${event}`, {
    userId,
    ...meta,
  });
};

module.exports = {
  logger,
  createLogger,
  createLogEntry,
  logError,
  logHttpRequest,
  logDbOperation,
  logAuthEvent,
};
