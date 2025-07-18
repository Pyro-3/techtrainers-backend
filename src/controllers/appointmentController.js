const Appointment = require('../models/AppointmentModel');
const User = require('../models/User');
const { createMSTeamsMeeting } = require('../services/msTeamsServices');
const { sendAppointmentEmail } = require('../services/appointmentEmail');
const { formatSuccess, formatError } = require('../utils/ApiResFormat');

/**
 * Appointment controller
 * Handles appointment creation, management, and related operations
 */
const appointmentController = {
  /**
   * Create a new appointment
   * @route POST /api/appointments
   */
  createAppointment: async (req, res) => {
    try {
      const { type, date, duration, trainerId, notes, location } = req.body;
      const userId = req.user._id; // From auth middleware
      
      // Validate date is in the future
      const appointmentDate = new Date(date);
      if (appointmentDate < new Date()) {
        return res.status(400).json(
          formatError('Appointment date must be in the future')
        );
      }
      
      // Check trainer exists
      const trainer = await User.findOne({ 
        _id: trainerId, 
        role: 'trainer',
        isActive: true 
      });
      
      if (!trainer) {
        return res.status(404).json(
          formatError('Trainer not found or inactive')
        );
      }
      
      // Check for scheduling conflicts
      const conflictingAppointments = await Appointment.find({
        $or: [
          { 
            trainerId,
            status: { $in: ['pending', 'confirmed'] },
            date: {
              $lt: new Date(new Date(date).getTime() + duration * 60000),
              $gt: new Date(new Date(date).getTime() - 30 * 60000) // Buffer of 30 minutes
            }
          },
          { 
            userId,
            status: { $in: ['pending', 'confirmed'] },
            date: {
              $lt: new Date(new Date(date).getTime() + duration * 60000),
              $gt: new Date(new Date(date).getTime() - 30 * 60000)
            }
          }
        ]
      });
      
      if (conflictingAppointments.length > 0) {
        return res.status(409).json(
          formatError('Scheduling conflict detected. Please choose another time.')
        );
      }
      
      // Create appointment object
      const appointmentData = {
        userId,
        trainerId,
        type,
        date: appointmentDate,
        duration,
        notes,
        status: 'pending'
      };
      
      // Add location for in-person appointments
      if (type === 'in-person' && location) {
        appointmentData.location = location;
      }
      
      // Create appointment in database
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      
      // If online, create Teams meeting
      if (type === 'online') {
        try {
          const user = await User.findById(userId);
          
          // Create Teams meeting
          const meetingDetails = await createMSTeamsMeeting({
            subject: `Fitness Training Session with ${trainer.name}`,
            startTime: appointmentDate,
            endTime: new Date(appointmentDate.getTime() + duration * 60000),
            attendees: [
              { email: user.email, name: user.name },
              { email: trainer.email, name: trainer.name }
            ],
            content: notes || 'Personal training session'
          });
          
          // Update appointment with meeting details
          appointment.meetingLink = meetingDetails.joinLink;
          appointment.meetingId = meetingDetails.id;
          await appointment.save();
          
          // Send email with meeting details
          await sendAppointmentEmail({
            type: 'online-appointment-created',
            appointment,
            user,
            trainer,
            meetingLink: meetingDetails.joinLink
          });
        } catch (teamsError) {
          console.error('Teams meeting creation failed:', teamsError);
          
          // Continue without Teams integration if it fails
          await sendAppointmentEmail({
            type: 'online-appointment-created-without-link',
            appointment,
            user: await User.findById(userId),
            trainer
          });
        }
      } else {
        // Send email for in-person appointment
        await sendAppointmentEmail({
          type: 'in-person-appointment-created',
          appointment,
          user: await User.findById(userId),
          trainer
        });
      }
      
      // Return success response
      res.status(201).json(
        formatSuccess(
          { appointment: await Appointment.findById(appointment._id).populate('trainerId', 'name email') }, 
          'Appointment created successfully'
        )
      );
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json(
        formatError('Failed to create appointment', 500, error.message)
      );
    }
  },

  /**
   * Get all appointments for current user
   * @route GET /api/appointments
   */
  getUserAppointments: async (req, res) => {
    try {
      const userId = req.user._id;
      const { status, upcoming, past, page = 1, limit = 10 } = req.query;
      
      const query = { userId };
      
      // Filter by status if provided
      if (status) {
        query.status = status;
      }
      
      // Filter by date
      const now = new Date();
      if (upcoming === 'true') {
        query.date = { $gt: now };
      } else if (past === 'true') {
        query.date = { $lt: now };
      }
      
      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get appointments
      const appointments = await Appointment.find(query)
        .sort({ date: upcoming === 'true' ? 1 : -1 }) // Ascending for upcoming, descending for past
        .skip(skip)
        .limit(parseInt(limit))
        .populate('trainerId', 'name email profilePicture')
        .lean();
      
      // Get total count for pagination
      const total = await Appointment.countDocuments(query);
      
      res.status(200).json(
        formatSuccess({
          appointments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        })
      );
    } catch (error) {
      console.error('Get user appointments error:', error);
      res.status(500).json(
        formatError('Failed to retrieve appointments', 500, error.message)
      );
    }
  },

  /**
   * Get all appointments for a trainer
   * @route GET /api/appointments/trainer
   */
  getTrainerAppointments: async (req, res) => {
    try {
      // Ensure user is a trainer
      if (req.user.role !== 'trainer') {
        return res.status(403).json(
          formatError('Access denied. Only trainers can access this endpoint.')
        );
      }
      
      const trainerId = req.user._id;
      const { status, upcoming, past, page = 1, limit = 10 } = req.query;
      
      const query = { trainerId };
      
      // Filter by status if provided
      if (status) {
        query.status = status;
      }
      
      // Filter by date
      const now = new Date();
      if (upcoming === 'true') {
        query.date = { $gt: now };
      } else if (past === 'true') {
        query.date = { $lt: now };
      }
      
      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get appointments
      const appointments = await Appointment.find(query)
        .sort({ date: upcoming === 'true' ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'name email profilePicture')
        .lean();
      
      // Get total count for pagination
      const total = await Appointment.countDocuments(query);
      
      res.status(200).json(
        formatSuccess({
          appointments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        })
      );
    } catch (error) {
      console.error('Get trainer appointments error:', error);
      res.status(500).json(
        formatError('Failed to retrieve appointments', 500, error.message)
      );
    }
  },

  /**
   * Get appointment details
   * @route GET /api/appointments/:id
   */
  getAppointmentDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      // Find appointment and ensure user has access
      const appointment = await Appointment.findOne({
        _id: id,
        $or: [
          { userId },
          { trainerId: userId }
        ]
      })
        .populate('userId', 'name email profilePicture')
        .populate('trainerId', 'name email profilePicture');
      
      if (!appointment) {
        return res.status(404).json(
          formatError('Appointment not found or access denied')
        );
      }
      
      res.status(200).json(
        formatSuccess({ appointment })
      );
    } catch (error) {
      console.error('Get appointment details error:', error);
      res.status(500).json(
        formatError('Failed to retrieve appointment details', 500, error.message)
      );
    }
  },

  /**
   * Update appointment status
   * @route PATCH /api/appointments/:id/status
   */
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const userId = req.user._id;
      
      // Find appointment
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json(
          formatError('Appointment not found')
        );
      }
      
      // Verify user has permission to update
      if (!appointment.userId.equals(userId) && !appointment.trainerId.equals(userId)) {
        return res.status(403).json(
          formatError('Access denied. You cannot update this appointment.')
        );
      }
      
      // Handle status updates
      const oldStatus = appointment.status;
      
      if (status === 'cancelled' && oldStatus !== 'cancelled') {
        appointment.status = 'cancelled';
        appointment.cancelledAt = new Date();
        appointment.cancelReason = reason || 'No reason provided';
        
        // Send cancellation emails
        const user = await User.findById(appointment.userId);
        const trainer = await User.findById(appointment.trainerId);
        
        await sendAppointmentEmail({
          type: 'appointment-cancelled',
          appointment,
          user,
          trainer,
          cancelledBy: userId.equals(appointment.userId) ? 'client' : 'trainer',
          reason: appointment.cancelReason
        });
      } else if (status === 'confirmed' && oldStatus === 'pending') {
        appointment.status = 'confirmed';
        
        // Send confirmation emails
        const user = await User.findById(appointment.userId);
        const trainer = await User.findById(appointment.trainerId);
        
        await sendAppointmentEmail({
          type: 'appointment-confirmed',
          appointment,
          user,
          trainer
        });
      } else if (status === 'completed' && (oldStatus === 'confirmed' || oldStatus === 'pending')) {
        // Only trainers can mark as completed
        if (!appointment.trainerId.equals(userId)) {
          return res.status(403).json(
            formatError('Only trainers can mark appointments as completed')
          );
        }
        
        appointment.status = 'completed';
      } else {
        return res.status(400).json(
          formatError('Invalid status change')
        );
      }
      
      // Save the updated appointment
      await appointment.save();
      
      res.status(200).json(
        formatSuccess(
          { appointment }, 
          `Appointment status updated to ${status}`
        )
      );
    } catch (error) {
      console.error('Update appointment status error:', error);
      res.status(500).json(
        formatError('Failed to update appointment status', 500, error.message)
      );
    }
  },

  /**
   * Reschedule appointment
   * @route PATCH /api/appointments/:id/reschedule
   */
  rescheduleAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { date } = req.body;
      const userId = req.user._id;
      
      // Validate new date is in the future
      const newDate = new Date(date);
      if (newDate < new Date()) {
        return res.status(400).json(
          formatError('New appointment date must be in the future')
        );
      }
      
      // Find appointment
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json(
          formatError('Appointment not found')
        );
      }
      
      // Verify user has permission to update
      if (!appointment.userId.equals(userId) && !appointment.trainerId.equals(userId)) {
        return res.status(403).json(
          formatError('Access denied. You cannot update this appointment.')
        );
      }
      
      // Check if appointment can be rescheduled
      if (appointment.status === 'cancelled' || appointment.status === 'completed') {
        return res.status(400).json(
          formatError(`Cannot reschedule an appointment with status: ${appointment.status}`)
        );
      }
      
      // Check for scheduling conflicts
      const conflictingAppointments = await Appointment.find({
        $or: [
          { 
            trainerId: appointment.trainerId,
            _id: { $ne: id }, // Exclude current appointment
            status: { $in: ['pending', 'confirmed'] },
            date: {
              $lt: new Date(newDate.getTime() + appointment.duration * 60000),
              $gt: new Date(newDate.getTime() - 30 * 60000) // Buffer of 30 minutes
            }
          },
          { 
            userId: appointment.userId,
            _id: { $ne: id }, // Exclude current appointment
            status: { $in: ['pending', 'confirmed'] },
            date: {
              $lt: new Date(newDate.getTime() + appointment.duration * 60000),
              $gt: new Date(newDate.getTime() - 30 * 60000)
            }
          }
        ]
      });
      
      if (conflictingAppointments.length > 0) {
        return res.status(409).json(
          formatError('Scheduling conflict detected. Please choose another time.')
        );
      }
      
      // Update appointment date
      const oldDate = appointment.date;
      appointment.date = newDate;
      await appointment.save();
      
      // If online, update Teams meeting
      if (appointment.type === 'online' && appointment.meetingId) {
        try {
          await updateMSTeamsMeeting({
            meetingId: appointment.meetingId,
            startTime: newDate,
            endTime: new Date(newDate.getTime() + appointment.duration * 60000)
          });
        } catch (teamsError) {
          console.error('Teams meeting update failed:', teamsError);
          // Continue even if Teams update fails
        }
      }
      
      // Send rescheduling emails
      const user = await User.findById(appointment.userId);
      const trainer = await User.findById(appointment.trainerId);
      
      await sendAppointmentEmail({
        type: 'appointment-rescheduled',
        appointment,
        user,
        trainer,
        oldDate,
        rescheduledBy: userId.equals(appointment.userId) ? 'client' : 'trainer'
      });
      
      res.status(200).json(
        formatSuccess(
          { appointment }, 
          'Appointment rescheduled successfully'
        )
      );
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json(
        formatError('Failed to reschedule appointment', 500, error.message)
      );
    }
  }
};

module.exports = appointmentController;