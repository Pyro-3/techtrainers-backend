const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Extract user from Auth0 session or JWT
const extractUser = async (req) => {
  let user = null;
  
  // Try Auth0 session first
  if (req.session && req.session.userId) {
    try {
      user = await User.findById(req.session.userId);
    } catch (error) {
      console.error('Error finding user by session ID:', error);
    }
  }
  
  // Fallback to JWT
  if (!user && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (error) {
        console.error('JWT verification failed:', error);
      }
    }
  }
  
  return user;
};

// Base authentication middleware
const requireAuth = async (req, res, next) => {
  try {
    const user = await extractUser(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

// Role-specific middlewares
const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      // First ensure user is authenticated
      const user = await extractUser(req);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }
      
      req.user = user;
      
      // Check role authorization
      const userRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!userRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
        });
      }
      
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

// Specific role middlewares
const requireAdmin = requireRole('admin');
const requireTrainer = requireRole(['trainer', 'admin']);
const requireUser = requireRole(['user', 'trainer', 'admin']);

// Approved trainer middleware
const requireApprovedTrainer = async (req, res, next) => {
  try {
    const user = await extractUser(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }
    
    if (user.role !== 'trainer' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Trainer access required',
      });
    }
    
    if (user.role === 'trainer' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Trainer approval required',
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Approved trainer middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
    });
  }
};

// Completed profile middleware
const requireCompletedProfile = async (req, res, next) => {
  try {
    const user = await extractUser(req);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }
    
    req.user = user;
    
    if (user.role === 'trainer' && !user.profileCompleted) {
      return res.status(403).json({
        success: false,
        message: 'Profile completion required',
        code: 'PROFILE_INCOMPLETE',
      });
    }
    
    next();
  } catch (error) {
    console.error('Completed profile middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
    });
  }
};

// Static admin protection
const protectStaticAdmin = async (req, res, next) => {
  try {
    const { userId, id } = req.params;
    const targetUserId = userId || id;
    
    if (targetUserId) {
      const targetUser = await User.findById(targetUserId);
      if (targetUser && targetUser.isStaticAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify static admin account',
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Static admin protection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error',
    });
  }
};

// Owner or admin middleware (for resources that can be accessed by owner or admin)
const requireOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      const user = await extractUser(req);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }
      
      req.user = user;
      
      // Admin can access everything
      if (user.role === 'admin') {
        return next();
      }
      
      // Check if user is the owner
      const ownerId = typeof getOwnerId === 'function' ? getOwnerId(req) : req.params.userId;
      
      if (user._id.toString() === ownerId) {
        return next();
      }
      
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    } catch (error) {
      console.error('Owner or admin middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireTrainer,
  requireUser,
  requireApprovedTrainer,
  requireCompletedProfile,
  protectStaticAdmin,
  requireOwnerOrAdmin,
  extractUser,
};
