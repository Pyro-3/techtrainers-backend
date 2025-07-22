const express = require('express');
const router = express.Router();
const { requireApprovedTrainer } = require('../middleware/enhancedRoleAuth');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Workout = require('../models/Workout');
const DatabaseLogger = require('../utils/DatabaseLogger');

// Get trainer's clients
router.get('/clients', requireApprovedTrainer, async (req, res) => {
  try {
    const trainerId = req.user._id;
    
    await DatabaseLogger.log('info', 'Trainer clients fetch', {
      trainerId,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Get approved bookings to find clients
    const approvedBookings = await Booking.find({
      trainerId,
      status: 'approved',
      isDeleted: false
    }).populate('clientId', 'name email fitnessLevel profile');
    
    // Get unique clients and their workout data
    const clientsMap = new Map();
    
    for (const booking of approvedBookings) {
      const clientId = booking.clientId._id.toString();
      if (!clientsMap.has(clientId)) {
        // Get client's workouts
        const workouts = await Workout.find({ 
          userId: booking.clientId._id,
          isDeleted: false 
        })
          .select('title status createdAt exercises')
          .sort({ createdAt: -1 })
          .limit(10);
        
        clientsMap.set(clientId, {
          id: clientId,
          name: booking.clientId.name,
          email: booking.clientId.email,
          fitnessLevel: booking.clientId.fitnessLevel || 'beginner',
          workouts: workouts.map(w => ({
            id: w._id,
            name: w.title,
            status: w.status || 'active',
            exerciseCount: w.exercises?.length || 0,
            createdAt: w.createdAt
          }))
        });
      }
    }
    
    const clients = Array.from(clientsMap.values());
    
    res.json(clients);
  } catch (error) {
    await DatabaseLogger.log('error', 'Error fetching trainer clients', {
      trainerId: req.user._id,
      error: error.message
    });
    
    console.error('Error fetching trainer clients:', error);
    res.status(500).json({ 
      error: 'Failed to fetch clients',
      message: 'Internal server error'
    });
  }
});

// Get trainer's booking requests
router.get('/booking-requests', requireApprovedTrainer, async (req, res) => {
  try {
    const trainerId = req.user._id;
    
    const pendingBookings = await Booking.find({
      trainerId,
      status: 'pending',
      isDeleted: false
    })
    .populate('clientId', 'name email profile')
    .sort({ createdAt: -1 });
    
    const requests = pendingBookings.map(booking => ({
      id: booking._id,
      clientName: booking.clientId.name,
      clientId: booking.clientId._id,
      status: booking.status,
      sessionDate: booking.sessionDate,
      sessionType: booking.sessionType,
      message: booking.message,
      createdAt: booking.createdAt,
      duration: booking.duration
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch booking requests',
      message: 'Internal server error'
    });
  }
});

// Handle booking request (approve/reject)
router.patch('/booking-requests/:id', requireApprovedTrainer, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const trainerId = req.user._id;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        error: 'Invalid action',
        message: 'Action must be either "approve" or "reject"'
      });
    }
    
    const booking = await Booking.findOne({
      _id: id,
      trainerId,
      status: 'pending',
      isDeleted: false
    }).populate('clientId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ 
        error: 'Booking request not found',
        message: 'No pending booking request found with this ID'
      });
    }
    
    if (action === 'approve') {
      await booking.approveBooking(trainerId, notes);
    } else {
      await booking.rejectBooking(trainerId, notes || 'Rejected by trainer');
    }
    
    res.json({
      success: true,
      message: `Booking ${action}d successfully`,
      booking: {
        id: booking._id,
        status: booking.status,
        clientName: booking.clientId.name,
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error handling booking request:', error);
    res.status(500).json({ 
      error: 'Failed to process request',
      message: 'Internal server error'
    });
  }
});

// Get specific client details
router.get('/clients/:clientId', requireApprovedTrainer, async (req, res) => {
  try {
    const { clientId } = req.params;
    const trainerId = req.user._id;
    
    // Verify trainer-client relationship
    const relationship = await Booking.findOne({
      trainerId,
      clientId,
      status: 'approved',
      isDeleted: false
    });
    
    if (!relationship) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'No approved relationship with this client'
      });
    }
    
    const client = await User.findById(clientId)
      .select('name email fitnessLevel profile createdAt');
    
    if (!client) {
      return res.status(404).json({ 
        error: 'Client not found',
        message: 'The requested client does not exist'
      });
    }
    
    // Get client's workouts
    const workouts = await Workout.find({ 
      userId: clientId,
      isDeleted: false 
    })
      .select('title status createdAt exercises description difficulty')
      .sort({ createdAt: -1 });
    
    const clientDetails = {
      id: client._id,
      name: client.name,
      email: client.email,
      fitnessLevel: client.fitnessLevel || 'beginner',
      profile: client.profile,
      memberSince: client.createdAt,
      workouts: workouts.map(w => ({
        id: w._id,
        name: w.title,
        status: w.status || 'active',
        difficulty: w.difficulty,
        exerciseCount: w.exercises?.length || 0,
        description: w.description,
        createdAt: w.createdAt
      }))
    };
    
    res.json(clientDetails);
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch client details',
      message: 'Internal server error'
    });
  }
});

module.exports = router;