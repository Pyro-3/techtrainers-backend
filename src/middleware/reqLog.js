const winston = require('winston');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { format } = require('date-fns');

/**
 * Request logging middleware
 * Tracks API usage and errors for monitoring and debugging
 */

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create rotating filename based on date
const getLogFileName = (type) => {
  const date = format(new Date(), 'yyyy-MM-dd');
  return path.join(logsDir, `${type}_${date}.log`);
};

// Custom format for Winston logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(info => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
  })
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'fitness-api' },
  transports: [
    // Write all error level logs to error file
    new winston.transports.File({ 
      filename: getLogFileName('error'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 30, // Keep 30 files max
    }),
    // Write all logs to combined file
    new winston.transports.File({ 
      filename: getLogFileName('combined'),
      maxsize: 5242880, // 5MB
      maxFiles: 30, // Keep 30 files max
    })
  ],
  exceptionHandlers: [
    // Log uncaught exceptions
    new winston.transports.File({ 
      filename: getLogFileName('exceptions')
    })
  ]
});

// Add console output in non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Custom token for Morgan to log request body (limited size)
morgan.token('body', (req) => {
  const body = { ...req.body };
  
  // Don't log passwords or sensitive fields
  if (body.password) body.password = '[REDACTED]';
  if (body.token) body.token = '[REDACTED]';
  if (body.creditCard) body.creditCard = '[REDACTED]';
  
  // Limit body size to avoid huge logs
  const json = JSON.stringify(body);
  if (json.length > 1000) {
    return json.substring(0, 1000) + '... [truncated]';
  }
  return json;
});

// Custom token for response time in a more readable format
morgan.token('response-time-formatted', (req, res) => {
  const time = res.getHeader('X-Response-Time') || 0;
  
  // Format based on time
  if (time < 10) return `${time}ms`;
  if (time < 100) return `${time}ms`;
  if (time < 1000) return `${time}ms`;
  return `${(time / 1000).toFixed(2)}s`;
});

// Custom token for user ID if authenticated
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom token for status color
morgan.token('status-color', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return '\x1b[31m' + status + '\x1b[0m'; // red
  if (status >= 400) return '\x1b[33m' + status + '\x1b[0m'; // yellow
  if (status >= 300) return '\x1b[36m' + status + '\x1b[0m'; // cyan
  return '\x1b[32m' + status + '\x1b[0m'; // green
});

// Define Morgan format for API logging
const morganFormat = process.env.NODE_ENV !== 'production'
  ? ':method :url :status-color :response-time-formatted - :user-id :body'
  : ':remote-addr - :user-id [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

// Create Morgan middleware with Winston as the stream
const httpLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  },
  skip: (req, res) => {
    // Skip logging health checks or other specific routes
    return req.url.includes('/health') || req.url.includes('/ping');
  }
});

// Response time middleware - must be used before httpLogger
const responseTime = (req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6; // Convert to milliseconds
    res.setHeader('X-Response-Time', time.toFixed(2));
  });
  
  next();
};

// Error logging middleware - separate from regular request logging
const errorLogger = (err, req, res, next) => {
  // Log the error with context
  logger.error(`${err.name}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    params: req.params,
    query: req.query,
    userId: req.user ? req.user._id : 'anonymous',
    stack: err.stack
  });
  
  next(err);
};

// API metric tracking (optional enhancement)
const apiMetrics = {
  requests: 0,
  errors: 0,
  endpoints: {}
};

// Middleware to track API metrics
const trackApiMetrics = (req, res, next) => {
  apiMetrics.requests++;
  
  const endpoint = `${req.method} ${req.route ? req.route.path : req.path}`;
  if (!apiMetrics.endpoints[endpoint]) {
    apiMetrics.endpoints[endpoint] = {
      calls: 0,
      errors: 0,
      totalResponseTime: 0
    };
  }
  
  apiMetrics.endpoints[endpoint].calls++;
  
  // Track response metrics
  res.on('finish', () => {
    const responseTime = parseFloat(res.getHeader('X-Response-Time') || 0);
    apiMetrics.endpoints[endpoint].totalResponseTime += responseTime;
    
    if (res.statusCode >= 400) {
      apiMetrics.errors++;
      apiMetrics.endpoints[endpoint].errors++;
    }
  });
  
  next();
};

// Function to get current metrics (useful for health endpoints)
const getMetrics = () => {
  return {
    uptime: process.uptime(),
    timestamp: Date.now(),
    metrics: apiMetrics
  };
};

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  responseTime,
  trackApiMetrics,
  getMetrics
};