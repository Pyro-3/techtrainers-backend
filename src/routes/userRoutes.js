const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  try {
    // In a real app, you would check if the user is an admin
    const users = await User.find().select('-password');
    res.json({
      status: 'success',
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (own user or admin)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    // In a real app, check if the requesting user has permission to view this user
    // if (req.user.id !== req.params.id && !req.user.isAdmin) {
    //   return res.status(403).json({
    //     status: 'error',
    //     message: 'Not authorized to access this user\'s data'
    //   });
    // }
    
    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve user'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, fitnessLevel, goals } = req.body;
    const updateFields = {};
    
    // Build update object with only provided fields
    if (name) updateFields.name = name;
    if (fitnessLevel) updateFields.fitnessLevel = fitnessLevel;
    
    // Handle nested profile fields
    if (goals) {
      updateFields['profile.goals'] = goals;
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update profile'
    });
  }
});

module.exports = router;
