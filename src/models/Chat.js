const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    messageType: {
      type: String,
      enum: ["text", "workout_suggestion", "nutrition_advice"],
      default: "text",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // This creates createdAt and updatedAt automatically
  }
);

// Only define indexes once - remove any timestamp, createdAt, updatedAt indexes
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ sender: 1 });

// Methods
chatSchema.methods.toClientFormat = function () {
  return {
    id: this._id,
    from: this.sender,
    content: this.content,
    timestamp: this.timestamp,
    messageType: this.messageType,
    feedback: this.feedback,
  };
};

// Statics
chatSchema.statics.getRecentMessages = function (userId, limit = 10) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select("sender content timestamp messageType");
};

chatSchema.statics.getUserChatStats = function (userId, timeframe = "24h") {
  const timeLimit = new Date();
  if (timeframe === "24h") {
    timeLimit.setHours(timeLimit.getHours() - 24);
  } else if (timeframe === "7d") {
    timeLimit.setDate(timeLimit.getDate() - 7);
  } else if (timeframe === "30d") {
    timeLimit.setDate(timeLimit.getDate() - 30);
  }

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: timeLimit },
      },
    },
    {
      $group: {
        _id: "$sender",
        count: { $sum: 1 },
        averageLength: { $avg: { $strLenCP: "$content" } },
      },
    },
  ]);
};

module.exports = mongoose.model("Chat", chatSchema);
