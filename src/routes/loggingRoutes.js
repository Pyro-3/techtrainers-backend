/**
 * Logging Routes
 * API endpoints for log management and monitoring
 */

const express = require("express");
const router = express.Router();

// Safely import logger with fallback
let logger, LOG_LEVELS, LOG_CATEGORIES;
try {
  const advancedLogger = require("../utils/AdvancedLogger");
  logger = advancedLogger.logger;
  LOG_LEVELS = advancedLogger.LOG_LEVELS;
  LOG_CATEGORIES = advancedLogger.LOG_CATEGORIES;
} catch (error) {
  logger = {
    getLogStats: async () => ({}),
    getLogTrends: async () => ({}),
    getLogs: async () => ([]),
    getLogCount: async () => 0,
    getSecurityLogs: async () => ([]),
    getErrorLogs: async () => ([]),
    getLogsByUser: async () => ([]),
    getLogsByCategory: async () => ([]),
    cleanup: async () => 0,
    healthCheck: async () => ({}),
    getMetrics: () => ({}),
    error: () => {},
    info: () => {}
  };
  LOG_LEVELS = {};
  LOG_CATEGORIES = {};
}

const { auth } = require("../middleware/auth");
const { adminAuth } = require("../middleware/adminAuth");

// Get log statistics
router.get("/stats", auth, adminAuth, async (req, res) => {
  try {
    const { timeframe = "24h" } = req.query;
    const stats = await logger.getLogStats(timeframe);

    res.json({
      status: "success",
      data: stats,
      message: "Log statistics retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve log statistics",
      {
        error: error.message,
        action: "GET_LOG_STATS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve log statistics",
    });
  }
});

// Get log trends
router.get("/trends", auth, adminAuth, async (req, res) => {
  try {
    const { timeframe = "24h", groupBy = "hour" } = req.query;
    const trends = await logger.getLogTrends(timeframe, groupBy);

    res.json({
      status: "success",
      data: trends,
      message: "Log trends retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve log trends",
      {
        error: error.message,
        action: "GET_LOG_TRENDS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve log trends",
    });
  }
});

// Get logs with filtering
router.get("/logs", auth, adminAuth, async (req, res) => {
  try {
    const {
      level,
      category,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      search,
    } = req.query;

    // Build filter object
    const filters = {};

    if (level) filters.level = level;
    if (category) filters.category = category;
    if (userId) filters.userId = userId;

    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    if (search) {
      filters.$or = [
        { message: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
        { action: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get logs
    const logs = await logger.getLogs(filters, {
      limit: parseInt(limit),
      skip,
      populate: "userId",
    });

    // Get total count
    const totalCount = await logger.getLogCount(filters);

    res.json({
      status: "success",
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          limit: parseInt(limit),
        },
      },
      message: "Logs retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve logs",
      {
        error: error.message,
        action: "GET_LOGS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve logs",
    });
  }
});

// Get security logs
router.get("/security", auth, adminAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const securityLogs = await logger.getSecurityLogs({
      limit: parseInt(limit),
    });

    res.json({
      status: "success",
      data: securityLogs,
      message: "Security logs retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve security logs",
      {
        error: error.message,
        action: "GET_SECURITY_LOGS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve security logs",
    });
  }
});

// Get error logs
router.get("/errors", auth, adminAuth, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const errorLogs = await logger.getErrorLogs({ limit: parseInt(limit) });

    res.json({
      status: "success",
      data: errorLogs,
      message: "Error logs retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve error logs",
      {
        error: error.message,
        action: "GET_ERROR_LOGS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve error logs",
    });
  }
});

// Get logs by user
router.get("/users/:userId", auth, adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const userLogs = await logger.getLogsByUser(userId, {
      limit: parseInt(limit),
      populate: "userId",
    });

    res.json({
      status: "success",
      data: userLogs,
      message: "User logs retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve user logs",
      {
        error: error.message,
        userId: req.params.userId,
        action: "GET_USER_LOGS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user logs",
    });
  }
});

// Get logs by category
router.get(
  "/categories/:category",
  auth,
  adminAuth,
  async (req, res) => {
    try {
      const { category } = req.params;
      const { limit = 50 } = req.query;

      // Validate category
      if (!Object.values(LOG_CATEGORIES).includes(category)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid log category",
        });
      }

      const categoryLogs = await logger.getLogsByCategory(category, {
        limit: parseInt(limit),
      });

      res.json({
        status: "success",
        data: categoryLogs,
        message: "Category logs retrieved successfully",
      });
    } catch (error) {
      logger.error(
        "Failed to retrieve category logs",
        {
          error: error.message,
          category: req.params.category,
          action: "GET_CATEGORY_LOGS_FAILED",
        },
        req
      );

      res.status(500).json({
        status: "error",
        message: "Failed to retrieve category logs",
      });
    }
  }
);

// Clean up old logs
router.delete("/cleanup", auth, adminAuth, async (req, res) => {
  try {
    const { olderThan = "30d" } = req.query;

    const deletedCount = await logger.cleanup(olderThan);

    logger.info(
      "Log cleanup performed",
      {
        deletedCount,
        olderThan,
        performedBy: req.user._id,
        action: "LOG_CLEANUP_PERFORMED",
      },
      req
    );

    res.json({
      status: "success",
      data: { deletedCount },
      message: `Successfully cleaned up ${deletedCount} log entries`,
    });
  } catch (error) {
    logger.error(
      "Failed to cleanup logs",
      {
        error: error.message,
        action: "LOG_CLEANUP_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to cleanup logs",
    });
  }
});

// Get logger health check
router.get("/health", auth, adminAuth, async (req, res) => {
  try {
    const health = await logger.healthCheck();

    res.json({
      status: "success",
      data: health,
      message: "Logger health check completed",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Logger health check failed",
      error: error.message,
    });
  }
});

// Get logger metrics
router.get("/metrics", auth, adminAuth, async (req, res) => {
  try {
    const metrics = logger.getMetrics();

    res.json({
      status: "success",
      data: metrics,
      message: "Logger metrics retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve logger metrics",
      {
        error: error.message,
        action: "GET_LOGGER_METRICS_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve logger metrics",
    });
  }
});

// Get log constants (for frontend)
router.get("/constants", auth, adminAuth, (req, res) => {
  res.json({
    status: "success",
    data: {
      levels: LOG_LEVELS,
      categories: LOG_CATEGORIES,
    },
    message: "Log constants retrieved successfully",
  });
});

// Export route with dashboard
router.get("/dashboard", auth, adminAuth, async (req, res) => {
  try {
    const [stats, trends, recentErrors, recentSecurity] = await Promise.all([
      logger.getLogStats("24h"),
      logger.getLogTrends("24h", "hour"),
      logger.getErrorLogs({ limit: 10 }),
      logger.getSecurityLogs({ limit: 10 }),
    ]);

    res.json({
      status: "success",
      data: {
        stats,
        trends,
        recentErrors,
        recentSecurity,
        timestamp: new Date(),
      },
      message: "Dashboard data retrieved successfully",
    });
  } catch (error) {
    logger.error(
      "Failed to retrieve dashboard data",
      {
        error: error.message,
        action: "GET_DASHBOARD_DATA_FAILED",
      },
      req
    );

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve dashboard data",
    });
  }
});

module.exports = router;
