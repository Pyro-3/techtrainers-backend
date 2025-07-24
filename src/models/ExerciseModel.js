const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    muscleGroup: {
      type: String,
      enum: [
        "chest",
        "back",
        "shoulders",
        "biceps",
        "triceps",
        "legs",
        "glutes",
        "abs",
        "cardio",
        "full body",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "balance"],
      default: "strength",
    },
    equipment: {
      type: String,
      enum: [
        "none",
        "dumbbells",
        "barbell",
        "kettlebell",
        "resistance bands",
        "machines",
        "bodyweight",
        "cardio equipment",
        "other",
      ],
      default: "none",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    instructions: [String],
    imageUrl: String,
    videoUrl: String,
    createdBy: {
      type: String,
      enum: ["system", "admin", "user"],
      default: "system",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    bufferCommands: false, // Disable buffering for better performance
  }
);

exerciseSchema.index({ muscleGroup: 1, type: 1, difficulty: 1 });
exerciseSchema.index({ name: "text", description: "text" });

const Exercise = mongoose.model("Exercise", exerciseSchema);

module.exports = Exercise;
