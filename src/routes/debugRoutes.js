// Quick debug route to help with trainer approval
// Add this to your server.js or create a separate debug routes file

const express = require('express');
const User = require('../models/User');

const router = express.Router();

// List all trainers
router.get('/trainers', async (req, res) => {
  try {
    const trainers = await User.find({ role: 'trainer', isDeleted: false })
      .select('name email isApproved createdAt')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: trainers.length,
      trainers: trainers.map(trainer => ({
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        isApproved: trainer.isApproved,
        createdAt: trainer.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Quick approve trainer by email
router.post('/approve-trainer', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    const trainer = await User.findOne({ email, role: 'trainer' });
    
    if (!trainer) {
      return res.status(404).json({
        success: false,
        error: 'Trainer not found'
      });
    }
    
    trainer.isApproved = true;
    await trainer.save();
    
    res.json({
      success: true,
      message: `Trainer ${trainer.name} approved successfully`,
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        isApproved: trainer.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
