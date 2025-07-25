const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Hide password by default, but allow explicit selection
    },
    role: {
      type: String,
      enum: ["member", "trainer", "admin"],
      default: "member",
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "trainer"; // Auto-approve non-trainers
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    // Basic profile information
    profile: {
      age: { type: Number, min: 13, max: 120 },
      weight: { type: Number, min: 30, max: 300 },
      height: { type: Number, min: 100, max: 250 },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
        default: "prefer_not_to_say",
      },
      goals: [
        {
          type: String,
          enum: [
            "weight_loss",
            "muscle_gain",
            "strength_building",
            "endurance_improvement",
            "flexibility_mobility",
            "athletic_performance",
            "general_fitness",
            "body_toning",
            "stress_relief",
            "rehabilitation",
            "competition_prep",
            "lifestyle_change",
          ],
        },
      ],
      experience: {
        type: String,
        enum: [
          "none",
          "less_than_1_year",
          "1_to_3_years",
          "3_to_5_years",
          "more_than_5_years",
        ],
        default: "none",
      },
    },
    // User preferences
    preferences: {
      workoutDuration: {
        type: Number,
        default: 60,
        min: [15, "Workout duration must be at least 15 minutes"],
      },
      workoutFrequency: {
        type: Number,
        default: 3,
        min: [1, "Workout frequency must be at least 1 day per week"],
        max: [7, "Workout frequency cannot exceed 7 days per week"],
      },
      preferredTime: {
        type: String,
        enum: ["morning", "afternoon", "evening"],
        default: "evening",
      },
    },
    // Workout statistics
    stats: {
      totalWorkouts: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      totalExercises: {
        type: Number,
        default: 0,
      },
      personalRecords: [
        {
          exercise: String,
          weight: Number,
          reps: Number,
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    // Subscription information
    subscription: {
      plan: {
        type: String,
        enum: ["free", "intermediate", "advanced"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled"],
        default: "active",
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
    },
    // Security fields
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Trainer-specific fields (only used when role is 'trainer')
    trainerProfile: {
      bio: {
        type: String,
        maxlength: 1000,
      },
      specialties: [
        {
          type: String,
          enum: [
            "weight-loss",
            "muscle-gain",
            "strength-training",
            "cardio",
            "flexibility",
            "nutrition",
            "rehabilitation",
            "sports-specific",
            "senior-fitness",
            "youth-fitness",
          ],
        },
      ],
      experience: {
        type: Number, // Years of experience
        min: 0,
        max: 50,
      },
      hourlyRate: {
        type: Number,
        min: 0,
      },
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for BMI calculation
userSchema.virtual("profile.bmi").get(function () {
  if (this.profile && this.profile.weight && this.profile.height) {
    const heightInMeters = this.profile.height / 100;
    return (
      Math.round(
        (this.profile.weight / (heightInMeters * heightInMeters)) * 10
      ) / 100
    );
  }
  return null;
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password (FIXED)
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Check if password is already hashed (starts with $2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      console.log('Password already hashed, skipping hash step');
      return next();
    }

    console.log('Hashing password for user:', this.email);
    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to compare password (alternative name for compatibility)
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  const maxAttempts = 5;
  const lockTime = 30 * 60 * 1000; // 30 minutes

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1, loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Method to update workout stats
userSchema.methods.updateWorkoutStats = function () {
  this.stats.totalWorkouts += 1;
  this.stats.currentStreak += 1;

  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }

  return this.save();
};

// Method to add personal record
userSchema.methods.addPersonalRecord = function (exercise, weight, reps) {
  const existingRecord = this.stats.personalRecords.find(
    (pr) => pr.exercise === exercise
  );

  if (existingRecord) {
    if (
      weight > existingRecord.weight ||
      (weight === existingRecord.weight && reps > existingRecord.reps)
    ) {
      existingRecord.weight = weight;
      existingRecord.reps = reps;
      existingRecord.date = new Date();
    }
  } else {
    this.stats.personalRecords.push({
      exercise,
      weight,
      reps,
      date: new Date(),
    });
  }

  return this.save();
};

// Indexes for performance
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1, role: 1 });
userSchema.index({ "subscription.plan": 1 });
userSchema.index({ fitnessLevel: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;