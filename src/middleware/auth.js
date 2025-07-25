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
      return res.status(401).json({
        status: "error",
        message: "Access denied. No authentication token provided",
      });
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
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        status: "error",
        message: "Account has been deactivated",
      });
    }

    // Attach user to request object with both _id and id for compatibility
    req.user = user;
    req.user.id = user._id; // Add id field for frontend compatibility
    req.userId = user._id;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Authentication token has expired",
      });
    }

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
  requireAuth: auth,
  optionalAuth,
};
