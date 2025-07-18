const mongoose = require("mongoose");

/**
 * Booking Model
 * Handles client booking requests and trainer-client relationships
 */
const bookingSchema = new mongoose.Schema(
  {
    // Client who made the booking request
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Trainer who received the booking request
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Booking status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
      index: true,
    },

    // Booking details
    bookingType: {
      type: String,
      enum: ["one-time", "recurring", "package"],
      default: "one-time",
    },

    // Session details
    sessionDate: {
      type: Date,
      required: true,
    },

    sessionTime: {
      start: {
        type: String, // "09:00"
        required: true,
      },
      end: {
        type: String, // "10:00"
        required: true,
      },
    },

    duration: {
      type: Number, // in minutes
      default: 60,
    },

    // Session type
    sessionType: {
      type: String,
      enum: ["in-person", "virtual", "hybrid"],
      default: "in-person",
    },

    // Location (for in-person sessions)
    location: {
      type: String,
      maxlength: 200,
    },

    // Meeting link (for virtual sessions)
    meetingLink: {
      type: String,
      maxlength: 500,
    },

    // Client's goals for this session
    goals: [
      {
        type: String,
        maxlength: 100,
      },
    ],

    // Special requests or notes from client
    clientNotes: {
      type: String,
      maxlength: 500,
    },

    // Trainer's notes
    trainerNotes: {
      type: String,
      maxlength: 500,
    },

    // Payment details
    payment: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "CAD",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
        enum: ["credit-card", "debit-card", "paypal", "bank-transfer", "cash"],
        default: "credit-card",
      },
      transactionId: String,
      paidAt: Date,
    },

    // Recurring booking details
    recurringDetails: {
      frequency: {
        type: String,
        enum: ["weekly", "bi-weekly", "monthly"],
        default: "weekly",
      },
      endDate: Date,
      totalSessions: Number,
      completedSessions: {
        type: Number,
        default: 0,
      },
    },

    // Booking responses
    responses: [
      {
        respondedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        action: {
          type: String,
          enum: ["approved", "rejected", "cancelled", "rescheduled"],
          required: true,
        },
        reason: {
          type: String,
          maxlength: 300,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Cancellation details
    cancellation: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reason: {
        type: String,
        maxlength: 300,
      },
      cancelledAt: Date,
      refundAmount: Number,
    },

    // Session completion
    completion: {
      completedAt: Date,
      clientAttended: {
        type: Boolean,
        default: false,
      },
      trainerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      clientRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      sessionNotes: String,
    },

    // Reminder settings
    reminders: {
      client: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        app: {
          type: Boolean,
          default: true,
        },
      },
      trainer: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        app: {
          type: Boolean,
          default: true,
        },
      },
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
bookingSchema.index({ clientId: 1, status: 1 });
bookingSchema.index({ trainerId: 1, status: 1 });
bookingSchema.index({ sessionDate: 1 });
bookingSchema.index({ status: 1, sessionDate: 1 });
bookingSchema.index({ trainerId: 1, sessionDate: 1 });
bookingSchema.index({ clientId: 1, trainerId: 1 });

// Virtual for session duration in hours
bookingSchema.virtual("durationHours").get(function () {
  return this.duration / 60;
});

// Virtual for booking age
bookingSchema.virtual("bookingAge").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Pre-save middleware
bookingSchema.pre("save", function (next) {
  // Set payment amount if not provided
  if (!this.payment.amount && this.duration) {
    // Default rate calculation (this should be based on trainer's rate)
    this.payment.amount = (this.duration / 60) * 50; // $50/hour default
  }

  next();
});

// Static methods
bookingSchema.statics = {
  // Get bookings for a trainer
  async getTrainerBookings(trainerId, status = null, limit = 20) {
    const filter = { trainerId, isDeleted: false };
    if (status) filter.status = status;

    return this.find(filter)
      .populate("clientId", "name email phone profilePicture")
      .sort({ sessionDate: -1 })
      .limit(limit);
  },

  // Get bookings for a client
  async getClientBookings(clientId, status = null, limit = 20) {
    const filter = { clientId, isDeleted: false };
    if (status) filter.status = status;

    return this.find(filter)
      .populate("trainerId", "name email phone profilePicture trainerProfile")
      .sort({ sessionDate: -1 })
      .limit(limit);
  },

  // Get pending bookings for a trainer
  async getPendingBookings(trainerId) {
    return this.find({
      trainerId,
      status: "pending",
      isDeleted: false,
    })
      .populate("clientId", "name email phone profilePicture")
      .sort({ createdAt: -1 });
  },

  // Get trainer-client relationships (approved bookings)
  async getTrainerClients(trainerId) {
    return this.aggregate([
      {
        $match: {
          trainerId: new mongoose.Types.ObjectId(trainerId),
          status: "approved",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$clientId",
          latestBooking: { $first: "$$ROOT" },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $unwind: "$client",
      },
      {
        $project: {
          client: {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            profilePicture: 1,
            fitnessLevel: 1,
          },
          totalBookings: 1,
          completedBookings: 1,
          latestBooking: 1,
        },
      },
    ]);
  },
};

// Instance methods
bookingSchema.methods = {
  // Approve booking
  async approveBooking(trainerId, trainerNotes = "") {
    this.status = "approved";
    this.trainerNotes = trainerNotes;
    this.responses.push({
      respondedBy: trainerId,
      action: "approved",
      timestamp: new Date(),
    });
    return this.save();
  },

  // Reject booking
  async rejectBooking(trainerId, reason = "") {
    this.status = "rejected";
    this.responses.push({
      respondedBy: trainerId,
      action: "rejected",
      reason,
      timestamp: new Date(),
    });
    return this.save();
  },

  // Cancel booking
  async cancelBooking(userId, reason = "") {
    this.status = "cancelled";
    this.cancellation = {
      cancelledBy: userId,
      reason,
      cancelledAt: new Date(),
    };
    return this.save();
  },

  // Complete booking
  async completeBooking(sessionNotes = "", clientAttended = true) {
    this.status = "completed";
    this.completion = {
      completedAt: new Date(),
      clientAttended,
      sessionNotes,
    };
    return this.save();
  },

  // Soft delete
  async softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
  },
};

module.exports = mongoose.model("Booking", bookingSchema);
