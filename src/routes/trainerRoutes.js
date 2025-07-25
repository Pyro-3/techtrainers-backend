const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Note: In a real app, you'd have a Trainer model
// This is a simplified version for our prototype

// @route   GET /api/trainers
// @desc    Get all trainers
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Mock data for now
    const trainers = [
      {
        id: '1',
        name: 'John Doe',
        specialty: 'Strength Training',
        experience: '5+ years',
        rating: 4.9,
        sessions: 120,
        imageUrl: 'https://example.com/trainer1.jpg'
      },
      {
        id: '2',
        name: 'Jane Smith',
        specialty: 'Yoga & Flexibility',
        experience: '8+ years',
        rating: 4.8,
        sessions: 210,
        imageUrl: 'https://example.com/trainer2.jpg'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        specialty: 'Cardio & HIIT',
        experience: '3+ years',
        rating: 4.7,
        sessions: 85,
        imageUrl: 'https://example.com/trainer3.jpg'
      }
    ];
    
    res.json({
      status: 'success',
      data: {
        trainers
      }
    });
  } catch (error) {
    console.error('Get trainers error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve trainers'
    });
  }
});

// @route   GET /api/trainers/:id
// @desc    Get trainer by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Mock data - in production this would come from a database
    const mockTrainers = {
      '1': {
        id: '1',
        name: 'John Doe',
        specialty: 'Strength Training',
        experience: '5+ years',
        rating: 4.9,
        sessions: 120,
        bio: 'Certified personal trainer specializing in strength and conditioning. Helps clients build muscle and increase overall strength.',
        qualifications: ['NASM Certified', 'Strength & Conditioning Specialist', 'Nutrition Coach'],
        availability: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
        imageUrl: 'https://example.com/trainer1.jpg'
      },
      '2': {
        id: '2',
        name: 'Jane Smith',
        specialty: 'Yoga & Flexibility',
        experience: '8+ years',
        rating: 4.8,
        sessions: 210,
        bio: 'Experienced yoga instructor focused on improving flexibility, balance, and mental well-being.',
        qualifications: ['RYT-500 Certified', 'Meditation Coach', 'Former Gymnast'],
        availability: ['Monday', 'Wednesday', 'Saturday', 'Sunday'],
        imageUrl: 'https://example.com/trainer2.jpg'
      }
    };
    
    const trainer = mockTrainers[req.params.id];
    
    if (!trainer) {
      return res.status(404).json({
        status: 'error',
        message: 'Trainer not found'
      });
    }
    
    res.json({
      status: 'success',
      data: {
        trainer
      }
    });
  } catch (error) {
    console.error('Get trainer error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve trainer'
    });
  }
});

// @route   POST /api/trainers/book-session
// @desc    Book a session with a trainer
// @access  Private
router.post('/book-session', auth, async (req, res) => {
  try {
    const { trainerId, date, time, notes } = req.body;
    
    // In production, validate and save to database
    // For now, just return success
    
    res.json({
      status: 'success',
      message: 'Session booked successfully',
      data: {
        session: {
          id: `session-${Date.now()}`,
          trainerId,
          userId: req.user.id,
          date,
          time,
          notes,
          status: 'confirmed'
        }
      }
    });
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to book session'
    });
  }
});

// @route   GET /api/trainers/my-sessions
// @desc    Get current user's trainer sessions
// @access  Private
router.get('/my-sessions', auth, async (req, res) => {
  try {
    // Mock data - in production this would come from a database
    const sessions = [
      {
        id: 'session-1',
        trainer: {
          id: '1',
          name: 'John Doe',
          specialty: 'Strength Training',
          imageUrl: 'https://example.com/trainer1.jpg'
        },
        date: '2025-06-20',
        time: '10:00 AM',
        status: 'confirmed',
        notes: 'Focus on upper body'
      }
    ];
    
    res.json({
      status: 'success',
      data: {
        sessions
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to retrieve sessions'
    });
  }
});

module.exports = router;
