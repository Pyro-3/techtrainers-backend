const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 300, // 5 hours max
    },
    targetMuscleGroups: [
      {
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
      },
    ],
    exercises: [
      {
        exerciseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Exercise",
          required: true,
        },
        sets: {
          type: Number,
          min: 1,
          max: 10,
          default: 3,
        },
        reps: {
          type: Number,
          min: 1,
          max: 100,
        },
        duration: {
          type: Number, // in seconds for cardio
          min: 10,
        },
        weight: {
          type: Number, // in kg
          min: 0,
        },
        restTime: {
          type: Number, // in seconds
          default: 60,
          min: 0,
          max: 600,
        },
        notes: String,
      },
    ],
    equipment: [
      {
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
      },
    ],
    type: {
      type: String,
      enum: ["strength", "cardio", "flexibility", "balance", "mixed"],
      default: "strength",
    },
    category: {
      type: String,
      enum: [
        "weight_loss",
        "muscle_building",
        "endurance",
        "flexibility",
        "general_fitness",
      ],
      default: "general_fitness",
    },
    caloriesBurned: {
      type: Number,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    creatorType: {
      type: String,
      enum: ["system", "admin", "trainer", "user"],
      default: "system",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    completions: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
workoutSchema.index({ difficulty: 1 });
workoutSchema.index({ type: 1 });
workoutSchema.index({ category: 1 });
workoutSchema.index({ targetMuscleGroups: 1 });
workoutSchema.index({ createdBy: 1 });
workoutSchema.index({ isPublic: 1, isDeleted: 1 });
workoutSchema.index({ "rating.average": -1 });
workoutSchema.index({ completions: -1 });

// Virtual for total duration including rest
workoutSchema.virtual("totalDuration").get(function () {
  if (!this.exercises || this.exercises.length === 0) return this.duration;

  let total = 0;
  this.exercises.forEach((exercise) => {
    if (exercise.duration) {
      total += exercise.duration * (exercise.sets || 1);
    }
    total += (exercise.restTime || 60) * (exercise.sets || 1);
  });

  return total;
});

// Method to add rating
workoutSchema.methods.addRating = function (rating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + rating) / this.rating.count;
  return this.save();
};

// Method to increment completions
workoutSchema.methods.incrementCompletions = function () {
  this.completions += 1;
  return this.save();
};

// Static method to find by difficulty and muscle group
workoutSchema.statics.findByDifficultyAndMuscle = function (
  difficulty,
  muscleGroup
) {
  return this.find({
    difficulty: difficulty,
    targetMuscleGroups: { $in: [muscleGroup] },
    isPublic: true,
    isDeleted: false,
  });
};

// Pre-save middleware
workoutSchema.pre("save", function (next) {
  // Ensure at least one exercise
  if (this.exercises && this.exercises.length === 0) {
    this.exercises = undefined;
  }

  // Set equipment based on exercises if not provided
  if (!this.equipment || this.equipment.length === 0) {
    this.equipment = ["none"]; // Default
  }

  next();
});

module.exports = mongoose.model("Workout", workoutSchema);
