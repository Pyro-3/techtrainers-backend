const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * Role-based access control middleware
 */

// Base authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("+role");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
};

// Role-based access middleware factory
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = [authenticate, requireRole("admin")];

// Trainer only middleware
const trainerOnly = [authenticate, requireRole("trainer")];

// User only middleware
const userOnly = [authenticate, requireRole("member")];

// Trainer or Admin middleware
const trainerOrAdmin = [authenticate, requireRole("trainer", "admin")];

// Any authenticated user
const anyUser = [authenticate, requireRole("member", "trainer", "admin")];

// Approved trainer only middleware
const approvedTrainerOnly = [
  authenticate,
  requireRole("trainer"),
  (req, res, next) => {
    if (!req.user.isApproved) {
      return res.status(403).json({
        status: "error",
        message: "Trainer account not approved yet",
      });
    }
    next();
  },
];

// Completed profile trainer only middleware
const completedProfileTrainerOnly = [
  authenticate,
  requireRole("trainer"),
  (req, res, next) => {
    if (!req.user.isApproved) {
      return res.status(403).json({
        status: "error",
        message: "Trainer account not approved yet",
      });
    }

    if (!req.user.profileCompleted) {
      return res.status(403).json({
        status: "error",
        message: "Please complete your trainer profile first",
      });
    }

    next();
  },
];

// Protect static admin account
const protectStaticAdmin = (req, res, next) => {
  const targetUserId =
    req.params.id || req.params.userId || req.params.trainerId;

  if (targetUserId) {
    User.findById(targetUserId)
      .then((user) => {
        if (user && user.isStaticAdmin) {
          return res.status(403).json({
            status: "error",
            message: "Static admin account cannot be modified",
          });
        }
        next();
      })
      .catch((error) => {
        return res.status(500).json({
          status: "error",
          message: "Error checking user permissions",
        });
      });
  } else {
    next();
  }
};

// Self or admin access (user can access their own data, admin can access any)
const selfOrAdmin = [
  authenticate,
  (req, res, next) => {
    const targetUserId =
      req.params.id || req.params.userId || req.params.trainerId;

    if (req.user.role === "admin" || req.user._id.toString() === targetUserId) {
      next();
    } else {
      return res.status(403).json({
        status: "error",
        message: "You can only access your own data",
      });
    }
  },
];

// Client-trainer relationship middleware
const clientTrainerRelation = [
  authenticate,
  async (req, res, next) => {
    try {
      const clientId = req.params.clientId;
      const trainerId = req.user._id;

      // Check if there's an approved booking between client and trainer
      const Booking = require("../models/Booking");
      const relationship = await Booking.findOne({
        clientId,
        trainerId,
        status: "approved",
        isDeleted: false,
      });

      if (!relationship) {
        return res.status(403).json({
          status: "error",
          message: "No approved trainer-client relationship found",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: "error",
        message: "Error verifying trainer-client relationship",
      });
    }
  },
];

module.exports = {
  authenticate,
  requireRole,
  adminOnly,
  trainerOnly,
  userOnly,
  trainerOrAdmin,
  anyUser,
  approvedTrainerOnly,
  completedProfileTrainerOnly,
  protectStaticAdmin,
  selfOrAdmin,
  clientTrainerRelation,
};
