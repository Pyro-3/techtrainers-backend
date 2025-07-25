const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

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
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || validator.isMobilePhone(v, "en-CA");
        },
        message: "Please provide a valid Canadian phone number",
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationToken: {
      type: String,
      select: false,
    },
    phoneVerificationExpires: {
      type: Date,
      select: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    profilePicture: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
      fileName: {
        type: String,
        default: null,
      },
      uploadedAt: {
        type: Date,
        default: null,
      },
    },
    profile: {
      age: {
        type: Number,
        min: [13, "Age must be at least 13"],
        max: [120, "Age cannot exceed 120"],
      },
      height: {
        type: Number,
        min: [100, "Height must be at least 100cm"],
      },
      weight: {
        type: Number,
        min: [30, "Weight must be at least 30kg"],
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
      // Email preferences for managing notifications
      email: {
        appointmentReminders: {
          type: Boolean,
          default: true,
        },
        promotionalEmails: {
          type: Boolean,
          default: true,
        },
        trainerUpdates: {
          type: Boolean,
          default: true,
        },
        systemNotifications: {
          type: Boolean,
          default: true,
        },
        weeklyProgressSummary: {
          type: Boolean,
          default: false,
        },
        marketingEmails: {
          type: Boolean,
          default: false,
        }
      }
    },
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
    assignedTrainer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },
    // Authentication & Security
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false,
      },
      secret: {
        type: String,
        select: false,
      },
      backupCodes: {
        type: [String],
        select: false,
      },
      method: {
        type: String,
        enum: ["email", "sms", "app"],
        default: "email",
      },
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Role-based access
    role: {
      type: String,
      enum: ["member", "trainer", "admin"],
      default: "member",
    },
    
    // Admin protection
    isStaticAdmin: {
      type: Boolean,
      default: false,
    },
    
    // Auth0 integration
    auth0Id: {
      type: String,
      sparse: true,
      unique: true,
    },
    
    // Trainer-specific fields
    isApproved: {
      type: Boolean,
      default: function() {
        return this.role !== 'trainer'; // Auto-approve non-trainers
      }
    },
    profileCompleted: {
      type: Boolean,
      default: false, // Only for trainers
    },
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
      certifications: [
        {
          name: String,
          issuer: String,
          dateObtained: Date,
          expiryDate: Date,
          certificateUrl: String,
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
      availability: {
        days: [
          {
            type: String,
            enum: [
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ],
          },
        ],
        timeSlots: [
          {
            start: String, // "09:00"
            end: String, // "17:00"
          },
        ],
      },
      languages: [
        {
          type: String,
          enum: ["english", "french", "spanish", "mandarin", "other"],
        },
      ],
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
    // Static admin protection
    isStaticAdmin: {
      type: Boolean,
      default: false, // Only true for the hardcoded admin account
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ fitnessLevel: 1 });
userSchema.index({ "subscription.plan": 1 });

// Virtual for BMI calculation
userSchema.virtual("profile.bmi").get(function () {
  if (this.profile.weight && this.profile.height) {
    const heightInMeters = this.profile.height / 100;
    return (
      Math.round(
        (this.profile.weight / (heightInMeters * heightInMeters)) * 10
      ) / 10
    );
  }
  return null;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate salt and hash
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Email verification methods
userSchema.methods.generateEmailVerificationToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return token;
};

userSchema.methods.verifyEmail = function () {
  this.emailVerified = true;
  this.emailVerificationToken = undefined;
  this.emailVerificationExpires = undefined;
};

// Phone verification methods
userSchema.methods.generatePhoneVerificationToken = function () {
  const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

  this.phoneVerificationToken = token;
  this.phoneVerificationExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return token;
};

userSchema.methods.verifyPhone = function () {
  this.phoneVerified = true;
  this.phoneVerificationToken = undefined;
  this.phoneVerificationExpires = undefined;
};

// Password reset methods
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return token;
};

// Account lockout methods
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

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
// Note: email and auth0Id indexes are automatically created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ isApproved: 1, role: 1 });
userSchema.index({ "trainerProfile.specialties": 1 });

// Static admin protection
userSchema.pre('remove', function(next) {
  if (this.isStaticAdmin) {
    next(new Error('Cannot delete static admin account'));
  } else {
    next();
  }
});

userSchema.pre('findOneAndDelete', function(next) {
  const query = this.getQuery();
  if (query.isStaticAdmin) {
    next(new Error('Cannot delete static admin account'));
  } else {
    next();
  }
});

module.exports = mongoose.model("User", userSchema);
