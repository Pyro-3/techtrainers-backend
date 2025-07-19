require("dotenv").config({ path: require("path").join(__dirname, ".env") });
console.log("🔧 Environment loaded, PORT:", process.env.PORT);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
console.log("✅ Basic dependencies loaded");

// Import middleware
const errorHandler = require("./src/middleware/errorHandler");
const corsConfig = require("./src/middleware/cors-config");
const reqLog = require("./src/middleware/reqLog");
const reqSanitization = require("./src/middleware/reqSanitization");
console.log("✅ Middleware loaded");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const workoutRoutes = require("./src/routes/workoutRoutes");
const supportRoutes = require("./src/routes/supportRoutes");
const trainerRoutes = require("./src/routes/trainerRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const devAuthRoutes = require("./src/routes/devAuthRoutes");
const appointmentRoutes = require("./src/routes/AppointmentRoutes");
const paymentRoutes = require("./src/routes/enhancedPaymentRoutes");
const notificationRoutes = require("./src/routes/NotificationRoutes");
const adminRoutes = require("./src/routes/AdminRoutes");
console.log("✅ Routes loaded");

// Import utilities
const DatabaseHelp = require("./src/utils/DatabaseHelp");
const LoggerUtils = require("./src/utils/LoggerUtils");
console.log("✅ Utilities loaded");

// Initialize Express
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

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS configuration
app.use(corsConfig);

// Request logging
app.use(reqLog);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));
console.log("✅ Static file serving configured");

// Request sanitization
app.use(reqSanitization);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Database connection
DatabaseHelp.connectDB()
  .then(() => {
    logger.info("Database connected successfully");
  })
  .catch((error) => {
    logger.error("Database connection failed:", error);
    process.exit(1);
  });

// Routes
// Root route
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to TechTrainer API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      users: "/api/users",
      workouts: "/api/workouts",
      support: "/api/support",
      trainers: "/api/trainers",
      chat: "/api/chat",
      appointments: "/api/appointments",
      payments: "/api/payments",
      notifications: "/api/notifications",
      admin: "/api/admin",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Development routes (only in development)
if (process.env.NODE_ENV === "development") {
  app.use("/api/dev", devAuthRoutes);
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "TechTrainer API is running",
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

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await DatabaseHelp.disconnectDB();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await DatabaseHelp.disconnectDB();
  process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Uncaught exception handler
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

const PORT = process.env.PORT || 3001;
console.log("🚀 Starting server on port:", PORT);

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

module.exports = { app, server };
