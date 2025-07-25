const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  exercises: [{
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise'
    },
    name: String,
    sets: { type: Number, default: 1 },
    reps: { type: Number, default: 10 },
    duration: { type: Number, default: 0 },
    restTime: { type: Number, default: 60 },
    notes: String
  }],
  type: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'general'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'paused', 'completed', 'scheduled'],
    default: 'not-started'
  },
  scheduledFor: Date,
  completedAt: Date,
  notes: String,
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Creates createdAt and updatedAt automatically
});

// Only define indexes once - no timestamp/createdAt/updatedAt indexes
workoutSchema.index({ userId: 1, createdAt: -1 });
workoutSchema.index({ status: 1 });
workoutSchema.index({ type: 1, difficulty: 1 });

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
