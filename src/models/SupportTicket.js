const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ["general", "technical", "billing", "workout", "account"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "support", "admin", "system"],
          required: true,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        attachments: [String],
      },
    ],
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      category: {
        type: String,
        enum: [
          "general",
          "response-time",
          "helpfulness",
          "resolution",
          "other",
        ],
        default: "general",
      },
      submittedAt: Date,
    },
    reopenCount: {
      type: Number,
      default: 0,
    },
    isUserDeleted: {
      type: Boolean,
      default: false,
    },
    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
supportTicketSchema.index({ userId: 1, status: 1 });
supportTicketSchema.index({ status: 1, priority: -1 });

const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);

module.exports = SupportTicket;
