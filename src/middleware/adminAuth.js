const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to verify admin or support staff permissions
 * This extends the regular auth middleware by checking if the user has admin or support role
 */
const adminAuth = async (req, res, next) => {
  try {
    // Get token from header (supporting both x-auth-token and Authorization header)
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'No authentication token, access denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'techtrainer_secret');
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');

    // Check if user exists
    if (!user) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'User account has been deactivated' 
      });
    }

    // Check if user has admin or support role
    if (user.role !== 'admin' && user.role !== 'support') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied: requires admin or support privileges' 
      });
    }

    // If specific admin-only route
    if (req.adminOnly && user.role !== 'admin') {
      return res.status(403).json({ 
        status: 'error', 
        message: 'Access denied: requires admin privileges' 
      });
    }

    // Add user to request object
    req.user = user;
    req.token = token;
    
    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Invalid token' 
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Token has expired' 
      });
    }
    
    console.error('Admin auth middleware error:', err);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error during authentication' 
    });
  }
};

// Create a middleware specifically for admin-only routes
const adminOnly = (req, res, next) => {
  req.adminOnly = true;
  adminAuth(req, res, next);
};

// Create a middleware specifically for support staff routes
const supportStaff = (req, res, next) => {
  // No special flag needed since adminAuth already allows support staff
  adminAuth(req, res, next);
};

module.exports = { adminAuth, adminOnly, supportStaff };