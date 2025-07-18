const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { 
  requireAuth, 
  requireTrainer, 
  requireApprovedTrainer,
  requireOwnerOrAdmin 
} = require('../middleware/enhancedRoleAuth');
const { validateObjectId } = require('../middleware/ReqValidation');

/**
 * Booking Routes
 * Handles all booking-related operations between clients and trainers
 */

// Create a new booking request (Client)
router.post('/', requireAuth, bookingController.createBooking);

// Get all bookings for current user (Client or Trainer)
router.get('/', requireAuth, bookingController.getUserBookings);

// Get specific booking by ID
router.get('/:id', validateObjectId, requireAuth, bookingController.getBookingById);

// Update booking status (Trainer only - approve/reject)
router.patch('/:id/status', validateObjectId, requireApprovedTrainer, bookingController.updateBookingStatus);

// Cancel booking (Client or Trainer)
router.patch('/:id/cancel', validateObjectId, requireAuth, bookingController.cancelBooking);

// Add feedback to completed booking
router.post('/:id/feedback', validateObjectId, requireAuth, bookingController.addBookingFeedback);

// Trainer-specific routes
router.get('/trainer/requests', requireApprovedTrainer, bookingController.getTrainerBookingRequests);
router.get('/trainer/clients', requireApprovedTrainer, bookingController.getTrainerClients);

// Admin routes
router.get('/admin/all', requireOwnerOrAdmin(() => 'admin'), bookingController.getAllBookings);
router.delete('/admin/:id', validateObjectId, requireOwnerOrAdmin(() => 'admin'), bookingController.deleteBooking);

module.exports = router;
