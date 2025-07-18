const LoggerUtils = require("../utils/LoggerUtils");
const ApiResFormat = require("../utils/ApiResFormat");

const logger = LoggerUtils.createLogger("error");

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = "ApiError";

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle specific types of errors
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new ApiError(message, 400);
};

const handleJWTError = () =>
  new ApiError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new ApiError("Your token has expired! Please log in again.", 401);

/**
 * Send error response for development
 */
const sendErrorDev = (err, req, res) => {
  // Log the error
  logger.error("Development Error:", {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  return res.status(err.statusCode || 500).json({
    status: "error",
    error: err,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Send error response for production
 */
const sendErrorProd = (err, req, res) => {
  // Log the error
  logger.error("Production Error:", {
    error: err.message,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });

  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Programming or other unknown error: don't leak error details
  // 1) Log error for debugging
  logger.error("SYSTEM ERROR:", {
    error: err,
    stack: err.stack,
  });

  // 2) Send generic message
  return res.status(500).json({
    status: "error",
    message: "Something went wrong!",
    timestamp: new Date().toISOString(),
  });
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = handleCastErrorDB(error);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = handleDuplicateFieldsDB(error);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    error = handleValidationErrorDB(error);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = handleJWTError();
  }

  if (err.name === "TokenExpiredError") {
    error = handleJWTExpiredError();
  }

  // Send error response
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new ApiError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Handle unhandled promise rejections
 */
const handleUnhandledRejection = (server) => {
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", {
      promise,
      reason: reason.stack || reason,
    });

    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Handle uncaught exceptions
 */
const handleUncaughtException = () => {
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception! Shutting down...", {
      error: err.message,
      stack: err.stack,
    });

    process.exit(1);
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
};
