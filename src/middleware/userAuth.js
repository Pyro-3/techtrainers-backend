const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');

/**
 * User authentication middleware
 * Verifies JWT tokens and attaches user to request object
 */

/**
 * Middleware to authenticate users
 * Verifies the JWT token from headers and attaches the user to the request
 */
const userAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header (Bearer token)
    const authHeader = req.header('Authorization');
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from "Bearer <token>"
      token = authHeader.substring(7);
    } else {
      // Alternative: get from x-auth-token header
      token = req.header('x-auth-token');
    }

    // Check if token exists
    if (!token) {
      throw new ApiError('Access denied. No authentication token provided', 401);
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'techtrainer_secret'
    );

    // Find user by id and exclude password field
    const user = await User.findById(decoded.userId).select('-password');
    
    // Check if user exists
    if (!user) {
      throw new ApiError('User not found', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError('Account has been deactivated', 401);
    }

    // Check if token was issued before password change (if tracking lastPasswordChange)
    if (user.lastPasswordChange && decoded.iat < user.lastPasswordChange.getTime() / 1000) {
      throw new ApiError('Token expired due to password change. Please login again', 401);
    }

    // Add user to request object
    req.user = user;
    req.token = token;

    // Continue to next middleware or route handler
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError('Invalid token', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new ApiError('Token expired', 401));
    } else if (error instanceof ApiError) {
      return next(error);
    } else {
      return next(new ApiError('Authentication failed', 401));
    }
  }
};

/**
 * Middleware to check if user has required roles
 * Must be used after userAuth middleware
 * @param {...string} roles - List of roles that are allowed
 */
const checkRole = (...roles) => {
  return (req, res, next) => {
    // Make sure userAuth middleware ran first
    if (!req.user) {
      return next(new ApiError('User authentication required', 500));
    }
    
    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return next(new ApiError('Access denied: insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Optional authentication middleware
 * Does not require authentication but attaches user to request if token is valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = req.header('x-auth-token');
    }

    // If no token, continue without authentication
    if (!token) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'techtrainer_secret'
    );

    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    // If user exists and is active, attach to request
    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // For optional auth, we still continue even if token verification fails
    next();
  }
};

/**
 * Middleware to check if user owns the requested resource
 * Assumes the resource has a 'userId' field that references the owner
 * @param {Model} Model - Mongoose model of the resource
 * @param {string} idParam - Name of the route parameter containing the resource ID (default: 'id')
 */
const checkResourceOwnership = (Model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      // Make sure userAuth middleware ran first
      if (!req.user) {
        return next(new ApiError('User authentication required', 500));
      }
      
      const resourceId = req.params[idParam];
      
      if (!resourceId) {
        return next(new ApiError(`Resource ID (${idParam}) not provided in URL`, 400));
      }
      
      // Find the resource
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return next(new ApiError('Resource not found', 404));
      }
      
      // Check if the authenticated user owns this resource
      const ownerId = resource.userId || resource.user; // Support both conventions
      
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError('Access denied: you do not own this resource', 403));
      }
      
      // Add the resource to the request for convenience
      req.resource = resource;
      next();
    } catch (error) {
      next(new ApiError('Error verifying resource ownership', 500));
    }
  };
};

/**
 * Generate a new JWT token for a user
 * @param {Object} user - User object 
 * @param {boolean} rememberMe - Whether to issue a long-lived token
 * @returns {string} JWT token
 */
const generateToken = (user, rememberMe = false) => {
  const payload = {
    userId: user._id,
    role: user.role
  };
  
  const expiresIn = rememberMe ? '30d' : '1d';
  
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'techtrainer_secret', 
    { expiresIn }
  );
};

module.exports = {
  userAuth,
  checkRole,
  optionalAuth,
  checkResourceOwnership,
  generateToken
};