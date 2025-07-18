const mongoose = require("mongoose");

/**
 * Support Feedback Model
 * Stores feedback about support experiences and ticket resolutions
 */
const supportFeedbackSchema = new mongoose.Schema({
  // Reference to the user who submitted the feedback
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  // Optional reference to the specific support ticket
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SupportTicket",
  },

  // Rating from 1-5 stars
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: "Rating must be an integer between 1 and 5",
    },
  },

  // Written feedback comment
  feedback: {
    type: String,
    maxlength: 1000,
    trim: true,
  },

  // Category of feedback
  category: {
    type: String,
    enum: ["general", "response-time", "helpfulness", "resolution", "other"],
    default: "general",
  },

  // Support agent who handled the ticket (if applicable)
  supportAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // Response time in hours (calculated from ticket creation to first response)
  responseTime: {
    type: Number,
    min: 0,
  },

  // Resolution time in hours (calculated from ticket creation to closure)
  resolutionTime: {
    type: Number,
    min: 0,
  },

  // Was the issue resolved?
  wasResolved: {
    type: Boolean,
    default: null,
  },

  // Would the user recommend our support?
  wouldRecommend: {
    type: Boolean,
    default: null,
  },

  // Additional metadata
  metadata: {
    // Device/platform information
    platform: String,
    userAgent: String,

    // App version when feedback was submitted
    appVersion: String,

    // IP address (for analytics, anonymized)
    ipAddress: String,

    // Ticket statistics when feedback was submitted
    ticketStats: {
      totalMessages: Number,
      ticketDuration: Number, // in hours
      reopenCount: Number,
    },
  },

  // Follow-up information
  followUp: {
    contacted: {
      type: Boolean,
      default: false,
    },
    contactedAt: Date,
    contactedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
  },

  // Admin notes for internal use
  adminNotes: {
    type: String,
    maxlength: 500,
  },

  // Status of the feedback
  status: {
    type: String,
    enum: ["new", "reviewed", "addressed", "archived"],
    default: "new",
  },

  // Tags for categorization
  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],

  // Visibility settings
  isPublic: {
    type: Boolean,
    default: false,
  },

  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },

  deletedAt: Date,

  // Timestamps
  submittedAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
supportFeedbackSchema.index({ userId: 1, submittedAt: -1 });
supportFeedbackSchema.index({ ticketId: 1 });
supportFeedbackSchema.index({ rating: 1 });
supportFeedbackSchema.index({ category: 1 });
supportFeedbackSchema.index({ status: 1 });
supportFeedbackSchema.index({ supportAgent: 1 });
supportFeedbackSchema.index({ submittedAt: -1 });
supportFeedbackSchema.index({ isDeleted: 1 });

// Compound indexes
supportFeedbackSchema.index(
  { userId: 1, ticketId: 1 },
  { unique: true, sparse: true }
);
supportFeedbackSchema.index({ category: 1, rating: 1 });
supportFeedbackSchema.index({ supportAgent: 1, rating: 1 });

// Virtual for calculated fields
supportFeedbackSchema.virtual("timeToSubmit").get(function () {
  if (this.ticketId && this.ticketId.createdAt) {
    return Math.round(
      (this.submittedAt - this.ticketId.createdAt) / (1000 * 60 * 60)
    ); // hours
  }
  return null;
});

// Pre-save middleware
supportFeedbackSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // Auto-tag based on rating
  if (this.rating <= 2 && !this.tags.includes("low-rating")) {
    this.tags.push("low-rating");
  } else if (this.rating >= 4 && !this.tags.includes("high-rating")) {
    this.tags.push("high-rating");
  }

  // Auto-tag based on category
  if (
    this.category === "response-time" &&
    !this.tags.includes("response-time-feedback")
  ) {
    this.tags.push("response-time-feedback");
  }

  next();
});

// Static methods
supportFeedbackSchema.statics = {
  // Get feedback statistics
  async getStats(timeframe = "30d") {
    const timeLimit = new Date();
    if (timeframe === "24h") {
      timeLimit.setHours(timeLimit.getHours() - 24);
    } else if (timeframe === "7d") {
      timeLimit.setDate(timeLimit.getDate() - 7);
    } else if (timeframe === "30d") {
      timeLimit.setDate(timeLimit.getDate() - 30);
    } else if (timeframe === "90d") {
      timeLimit.setDate(timeLimit.getDate() - 90);
    }

    const stats = await this.aggregate([
      { $match: { submittedAt: { $gte: timeLimit }, isDeleted: false } },
      {
        $group: {
          _id: null,
          totalFeedback: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating",
          },
          categoryCounts: {
            $push: "$category",
          },
        },
      },
    ]);

    return stats[0] || {};
  },

  // Get feedback by rating
  async getFeedbackByRating(rating, limit = 10) {
    return this.find({ rating, isDeleted: false })
      .populate("userId", "name email")
      .populate("ticketId", "subject category status")
      .sort({ submittedAt: -1 })
      .limit(limit);
  },

  // Get low-rated feedback for immediate attention
  async getLowRatedFeedback(limit = 20) {
    return this.find({
      rating: { $lte: 2 },
      status: { $in: ["new", "reviewed"] },
      isDeleted: false,
    })
      .populate("userId", "name email")
      .populate("ticketId", "subject category status")
      .sort({ submittedAt: -1 })
      .limit(limit);
  },

  // Get feedback trends
  async getTrends(timeframe = "30d", groupBy = "day") {
    const timeLimit = new Date();
    if (timeframe === "7d") {
      timeLimit.setDate(timeLimit.getDate() - 7);
    } else if (timeframe === "30d") {
      timeLimit.setDate(timeLimit.getDate() - 30);
    } else if (timeframe === "90d") {
      timeLimit.setDate(timeLimit.getDate() - 90);
    }

    const groupFormat =
      groupBy === "day" ? "%Y-%m-%d" : groupBy === "week" ? "%Y-%U" : "%Y-%m";

    return this.aggregate([
      { $match: { submittedAt: { $gte: timeLimit }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$submittedAt" } },
          count: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratings: { $push: "$rating" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },
};

// Instance methods
supportFeedbackSchema.methods = {
  // Mark feedback as reviewed
  async markAsReviewed(reviewedBy) {
    this.status = "reviewed";
    this.followUp.contacted = true;
    this.followUp.contactedAt = new Date();
    this.followUp.contactedBy = reviewedBy;
    return this.save();
  },

  // Add admin notes
  async addAdminNote(note, adminId) {
    this.adminNotes = note;
    this.updatedAt = new Date();
    return this.save();
  },

  // Soft delete
  async softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  },
};

module.exports = mongoose.model("SupportFeedback", supportFeedbackSchema);
