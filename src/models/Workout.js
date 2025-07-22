const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Workout name is required'],
    trim: true,
    maxlength: [100, 'Workout name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'sports', 'rehabilitation', 'other'],
    default: 'other'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    planned: {
      type: Number, // in minutes
      min: 1,
      max: 480 // 8 hours max
    },
    actual: {
      type: Number // in minutes
    }
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true
    },
    sets: [{
      reps: {
        type: Number,
        min: 0
      },
      weight: {
        type: Number,
        min: 0
      },
      duration: {
        type: Number, // in seconds
        min: 0
      },
      distance: {
        type: Number, // in meters
        min: 0
      },
      restTime: {
        type: Number, // in seconds
        default: 60
      },
      completed: {
        type: Boolean,
        default: false
      },
      notes: String
    }],
    order: {
      type: Number,
      default: 0
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'skipped'],
    default: 'planned'
  },
  startedAt: Date,
  completedAt: Date,
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // For trainer-created workouts
  },
  isTrainerCreated: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
workoutSchema.index({ userId: 1, createdAt: -1 });
workoutSchema.index({ status: 1 });
workoutSchema.index({ isTemplate: 1, isPublic: 1 });
workoutSchema.index({ category: 1 });
workoutSchema.index({ difficulty: 1 });

// Virtual for total sets count
workoutSchema.virtual('totalSets').get(function() {
  return this.exercises.reduce((total, exercise) => total + exercise.sets.length, 0);
});

// Virtual for completed sets count
workoutSchema.virtual('completedSets').get(function() {
  return this.exercises.reduce((total, exercise) => {
    return total + exercise.sets.filter(set => set.completed).length;
  }, 0);
});

// Virtual for completion percentage
workoutSchema.virtual('completionPercentage').get(function() {
  const total = this.totalSets;
  const completed = this.completedSets;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Pre-save middleware
workoutSchema.pre('save', function(next) {
  // Auto-complete workout if all sets are completed
  if (this.status === 'in-progress') {
    const allCompleted = this.exercises.every(exercise => 
      exercise.sets.every(set => set.completed)
    );
    
    if (allCompleted && !this.completedAt) {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Instance methods
workoutSchema.methods.start = function() {
  this.status = 'in-progress';
  this.startedAt = new Date();
  return this.save();
};

workoutSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  
  // Calculate actual duration
  if (this.startedAt) {
    this.duration.actual = Math.round((this.completedAt - this.startedAt) / (1000 * 60));
  }
  
  return this.save();
};

workoutSchema.methods.skip = function() {
  this.status = 'skipped';
  return this.save();
};

// Static methods
workoutSchema.statics.getPublicTemplates = function() {
  return this.find({ isTemplate: true, isPublic: true, isDeleted: false })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });
};

workoutSchema.statics.getUserWorkouts = function(userId, options = {}) {
  const query = { userId, isDeleted: false };
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .populate('exercises.exerciseId', 'name category')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

module.exports = mongoose.model('Workout', workoutSchema);
