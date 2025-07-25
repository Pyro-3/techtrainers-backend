const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Safely import optional dependencies
let ApiError;
let logAuthEvent;

try {
  const errorHandler = require("./errorHandler");
  ApiError = errorHandler.ApiError;
} catch (error) {
  // Create a simple ApiError class if import fails
  ApiError = class ApiError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.name = 'ApiError';
    }
  };
}

try {
  const logger = require("../utils/AdvancedLogger");
  logAuthEvent = logger.logAuthEvent;
} catch (error) {
  // Create a no-op function if logger import fails
  logAuthEvent = async () => {};
}

/**
 * Main authentication middleware
 * Verifies JWT tokens and attaches user to request object
 */
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.header("Authorization");
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Extract token from "Bearer <token>"
      token = authHeader.substring(7);
    } else {
      // Alternative: get from x-auth-token header
      token = req.header("x-auth-token");
    }

    // Check if token exists
    if (!token) {
      try {
        await logAuthEvent(
          "AUTH_FAILED",
          {
            reason: "No token provided",
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          },
          req
        );
      } catch (logError) {
        console.warn("Logging failed:", logError.message);
      }

      throw new ApiError(
        "Access denied. No authentication token provided",
        401
      );
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "techtrainer_secret"
    );

    // Find user by id and exclude password field
    const user = await User.findById(decoded.userId).select("-password");

    // Check if user exists
    if (!user) {
      await logAuthEvent(
        "AUTH_FAILED",
        {
          reason: "User not found",
          userId: decoded.userId,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        req
      );

      throw new ApiError("User not found", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      await logAuthEvent(
        "AUTH_FAILED",
        {
          reason: "Account deactivated",
          userId: user._id,
          email: user.email,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        req
      );

      throw new ApiError("Account has been deactivated", 401);
    }

    // Attach user to request object
    req.user = user;
    req.userId = user._id;
    req.user.id = user._id; // Add this line for frontend compatibility

    await logAuthEvent(
      "AUTH_SUCCESS",
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
      req
    );

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      await logAuthEvent(
        "AUTH_FAILED",
        {
          reason: "Invalid token",
          error: error.message,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        req
      );

      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      await logAuthEvent(
        "AUTH_FAILED",
        {
          reason: "Token expired",
          error: error.message,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
        req
      );

      return res.status(401).json({
        status: "error",
        message: "Authentication token has expired",
      });
    }

    // Handle custom API errors
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    // Handle unexpected errors
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is provided but doesn't fail if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.header("Authorization");
    let token;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else {
      token = req.header("x-auth-token");
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Try to verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "techtrainer_secret"
    );

    // Find user by id and exclude password field
    const user = await User.findById(decoded.userId).select("-password");

    // If user exists and is active, attach to request
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id;
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on errors, just continue without user
    next();
  }
};

/**
 * Require authentication middleware
 * Same as auth but with a different name for consistency
 */
const requireAuth = auth;

module.exports = {
  auth,
  requireAuth,
  optionalAuth,
};
