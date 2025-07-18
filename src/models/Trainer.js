const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const trainerSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [30, "First name cannot exceed 30 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\+?[\d\s\-\(\)]+$/.test(v);
        },
        message: "Please provide a valid phone number",
      },
    },

    // Professional Information
    credentials: {
      certifications: [
        {
          name: {
            type: String,
            required: true,
          },
          organization: {
            type: String,
            required: true,
          },
          issueDate: {
            type: Date,
            required: true,
          },
          expiryDate: {
            type: Date,
          },
          certificateNumber: String,
          verified: {
            type: Boolean,
            default: false,
          },
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          graduationYear: Number,
          field: String,
        },
      ],
      experience: {
        years: {
          type: Number,
          required: [true, "Years of experience is required"],
          min: [0, "Experience cannot be negative"],
        },
        previousGyms: [
          {
            name: String,
            position: String,
            startDate: Date,
            endDate: Date,
            description: String,
          },
        ],
      },
    },

    // Specializations and Skills
    specializations: [
      {
        type: String,
        enum: [
          "strength_training",
          "cardio_fitness",
          "weight_loss",
          "muscle_building",
          "athletic_performance",
          "rehabilitation",
          "senior_fitness",
          "youth_training",
          "functional_training",
          "crossfit",
          "powerlifting",
          "bodybuilding",
          "martial_arts",
          "yoga",
          "pilates",
          "nutrition_coaching",
          "sports_specific",
          "injury_prevention",
        ],
      },
    ],

    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "intermediate",
        },
      },
    ],

    // Profile Information
    profile: {
      bio: {
        type: String,
        maxlength: [1000, "Bio cannot exceed 1000 characters"],
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
      age: {
        type: Number,
        min: [18, "Trainers must be at least 18 years old"],
        max: [100, "Age cannot exceed 100"],
      },
      location: {
        city: String,
        state: String,
        country: String,
        coordinates: {
          latitude: Number,
          longitude: Number,
        },
      },
      languages: [
        {
          type: String,
          default: ["English"],
        },
      ],
    },

    // Availability and Scheduling
    availability: {
      timezone: {
        type: String,
        default: "UTC",
      },
      workingHours: {
        monday: {
          isAvailable: { type: Boolean, default: true },
          startTime: { type: String, default: "09:00" },
          endTime: { type: String, default: "17:00" },
        },
        tuesday: {
          isAvailable: { type: Boolean, default: true },
          startTime: { type: String, default: "09:00" },
          endTime: { type: String, default: "17:00" },
        },
        wednesday: {
          isAvailable: { type: Boolean, default: true },
          startTime: { type: String, default: "09:00" },
          endTime: { type: String, default: "17:00" },
        },
        thursday: {
          isAvailable: { type: Boolean, default: true },
          startTime: { type: String, default: "09:00" },
          endTime: { type: String, default: "17:00" },
        },
        friday: {
          isAvailable: { type: Boolean, default: true },
          startTime: { type: String, default: "09:00" },
          endTime: { type: String, default: "17:00" },
        },
        saturday: {
          isAvailable: { type: Boolean, default: false },
          startTime: { type: String, default: "10:00" },
          endTime: { type: String, default: "14:00" },
        },
        sunday: {
          isAvailable: { type: Boolean, default: false },
          startTime: { type: String, default: "10:00" },
          endTime: { type: String, default: "14:00" },
        },
      },
      blackoutDates: [
        {
          startDate: Date,
          endDate: Date,
          reason: String,
        },
      ],
    },

    // Pricing and Services
    services: {
      personalTraining: {
        isOffered: { type: Boolean, default: true },
        price: {
          perSession: Number,
          perMonth: Number,
          currency: { type: String, default: "USD" },
        },
        sessionDuration: { type: Number, default: 60 }, // minutes
        packageDeals: [
          {
            sessions: Number,
            price: Number,
            description: String,
          },
        ],
      },
      groupTraining: {
        isOffered: { type: Boolean, default: false },
        maxGroupSize: { type: Number, default: 6 },
        price: {
          perSession: Number,
          perPerson: Number,
          currency: { type: String, default: "USD" },
        },
      },
      onlineCoaching: {
        isOffered: { type: Boolean, default: false },
        price: {
          perMonth: Number,
          currency: { type: String, default: "USD" },
        },
      },
      nutritionCoaching: {
        isOffered: { type: Boolean, default: false },
        price: {
          perSession: Number,
          perMonth: Number,
          currency: { type: String, default: "USD" },
        },
      },
    },

    // Statistics and Performance
    stats: {
      totalClients: {
        type: Number,
        default: 0,
      },
      activeClients: {
        type: Number,
        default: 0,
      },
      totalSessions: {
        type: Number,
        default: 0,
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        totalReviews: {
          type: Number,
          default: 0,
        },
      },
      earnings: {
        total: {
          type: Number,
          default: 0,
        },
        thisMonth: {
          type: Number,
          default: 0,
        },
        lastMonth: {
          type: Number,
          default: 0,
        },
      },
      successStories: [
        {
          clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          title: String,
          description: String,
          beforeAfterImages: [String],
          achievements: [String],
          duration: String, // e.g., "3 months"
          isPublic: {
            type: Boolean,
            default: false,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // Account Status and Settings
    account: {
      status: {
        type: String,
        enum: ["pending", "active", "suspended", "inactive"],
        default: "pending",
      },
      verificationStatus: {
        email: { type: Boolean, default: false },
        phone: { type: Boolean, default: false },
        identity: { type: Boolean, default: false },
        credentials: { type: Boolean, default: false },
      },
      subscriptionPlan: {
        type: String,
        enum: ["basic", "premium", "enterprise"],
        default: "basic",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      lastLoginAt: {
        type: Date,
      },
      isOnline: {
        type: Boolean,
        default: false,
      },
    },

    // Settings and Preferences
    settings: {
      notifications: {
        email: {
          newClients: { type: Boolean, default: true },
          sessionReminders: { type: Boolean, default: true },
          paymentUpdates: { type: Boolean, default: true },
          reviews: { type: Boolean, default: true },
        },
        push: {
          newClients: { type: Boolean, default: true },
          sessionReminders: { type: Boolean, default: true },
          messages: { type: Boolean, default: true },
        },
      },
      privacy: {
        showEmail: { type: Boolean, default: false },
        showPhone: { type: Boolean, default: false },
        allowReviews: { type: Boolean, default: true },
        showLocation: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
trainerSchema.index({ email: 1 });
trainerSchema.index({ "profile.location.city": 1 });
trainerSchema.index({ specializations: 1 });
trainerSchema.index({ "account.status": 1 });
trainerSchema.index({ "stats.rating.average": -1 });

// Virtual for full name
trainerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for active client count calculation
trainerSchema.virtual("clientCount", {
  ref: "User",
  localField: "_id",
  foreignField: "assignedTrainer",
  count: true,
});

// Pre-save middleware to hash password
trainerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
trainerSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to calculate average rating
trainerSchema.methods.calculateAverageRating = function () {
  // This would typically aggregate from a Reviews collection
  // For now, return the stored average
  return this.stats.rating.average;
};

// Method to check availability for a specific time slot
trainerSchema.methods.isAvailableAt = function (dateTime) {
  const dayOfWeek = dateTime.toLocaleDateString("en-US", {
    weekday: "lowercase",
  });
  const timeString = dateTime.toTimeString().substr(0, 5);

  const dayAvailability = this.availability.workingHours[dayOfWeek];

  if (!dayAvailability.isAvailable) return false;

  return (
    timeString >= dayAvailability.startTime &&
    timeString <= dayAvailability.endTime
  );
};

// Static method to find trainers by specialization
trainerSchema.statics.findBySpecialization = function (specialization) {
  return this.find({
    specializations: specialization,
    "account.status": "active",
  });
};

// Static method to find available trainers in a location
trainerSchema.statics.findAvailableInLocation = function (city, state) {
  return this.find({
    "profile.location.city": new RegExp(city, "i"),
    "profile.location.state": new RegExp(state, "i"),
    "account.status": "active",
  });
};

module.exports = mongoose.model("Trainer", trainerSchema);
