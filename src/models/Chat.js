const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    messageType: {
      type: String,
      enum: ["regular", "workout_suggestion", "nutrition_advice", "system"],
      default: "regular",
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
        maxlength: 500,
      },
      timestamp: {
        type: Date,
      },
    },
    metadata: {
      tokensUsed: Number,
      aiModel: String,
      responseTime: Number,
      userContext: {
        fitnessLevel: String,
        subscriptionPlan: String,
        goals: [String],
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
chatSchema.index({ userId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, sender: 1 });
chatSchema.index({ userId: 1, messageType: 1 });

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
