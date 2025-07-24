const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/userAuth');

// This route should ONLY be available in development environment
// It allows quick login for development purposes without password

/**
 * Quick login route for development
 * DO NOT USE IN PRODUCTION
 */
router.post('/quick-login', async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({
        status: 'error',
        message: 'Route not found'
      });
    }

    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Find user by email
    let user = await User.findOne({ email });
    
    // If user doesn't exist and we're in dev, create one
    if (!user) {
      user = new User({
        name: 'Dev User',
        email,
        password: 'Password1!',  // Will be hashed by pre-save hook
        role: role || 'member'
      });
      
      await user.save();
    }

    // Generate token
    const token = generateToken(user, true);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      },
      message: 'Dev login successful'
    });
  } catch (error) {
    console.error('Dev login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
});

module.exports = router;