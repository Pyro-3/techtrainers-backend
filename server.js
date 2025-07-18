require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

// Import Auth0 service
const { auth0Config, requiresAuth, createStaticAdmin } = require('./server/src/services/auth0Service');
const { auth } = require('express-openid-connect');

// Import logging middleware
const {
  requestTimer,
  requestLogger,
  errorLogger,
  correlationId,
  securityHeaders,
  requestSizeLogger,
  slowRequestLogger,
  ipLogger,
  userAgentLogger,
} = require("./server/src/middleware/requestLogger");

// Import logger
const { logger } = require("./server/src/utils/AdvancedLogger");

// Import routes
const authRoutes = require("./server/src/routes/authRoutes");
const userRoutes = require("./server/src/routes/userRoutes");
const workoutRoutes = require("./server/src/routes/workoutRoutes");
const trainerRoutes = require("./server/src/routes/trainerRoutes");
const chatRoutes = require("./server/src/routes/chatRoutes");
const supportRoutes = require("./server/src/routes/supportRoutes");
const devAuthRoutes = require("./server/src/routes/devAuthRoutes");
const userSupportRoutes = require("./server/src/routes/userSupportRoutes");
const adminSupportRoutes = require("./server/src/routes/adminSupportRoutes");
const adminRoutes = require("./server/src/routes/AdminRoutes");
const appointmentRoutes = require("./server/src/routes/AppointmentRoutes");
const paymentRoutes = require("./server/src/routes/enhancedPaymentRoutes");
const bookingRoutes = require("./server/src/routes/bookingRoutes");
const notificationRoutes = require("./server/src/routes/NotificationRoutes");
const loggingRoutes = require("./server/src/routes/loggingRoutes");
const exerciseRoutes = require("./server/src/routes/ExerciseRoutes");
const progressRoutes = require("./server/src/routes/ProgressRoutes");

// Initialize Express
const app = express();

// Middleware
app.use(helmet());

// Apply Auth0 middleware early
if (process.env.AUTH0_SECRET && process.env.AUTH0_CLIENT_ID) {
  app.use(auth(auth0Config));
  console.log('✅ Auth0 middleware enabled');
} else {
  console.log('⚠️ Auth0 not configured - social login disabled');
}

// Logging middleware (order matters)
app.use(correlationId);
app.use(requestTimer);
app.use(securityHeaders);
app.use(requestSizeLogger);
app.use(slowRequestLogger(5000)); // 5 second threshold
app.use(userAgentLogger);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      'http://localhost:3000',
      'http://localhost:19006',
      'capacitor://localhost',
      'https://techtrainers.ca',
      'https://www.techtrainers.ca'
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-API-Key"],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
    optionsSuccessStatus: 204,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware (after body parsing)
app.use(requestLogger);
app.use(ipLogger);

// MongoDB connection
const {
  connectToDatabase,
  createStaticAdmin,
  healthCheck,
} = require("./server/src/config/database");

async function initializeDatabase() {
  try {
    const dbResult = await connectToDatabase();

    if (dbResult.success) {
      logger.info("Database connected successfully", {
        action: "DATABASE_CONNECTED",
        database: dbResult.database,
        collections: dbResult.collections,
      });

      // Create static admin account
      await createStaticAdmin();

      // Perform health check
      const health = await healthCheck();
      if (health.success) {
        console.log("✅ Database health check passed");
      } else {
        console.log("⚠️  Database health check failed:", health.error);
      }
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    logger.error("Database initialization failed", {
      action: "DATABASE_INIT_FAILED",
      error: error.message,
    });
    process.exit(1);
  }
}

// Initialize database
initializeDatabase();

// Auth0 routes and endpoints
// Auth0 success redirect
app.get('/auth/success', requiresAuth(), async (req, res) => {
  try {
    const { userRole, isApproved } = req.session;
    
    let redirectUrl;
    
    switch (userRole) {
      case 'admin':
        redirectUrl = process.env.ADMIN_DASHBOARD_URL || 'http://localhost:3000/admin-dashboard';
        break;
      case 'trainer':
        if (isApproved) {
          redirectUrl = process.env.TRAINER_DASHBOARD_URL || 'http://localhost:3000/trainer-dashboard';
        } else {
          redirectUrl = `${process.env.TRAINER_DASHBOARD_URL || 'http://localhost:3000/trainer-dashboard'}?pending=true`;
        }
        break;
      default:
        redirectUrl = process.env.MEMBER_DASHBOARD_URL || 'http://localhost:3000/member-dashboard';
    }
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth success redirect error:', error);
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
});

// Auth0 logout success
app.get('/auth/logout-success', (req, res) => {
  res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
});

// API token endpoint for client-side authentication
app.get('/api/auth/token', requiresAuth(), (req, res) => {
  try {
    const { apiToken, userId, userRole, userEmail } = req.session;
    
    if (!apiToken) {
      return res.status(401).json({
        success: false,
        message: 'No API token available',
      });
    }
    
    res.json({
      success: true,
      data: {
        token: apiToken,
        user: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
      },
    });
  } catch (error) {
    console.error('Token endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get token',
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/trainers", trainerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/dev-auth", devAuthRoutes);
app.use("/api/user-support", userSupportRoutes);
app.use("/api/admin-support", adminSupportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/logs", loggingRoutes);
app.use("/api/exercises", exerciseRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/api/health", async (_, res) => {
  try {
    const health = await logger.healthCheck();
    res.status(200).json({
      status: "ok",
      message: "API is running",
      time: new Date().toISOString(),
      logging: health,
    });
  } catch (error) {
    res.status(200).json({
      status: "ok",
      message: "API is running",
      time: new Date().toISOString(),
      logging: { status: "error", error: error.message },
    });
  }
});

// Root route
app.get("/", (_, res) => {
  res.json({ message: "Welcome to TechTrainers API" });
});

// 404 handler
app.use("*", (req, res) => {
  logger.warn(
    `404 - Route not found: ${req.originalUrl}`,
    {
      method: req.method,
      url: req.originalUrl,
      action: "ROUTE_NOT_FOUND",
    },
    req
  );

  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorLogger);
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  logger.error(
    "Server error occurred",
    {
      error: err.message,
      stack: err.stack,
      statusCode: err.statusCode || 500,
      method: req.method,
      url: req.originalUrl,
      action: "SERVER_ERROR",
    },
    req
  );

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  logger.info("Server started successfully", {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    action: "SERVER_STARTED",
  });
});

module.exports = app;
