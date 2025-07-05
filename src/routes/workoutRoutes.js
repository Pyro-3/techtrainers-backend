const express = require('express');
const _ = require('lodash');
const Workout = require('../models/Workout');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get user's workouts
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, difficulty } = req.query;
    
    // Build filter
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;

    const workouts = await Workout.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Workout.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        workouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get workouts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get workouts'
    });
  }
});

// @route   GET /api/workouts/stats/summary
// @desc    Get workout statistics
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get basic stats
    const totalWorkouts = await Workout.countDocuments({ user: userId, status: 'completed' });
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const thisWeekWorkouts = await Workout.countDocuments({
      user: userId,
      status: 'completed',
      createdAt: { $gte: thisWeekStart }
    });

    // Get user for streak info
    const user = await User.findById(userId);
    
    // Calculate total volume and minutes
    const workouts = await Workout.find({ user: userId, status: 'completed' });
    const totalVolume = workouts.reduce((total, workout) => total + (workout.totalVolume || 0), 0);
    const totalMinutes = workouts.reduce((total, workout) => total + (workout.actualDuration || workout.duration || 0), 0);

    res.json({
      status: 'success',
      data: {
        totalWorkouts,
        totalMinutes,
        thisWeekWorkouts,
        currentStreak: user?.stats?.currentStreak || 0,
        longestStreak: user?.stats?.longestStreak || 0,
        totalVolume,
        personalRecords: user?.stats?.personalRecords?.length || 0,
        progress: Math.min(100, Math.round((totalWorkouts / 50) * 100)) // Progress to next level based on workout count
      }
    });
  } catch (error) {
    console.error('Get workout stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get workout statistics'
    });
  }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Get workout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get workout'
    });
  }
});

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const workoutData = {
      ...req.body,
      user: req.user.id
    };

    const workout = new Workout(workoutData);
    await workout.save();

    res.status(201).json({
      status: 'success',
      message: 'Workout created successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Create workout error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create workout'
    });
  }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Workout updated successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Update workout error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update workout'
    });
  }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Delete workout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete workout'
    });
  }
});

// @route   POST /api/workouts/:id/start
// @desc    Start workout
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    await workout.startWorkout();

    res.json({
      status: 'success',
      message: 'Workout started successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to start workout'
    });
  }
});

// @route   POST /api/workouts/:id/complete
// @desc    Complete workout
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        status: 'error',
        message: 'Workout not found'
      });
    }

    await workout.completeWorkout();

    // Update user stats
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateWorkoutStats();
    }

    res.json({
      status: 'success',
      message: 'Workout completed successfully',
      data: {
        workout
      }
    });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete workout'
    });
  }
});

module.exports = router;