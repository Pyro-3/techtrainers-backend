const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: String,
  location: String,
  meetingLink: String,
  meetingId: String,
  cancelReason: String,
  cancelledAt: Date
}, {
  timestamps: true // Creates createdAt and updatedAt automatically
});

// Only define indexes once - remove any timestamp, createdAt, updatedAt indexes
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ trainerId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);