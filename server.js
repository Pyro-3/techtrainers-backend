require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("🔧 Environment loaded, PORT:", process.env.PORT);

async function startServer() {
  console.log("🚀 Starting server function...");
  try {
    console.log("📦 Loading Express...");
    const express = require("express");
    const cors = require("cors");
    const helmet = require("helmet");
    const morgan = require("morgan");
    const rateLimit = require("express-rate-limit");
    console.log("✅ Basic dependencies loaded");

    // Import middleware
    // Import middleware
    const { errorHandler } = require("./src/middleware/errorHandler");
    const reqSanitization = require("./src/middleware/reqSanitization");

    // Import routes
    const routes = require('./src/routes');

    // Import utilities
    const DatabaseHelp = require("./src/utils/DatabaseHelp");
    const LoggerUtils = require("./src/utils/LoggerUtils");

    // Conditionally import Twilio service
    let sendSMS = null;
    try {
      const twilioService = require("./services/twilioService");
      sendSMS = twilioService.sendSMS;
      console.log("✅ Twilio service loaded");
    } catch (error) {
      console.log("⚠️ Twilio service not available:", error.message);
    }

    console.log("✅ Utilities loaded");

    // Initialize Express
    const app = express();
    console.log("✅ Express app created");

    // Initialize logger
    const logger = LoggerUtils.createLogger("server");
    console.log("✅ Logger initialized");

    // Trust proxy for rate limiting
    app.set("trust proxy", 1);

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: "error",
        message: "Too many requests from this IP, please try again later.",
      },
    });

    // Apply rate limiting to all requests
    app.use("/api/", limiter);
    console.log("✅ Rate limiting configured");

    // Security middleware
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );

    // CORS configuration
    app.use(cors({
      origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://techtrainers.ca', 'https://www.techtrainers.ca'],
      credentials: true
    }));
    console.log("✅ CORS configured");

    // Request logging
    // app.use(reqLog); // Temporarily disabled
    console.log("✅ Request logging configured");

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    console.log("✅ Body parsing configured");

    // Static file serving for uploads
    app.use("/uploads", express.static("uploads"));
    console.log("✅ Static file serving configured");

    // Request sanitization
    reqSanitization.sanitizeAll.forEach(middleware => {
      if (typeof middleware === 'function') {
        app.use(middleware);
      }
    });
    console.log("✅ Request sanitization configured");

    // Development logging
    if (process.env.NODE_ENV === "development") {
      app.use(morgan("dev"));
    }
    console.log("✅ Morgan logging configured");

    // Database connection
    console.log("🔌 Attempting database connection...");
    DatabaseHelp.connectDB()
      .then(() => {
        logger.info("Database connected successfully");
        console.log("✅ Database connected successfully");
      })
      .catch((error) => {
        logger.error("Database connection failed:", error);
        console.error("❌ Database connection failed:", error.message);
        console.log("⚠️ Continuing without database connection for development...");
      });

    // Update MongoDB connection to use MONGO_URI instead of MONGODB_URI
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrainer';

    // Routes
    // Root route
    app.get("/", (_req, res) => {
      res.json({
        status: "success",
        version: "1.0.0",
        endpoints: {
          health: "/api/health",
          auth: "/api/auth",
          users: "/api/users",
          workouts: "/api/workouts",
          support: "/api/support",
          trainers: "/api/trainers",
          chat: "/api/chat",
          // appointments: "/api/appointments", // TEMPORARILY DISABLED
          payments: "/api/payments",
          notifications: "/api/notifications",
          admin: "/api/admin",
        },
        note: "Appointments temporarily disabled while fixing dateTimeUtils dependency"
      });
    });

    // Use API routes
    app.use('/api', routes);

    // Development routes (only in development)
    if (process.env.NODE_ENV === "development") {
      app.use("/api/dev", devAuthRoutes);
    }

    // SMS route
    app.post("/api/send-sms", async (req, res) => {
      const { to, message } = req.body;

      // Check if SMS service is available
      if (!sendSMS) {
        return res.status(503).json({
          success: false,
          error: "SMS service is not available. Twilio is not properly configured."
        });
      }

      try {
        const result = await sendSMS(to, message);
        res.json({ success: true, sid: result.sid, message: "SMS sent successfully" });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Health check endpoint
    app.get("/api/health", (_req, res) => {
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
        version: require("./package.json").version,
      });
    });

    // 404 handler for API routes
    app.use("/api/*", (req, res) => {
      res.status(404).json({
        status: "error",
        message: `API endpoint ${req.originalUrl} not found`,
      });
    });

    // Global error handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 3001;
    console.log("✅ About to start server on port:", PORT);

    const server = app.listen(PORT, () => {
      console.log(`🚀 TechTrainer Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`🚀 TechTrainer Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
    });

    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please check for other running servers.`
        );
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Fatal error starting server:", error);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  if (typeof logger !== 'undefined') {
    logger.info("SIGTERM received, shutting down gracefully");
  }
  try {
    await DatabaseHelp.disconnectDB();
  } catch (error) {
    console.error("Error disconnecting database:", error);
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  if (typeof logger !== 'undefined') {
    logger.info("SIGINT received, shutting down gracefully");
  }
  try {
    await DatabaseHelp.disconnectDB();
  } catch (error) {
    console.error("Error disconnecting database:", error);
  }
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  if (typeof logger !== 'undefined') {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  }
  process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  if (typeof logger !== 'undefined') {
    logger.error("Uncaught Exception:", error);
  }
  process.exit(1);
});

// Start the server
startServer();

// For testing purposes
module.exports = { startServer };