/**
 * Database Logger Utility for TechTrainers
 * Comprehensive logging system for database operations, authentication, and system events
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Log Level Constants
const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  SECURITY: "security",
  AUDIT: "audit",
};

// Log Categories
const LOG_CATEGORIES = {
  AUTH: "authentication",
  DATABASE: "database",
  API: "api",
  EMAIL: "email",
  SMS: "sms",
  APPOINTMENT: "appointment",
  SYSTEM: "system",
  SECURITY: "security",
  USER: "user",
};

// Database Log Schema
const logSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    level: {
      type: String,
      enum: Object.values(LOG_LEVELS),
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(LOG_CATEGORIES),
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    action: {
      type: String,
      index: true,
    },
    resource: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: String,
    requestId: String,
    sessionId: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    stack: String,
    duration: Number,
    statusCode: Number,
    method: String,
    url: String,
    success: {
      type: Boolean,
      default: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1, category: 1 });
logSchema.index({ userId: 1, timestamp: -1 });
logSchema.index({ action: 1, timestamp: -1 });
logSchema.index({ success: 1, level: 1 });

// TTL index for automatic cleanup (optional - keep logs for 90 days)
logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const Log = mongoose.model("Log", logSchema);

class DatabaseLogger {
  constructor(options = {}) {
    this.options = {
      enableConsoleLogging: options.enableConsoleLogging !== false,
      enableFileLogging: options.enableFileLogging || false,
      logDirectory:
        options.logDirectory || path.join(__dirname, "../../../logs"),
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      maxFiles: options.maxFiles || 10,
      minLevel: options.minLevel || LOG_LEVELS.INFO,
      enableDatabaseLogging: options.enableDatabaseLogging !== false,
      enableMetrics: options.enableMetrics !== false,
      ...options,
    };

    this.metrics = {
      totalLogs: 0,
      errorCount: 0,
      warningCount: 0,
      securityEventCount: 0,
      lastLogTime: null,
    };

    this.initializeFileLogging();
  }

  /**
   * Initialize file logging directory
   */
  initializeFileLogging() {
    if (this.options.enableFileLogging) {
      try {
        if (!fs.existsSync(this.options.logDirectory)) {
          fs.mkdirSync(this.options.logDirectory, { recursive: true });
        }
      } catch (error) {
        console.error("Failed to create log directory:", error);
        this.options.enableFileLogging = false;
      }
    }
  }

  /**
   * Get request context from Express request object
   */
  getRequestContext(req) {
    if (!req) return {};

    return {
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("User-Agent"),
      method: req.method,
      url: req.originalUrl || req.url,
      requestId: req.id || req.headers["x-request-id"],
      sessionId: req.sessionID,
      userId: req.user?._id || req.user?.id,
      userEmail: req.user?.email,
    };
  }

  /**
   * Core logging method
   */
  async log(level, category, message, metadata = {}, req = null) {
    try {
      // Skip if level is below minimum
      if (this.shouldSkipLog(level)) {
        return;
      }

      const requestContext = this.getRequestContext(req);

      const logEntry = {
        level,
        category,
        message,
        ...requestContext,
        ...metadata,
        timestamp: new Date(),
      };

      // Update metrics
      this.updateMetrics(level);

      // Console logging
      if (this.options.enableConsoleLogging) {
        this.logToConsole(logEntry);
      }

      // File logging
      if (this.options.enableFileLogging) {
        await this.logToFile(logEntry);
      }

      // Database logging
      if (this.options.enableDatabaseLogging) {
        await this.logToDatabase(logEntry);
      }

      return logEntry;
    } catch (error) {
      console.error("Logging failed:", error);
      // Fallback to console if all else fails
      console.error("Original log:", { level, category, message, metadata });
    }
  }

  /**
   * Check if log should be skipped based on level
   */
  shouldSkipLog(level) {
    const levels = Object.values(LOG_LEVELS);
    const currentIndex = levels.indexOf(level);
    const minIndex = levels.indexOf(this.options.minLevel);
    return currentIndex < minIndex;
  }

  /**
   * Update internal metrics
   */
  updateMetrics(level) {
    if (!this.options.enableMetrics) return;

    this.metrics.totalLogs++;
    this.metrics.lastLogTime = new Date();

    switch (level) {
      case LOG_LEVELS.ERROR:
        this.metrics.errorCount++;
        break;
      case LOG_LEVELS.WARN:
        this.metrics.warningCount++;
        break;
      case LOG_LEVELS.SECURITY:
        this.metrics.securityEventCount++;
        break;
    }
  }

  /**
   * Log to console with formatting
   */
  logToConsole(logEntry) {
    const timestamp = logEntry.timestamp.toISOString();
    const level = logEntry.level.toUpperCase().padEnd(8);
    const category = logEntry.category.toUpperCase().padEnd(12);

    let color = "";
    switch (logEntry.level) {
      case LOG_LEVELS.ERROR:
        color = "\x1b[31m"; // Red
        break;
      case LOG_LEVELS.WARN:
        color = "\x1b[33m"; // Yellow
        break;
      case LOG_LEVELS.SECURITY:
        color = "\x1b[35m"; // Magenta
        break;
      case LOG_LEVELS.INFO:
        color = "\x1b[36m"; // Cyan
        break;
      case LOG_LEVELS.DEBUG:
        color = "\x1b[37m"; // White
        break;
    }

    const reset = "\x1b[0m";
    const logMessage = `${color}[${timestamp}] ${level} ${category}${reset} ${logEntry.message}`;

    console.log(logMessage);

    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      console.log("  Metadata:", JSON.stringify(logEntry.metadata, null, 2));
    }
  }

  /**
   * Log to file with rotation
   */
  async logToFile(logEntry) {
    try {
      const filename = `${logEntry.category}-${
        new Date().toISOString().split("T")[0]
      }.log`;
      const filepath = path.join(this.options.logDirectory, filename);

      const logLine = JSON.stringify(logEntry) + "\n";

      // Check file size and rotate if needed
      await this.rotateLogFile(filepath);

      fs.appendFileSync(filepath, logLine);
    } catch (error) {
      console.error("File logging failed:", error);
    }
  }

  /**
   * Rotate log file if it exceeds max size
   */
  async rotateLogFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > this.options.maxFileSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const rotatedPath = `${filepath}.${timestamp}`;
          fs.renameSync(filepath, rotatedPath);

          // Clean up old files
          await this.cleanupOldLogFiles(path.dirname(filepath));
        }
      }
    } catch (error) {
      console.error("Log rotation failed:", error);
    }
  }

  /**
   * Clean up old log files
   */
  async cleanupOldLogFiles(directory) {
    try {
      const files = fs
        .readdirSync(directory)
        .filter((file) => file.endsWith(".log"))
        .map((file) => ({
          name: file,
          path: path.join(directory, file),
          stats: fs.statSync(path.join(directory, file)),
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);

      if (files.length > this.options.maxFiles) {
        const filesToDelete = files.slice(this.options.maxFiles);
        filesToDelete.forEach((file) => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error("Log cleanup failed:", error);
    }
  }

  /**
   * Log to database
   */
  async logToDatabase(logEntry) {
    try {
      const log = new Log(logEntry);
      await log.save();
    } catch (error) {
      console.error("Database logging failed:", error);
      // Don't throw - logging should not break the application
    }
  }

  // Convenience methods for different log levels
  debug(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.DEBUG,
      LOG_CATEGORIES.SYSTEM,
      message,
      metadata,
      req
    );
  }

  info(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.INFO,
      LOG_CATEGORIES.SYSTEM,
      message,
      metadata,
      req
    );
  }

  warn(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.WARN,
      LOG_CATEGORIES.SYSTEM,
      message,
      metadata,
      req
    );
  }

  error(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.ERROR,
      LOG_CATEGORIES.SYSTEM,
      message,
      metadata,
      req
    );
  }

  security(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.SECURITY,
      LOG_CATEGORIES.SECURITY,
      message,
      {
        severity: "high",
        ...metadata,
      },
      req
    );
  }

  audit(message, metadata = {}, req = null) {
    return this.log(
      LOG_LEVELS.AUDIT,
      LOG_CATEGORIES.AUDIT,
      message,
      metadata,
      req
    );
  }

  // Category-specific methods
  auth(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.AUTH, message, metadata, req);
  }

  database(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.DATABASE, message, metadata, req);
  }

  api(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.API, message, metadata, req);
  }

  email(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.EMAIL, message, metadata, req);
  }

  sms(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.SMS, message, metadata, req);
  }

  appointment(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.APPOINTMENT, message, metadata, req);
  }

  user(level, message, metadata = {}, req = null) {
    return this.log(level, LOG_CATEGORIES.USER, message, metadata, req);
  }

  // Query methods
  async getLogs(filters = {}, options = {}) {
    try {
      const query = Log.find(filters);

      if (options.sort) {
        query.sort(options.sort);
      } else {
        query.sort({ timestamp: -1 });
      }

      if (options.limit) {
        query.limit(options.limit);
      }

      if (options.skip) {
        query.skip(options.skip);
      }

      if (options.populate) {
        query.populate(options.populate);
      }

      return await query.exec();
    } catch (error) {
      console.error("Failed to retrieve logs:", error);
      throw error;
    }
  }

  async getLogCount(filters = {}) {
    try {
      return await Log.countDocuments(filters);
    } catch (error) {
      console.error("Failed to count logs:", error);
      throw error;
    }
  }

  async getLogsByUser(userId, options = {}) {
    return this.getLogs({ userId }, options);
  }

  async getLogsByCategory(category, options = {}) {
    return this.getLogs({ category }, options);
  }

  async getLogsByLevel(level, options = {}) {
    return this.getLogs({ level }, options);
  }

  async getSecurityLogs(options = {}) {
    return this.getLogs(
      {
        $or: [
          { level: LOG_LEVELS.SECURITY },
          { category: LOG_CATEGORIES.SECURITY },
        ],
      },
      options
    );
  }

  async getErrorLogs(options = {}) {
    return this.getLogs({ level: LOG_LEVELS.ERROR }, options);
  }

  // Analytics methods
  async getLogStats(timeframe = "24h") {
    try {
      const now = new Date();
      let startTime;

      switch (timeframe) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      const stats = await Log.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: null,
            totalLogs: { $sum: 1 },
            errorCount: {
              $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] },
            },
            warningCount: {
              $sum: { $cond: [{ $eq: ["$level", "warn"] }, 1, 0] },
            },
            securityEventCount: {
              $sum: { $cond: [{ $eq: ["$level", "security"] }, 1, 0] },
            },
            categories: { $addToSet: "$category" },
            levels: { $addToSet: "$level" },
          },
        },
      ]);

      return (
        stats[0] || {
          totalLogs: 0,
          errorCount: 0,
          warningCount: 0,
          securityEventCount: 0,
          categories: [],
          levels: [],
        }
      );
    } catch (error) {
      console.error("Failed to get log stats:", error);
      throw error;
    }
  }

  async getLogTrends(timeframe = "24h", groupBy = "hour") {
    try {
      const now = new Date();
      let startTime;
      let dateFormat;

      switch (timeframe) {
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          dateFormat = groupBy === "hour" ? "%Y-%m-%d %H:00" : "%Y-%m-%d";
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          dateFormat = "%Y-%m-%d";
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          dateFormat = "%Y-%m-%d";
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          dateFormat = "%Y-%m-%d %H:00";
      }

      const trends = await Log.aggregate([
        { $match: { timestamp: { $gte: startTime } } },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: dateFormat, date: "$timestamp" },
              },
              level: "$level",
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.date",
            levels: {
              $push: {
                level: "$_id.level",
                count: "$count",
              },
            },
            total: { $sum: "$count" },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return trends;
    } catch (error) {
      console.error("Failed to get log trends:", error);
      throw error;
    }
  }

  // Cleanup methods
  async cleanup(olderThan = "30d") {
    try {
      const now = new Date();
      let cutoffDate;

      switch (olderThan) {
        case "7d":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const result = await Log.deleteMany({ timestamp: { $lt: cutoffDate } });

      this.info(`Log cleanup completed`, {
        deletedCount: result.deletedCount,
        cutoffDate: cutoffDate.toISOString(),
      });

      return result.deletedCount;
    } catch (error) {
      console.error("Log cleanup failed:", error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const recentLogs = await Log.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      const totalLogs = await Log.countDocuments();

      return {
        status: "healthy",
        totalLogs,
        recentLogs,
        metrics: this.metrics,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  // Get metrics
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date(),
    };
  }
}

// Export constants and class
module.exports = {
  DatabaseLogger,
  LOG_LEVELS,
  LOG_CATEGORIES,
  Log,
};

// Create singleton instance
const logger = new DatabaseLogger();
module.exports.logger = logger;
module.exports.default = logger;
