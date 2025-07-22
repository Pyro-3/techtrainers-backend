const mongoose = require("mongoose");

/**
 * Email Analytics Schema
 * Tracks email delivery metrics and engagement
 */
const emailAnalyticsSchema = new mongoose.Schema(
  {
    recipientEmail: {
      type: String,
      required: true,
      index: true,
    },
    emailType: {
      type: String,
      required: true,
      enum: [
        'appointmentConfirmation',
        'appointmentReminder',
        'appointmentCancellation',
        'noShowNotification',
        'trainerNotification',
        'systemNotification',
        'promotional',
        'weeklyProgress',
        'marketing'
      ],
      index: true,
    },
    subject: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['sent', 'failed', 'bounced', 'delivered', 'opened', 'clicked'],
      default: 'sent',
      index: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deliveredAt: {
      type: Date,
    },
    openedAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    bouncedAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
    retryAttempts: {
      type: Number,
      default: 0,
    },
    relatedAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    relatedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    emailProvider: {
      type: String,
      default: 'smtp',
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      clickedLinks: [String],
      templateVersion: String,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
emailAnalyticsSchema.index({ recipientEmail: 1, sentAt: -1 });
emailAnalyticsSchema.index({ emailType: 1, status: 1, sentAt: -1 });
emailAnalyticsSchema.index({ relatedAppointmentId: 1 });
emailAnalyticsSchema.index({ sentAt: -1 });

// Static methods for analytics
emailAnalyticsSchema.statics.getEmailStats = async function(dateRange = {}) {
  const matchStage = {};
  
  if (dateRange.start || dateRange.end) {
    matchStage.sentAt = {};
    if (dateRange.start) matchStage.sentAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.sentAt.$lte = new Date(dateRange.end);
  }

  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          emailType: '$emailType',
          status: '$status'
        },
        count: { $sum: 1 },
        avgRetryAttempts: { $avg: '$retryAttempts' }
      }
    },
    {
      $group: {
        _id: '$_id.emailType',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgRetryAttempts: '$avgRetryAttempts'
          }
        },
        totalEmails: { $sum: '$count' }
      }
    }
  ]);
};

emailAnalyticsSchema.statics.getUserEmailStats = async function(userEmail, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await this.aggregate([
    {
      $match: {
        recipientEmail: userEmail,
        sentAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$emailType',
        sent: { $sum: 1 },
        delivered: {
          $sum: {
            $cond: [{ $in: ['$status', ['delivered', 'opened', 'clicked']] }, 1, 0]
          }
        },
        opened: {
          $sum: {
            $cond: [{ $in: ['$status', ['opened', 'clicked']] }, 1, 0]
          }
        },
        clicked: {
          $sum: {
            $cond: [{ $eq: ['$status', 'clicked'] }, 1, 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0]
          }
        }
      }
    }
  ]);
};

// Instance methods
emailAnalyticsSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

emailAnalyticsSchema.methods.markAsOpened = function(metadata = {}) {
  this.status = 'opened';
  this.openedAt = new Date();
  if (metadata.userAgent) this.metadata.userAgent = metadata.userAgent;
  if (metadata.ipAddress) this.metadata.ipAddress = metadata.ipAddress;
  return this.save();
};

emailAnalyticsSchema.methods.markAsClicked = function(link, metadata = {}) {
  this.status = 'clicked';
  this.clickedAt = new Date();
  if (!this.metadata.clickedLinks) this.metadata.clickedLinks = [];
  this.metadata.clickedLinks.push(link);
  if (metadata.userAgent) this.metadata.userAgent = metadata.userAgent;
  if (metadata.ipAddress) this.metadata.ipAddress = metadata.ipAddress;
  return this.save();
};

emailAnalyticsSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  return this.save();
};

emailAnalyticsSchema.methods.markAsBounced = function() {
  this.status = 'bounced';
  this.bouncedAt = new Date();
  return this.save();
};

const EmailAnalytics = mongoose.model("EmailAnalytics", emailAnalyticsSchema);

module.exports = EmailAnalytics;
