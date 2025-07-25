const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');
const { validate } = require('../middleware/ReqValidation');
const Joi = require('joi');

// Create appointment validation schema
const createAppointmentSchema = Joi.object({
  type: Joi.string().valid('online', 'in-person').required(),
  date: Joi.date().iso().min('now').required(),
  duration: Joi.number().integer().min(15).max(240).default(60),
  trainerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  notes: Joi.string().max(500),
  location: Joi.when('type', {
    is: 'in-person',
    then: Joi.object({
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required(),
    otherwise: Joi.forbidden()
  })
});

// Update status validation schema
const updateStatusSchema = Joi.object({
  status: Joi.string().valid('cancelled', 'confirmed', 'completed').required(),
  reason: Joi.when('status', {
    is: 'cancelled',
    then: Joi.string().max(200),
    otherwise: Joi.forbidden()
  })
});

// Reschedule validation schema
const rescheduleSchema = Joi.object({
  date: Joi.date().iso().min('now').required()
});

// All routes require authentication
router.use(auth);

// Create new appointment
router.post(
  '/',
  apiLimiter,
  validate(createAppointmentSchema),
  appointmentController.createAppointment
);

// Get user appointments
router.get(
  '/',
  appointmentController.getUserAppointments
);

// Get trainer appointments
router.get(
  '/trainer',
  appointmentController.getTrainerAppointments
);

// Get specific appointment
router.get(
  '/:id',
  appointmentController.getAppointmentDetails
);

// Update appointment status
router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  appointmentController.updateAppointmentStatus
);

// Reschedule appointment
router.patch(
  '/:id/reschedule',
  validate(rescheduleSchema),
  appointmentController.rescheduleAppointment
);

module.exports = router;