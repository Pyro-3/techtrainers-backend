const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  profile: {
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120']
    },
    height: {
      type: Number,
      min: [100, 'Height must be at least 100cm']
    },
    weight: {
      type: Number,
      min: [30, 'Weight must be at least 30kg']
    },
    goals: [{
      type: String,
      enum: ['strength', 'hypertrophy', 'fat_loss', 'endurance', 'flexibility']
    }],
    experience: {
      type: String,
      enum: ['none', 'less_than_1_year', '1_to_3_years', '3_to_5_years', 'more_than_5_years'],
      default: 'none'
    }
  },
  preferences: {
    workoutDuration: {
      type: Number,
      default: 60,
      min: [15, 'Workout duration must be at least 15 minutes']
    },
    workoutFrequency: {
      type: Number,
      default: 3,
      min: [1, 'Workout frequency must be at least 1 day per week'],
      max: [7, 'Workout frequency cannot exceed 7 days per week']
    },
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      default: 'evening'
    }
  },
  stats: {
    totalWorkouts: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalExercises: {
      type: Number,
      default: 0
    },
    personalRecords: [{
      exercise: String,
      weight: Number,
      reps: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'intermediate', 'advanced'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ fitnessLevel: 1 });
userSchema.index({ 'subscription.plan': 1 });

// Virtual for BMI calculation
userSchema.virtual('profile.bmi').get(function() {
  if (this.profile.weight && this.profile.height) {
    const heightInMeters = this.profile.height / 100;
    return Math.round((this.profile.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  return null;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or is new)
  if (!this.isModified('password')) return next();
  
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
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to update workout stats
userSchema.methods.updateWorkoutStats = function() {
  this.stats.totalWorkouts += 1;
  this.stats.currentStreak += 1;
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  return this.save();
};

// Method to add personal record
userSchema.methods.addPersonalRecord = function(exercise, weight, reps) {
  const existingRecord = this.stats.personalRecords.find(pr => pr.exercise === exercise);
  
  if (existingRecord) {
    if (weight > existingRecord.weight || (weight === existingRecord.weight && reps > existingRecord.reps)) {
      existingRecord.weight = weight;
      existingRecord.reps = reps;
      existingRecord.date = new Date();
    }
  } else {
    this.stats.personalRecords.push({
      exercise,
      weight,
      reps,
      date: new Date()
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);