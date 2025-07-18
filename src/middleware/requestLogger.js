/**
 * Request Logger Middleware
 * Logs all API requests with timing and response information
 */

const { logApiRequest, logger } = require("../utils/AdvancedLogger");

/**
 * Request timing middleware
 */
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

/**
 * Request logging middleware
 */
const requestLogger = async (req, res, next) => {
  // Skip logging for health checks and static assets
  const skipPaths = ["/health", "/favicon.ico", "/static"];
  const shouldSkip = skipPaths.some((path) => req.path.startsWith(path));

  if (shouldSkip) {
    return next();
  }

  // Store original res.end method
  const originalEnd = res.end;

  // Override res.end to capture response
  res.end = function (chunk, encoding) {
    // Calculate request duration
    const duration = Date.now() - req.startTime;

    // Log the request
    logApiRequest(req, res, duration).catch((error) => {
      console.error("Failed to log API request:", error);
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 */
const errorLogger = async (err, req, res, next) => {
  const duration = Date.now() - req.startTime;

  try {
    await logger.error(
      `API Error: ${err.message}`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        error: err.message,
        stack: err.stack,
        userId: req.user?._id,
        userEmail: req.user?.email,
        action: "API_ERROR",
      },
      req
    );
  } catch (logError) {
    console.error("Failed to log API error:", logError);
  }

  next(err);
};

/**
 * Request correlation ID middleware
 */
const correlationId = (req, res, next) => {
  // Generate unique request ID
  req.id =
    req.headers["x-request-id"] ||
    req.headers["x-correlation-id"] ||
    generateRequestId();

  // Add to response headers
  res.setHeader("X-Request-ID", req.id);

  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

/**
 * Rate limiting logger
 */
const rateLimitLogger = async (req, res, next) => {
  // Check if rate limit was hit
  if (res.statusCode === 429) {
    try {
      await logger.security(
        "Rate limit exceeded",
        {
          method: req.method,
          url: req.originalUrl,
          userId: req.user?._id,
          userEmail: req.user?.email,
          action: "RATE_LIMIT_EXCEEDED",
        },
        req
      );
    } catch (error) {
      console.error("Failed to log rate limit event:", error);
    }
  }

  next();
};

/**
 * Request size logger
 */
const requestSizeLogger = (req, res, next) => {
  const contentLength = req.headers["content-length"];

  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB
    logger
      .warn(
        "Large request received",
        {
          method: req.method,
          url: req.originalUrl,
          contentLength: parseInt(contentLength),
          userId: req.user?._id,
          action: "LARGE_REQUEST",
        },
        req
      )
      .catch((error) => {
        console.error("Failed to log large request:", error);
      });
  }

  next();
};

/**
 * Slow request logger
 */
const slowRequestLogger = (threshold = 5000) => {
  return (req, res, next) => {
    const originalEnd = res.end;

    res.end = function (chunk, encoding) {
      const duration = Date.now() - req.startTime;

      if (duration > threshold) {
        logger
          .warn(
            "Slow request detected",
            {
              method: req.method,
              url: req.originalUrl,
              duration,
              threshold,
              userId: req.user?._id,
              action: "SLOW_REQUEST",
            },
            req
          )
          .catch((error) => {
            console.error("Failed to log slow request:", error);
          });
      }

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * IP whitelist logger
 */
const ipLogger = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Log first access from new IP
  if (req.user && req.user.lastKnownIp !== clientIp) {
    logger
      .info(
        "New IP address detected",
        {
          userId: req.user._id,
          userEmail: req.user.email,
          newIp: clientIp,
          oldIp: req.user.lastKnownIp,
          action: "IP_CHANGE",
        },
        req
      )
      .catch((error) => {
        console.error("Failed to log IP change:", error);
      });
  }

  next();
};

/**
 * User agent logger
 */
const userAgentLogger = (req, res, next) => {
  const userAgent = req.get("User-Agent");

  // Log suspicious user agents
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i,
    /curl/i,
    /wget/i,
  ];

  if (
    userAgent &&
    suspiciousPatterns.some((pattern) => pattern.test(userAgent))
  ) {
    logger
      .warn(
        "Suspicious user agent detected",
        {
          userAgent,
          method: req.method,
          url: req.originalUrl,
          userId: req.user?._id,
          action: "SUSPICIOUS_USER_AGENT",
        },
        req
      )
      .catch((error) => {
        console.error("Failed to log suspicious user agent:", error);
      });
  }

  next();
};

module.exports = {
  requestTimer,
  requestLogger,
  errorLogger,
  correlationId,
  securityHeaders,
  rateLimitLogger,
  requestSizeLogger,
  slowRequestLogger,
  ipLogger,
  userAgentLogger,
};
