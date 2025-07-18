const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['system', 'workout', 'progress', 'support', 'billing'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  }, // ID of related resource (workout, ticket, etc.)
  referenceModel: {
    type: String,
    enum: ['Workout', 'Progress', 'SupportTicket', 'User']
  },
  actionUrl: String, // URL to navigate to when clicked
  expiresAt: Date
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index to auto-delete old notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;