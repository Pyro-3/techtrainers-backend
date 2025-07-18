const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  muscleGroup: {
    type: String,
    required: [true, 'Muscle group is required'],
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full_body']
  },
  equipment: {
    type: String,
    enum: ['bodyweight', 'dumbbells', 'barbell', 'machine', 'cable', 'resistance_band', 'other']
  },
  sets: [{
    reps: {
      type: Number,
      required: true,
      min: [1, 'Reps must be at least 1']
    },
    weight: {
      type: Number,
      min: [0, 'Weight cannot be negative']
    },
    duration: {
      type: Number, // in seconds
      min: [0, 'Duration cannot be negative']
    },
    restTime: {
      type: Number, // in seconds
      default: 60
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true,
    maxlength: [100, 'Workout name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed'],
    default: 'strength'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: [true, 'Difficulty level is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  exercises: [exerciseSchema],
  status: {
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'skipped'],
    default: 'planned'
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  actualDuration: {
    type: Number // in minutes
  },
  caloriesBurned: {
    type: Number,
    min: [0, 'Calories burned cannot be negative']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, status: 1 });
workoutSchema.index({ difficulty: 1, type: 1 });
workoutSchema.index({ isTemplate: 1 });

// Virtual for completion percentage
workoutSchema.virtual('completionPercentage').get(function() {
  if (this.exercises.length === 0) return 0;
  
  const totalSets = this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
  const completedSets = this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(set => set.completed).length;
  }, 0);
  
  return Math.round((completedSets / totalSets) * 100);
});

// Virtual for total volume (weight x reps)
workoutSchema.virtual('totalVolume').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((exerciseTotal, set) => {
      return exerciseTotal + ((set.weight || 0) * set.reps);
    }, 0);
  }, 0);
});

// Method to start workout
workoutSchema.methods.startWorkout = function() {
  this.status = 'in_progress';
  this.startTime = new Date();
  return this.save();
};

// Method to complete workout
workoutSchema.methods.completeWorkout = function() {
  this.status = 'completed';
  this.endTime = new Date();
  
  if (this.startTime) {
    this.actualDuration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  
  return this.save();
};

// Method to calculate estimated calories burned
workoutSchema.methods.calculateCalories = function(userWeight = 70) {
  // Basic calculation based on workout type and duration
  const caloriesPerMinute = {
    strength: 6,
    cardio: 10,
    flexibility: 3,
    mixed: 7
  };
  
  const baseCalories = (caloriesPerMinute[this.type] || 6) * this.duration;
  const weightFactor = userWeight / 70; // Adjust for user weight
  
  this.caloriesBurned = Math.round(baseCalories * weightFactor);
  return this.caloriesBurned;
};

module.exports = mongoose.model('Workout', workoutSchema);