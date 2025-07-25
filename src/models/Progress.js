const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  },
  workoutDuration: {
    type: Number, // minutes
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    maxlength: 500
  },
  workoutRating: {
    type: Number,
    min: 1,
    max: 5
  },
  workoutType: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'sports', 'other'],
    default: 'other'
  },
  workoutDifficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true // Creates createdAt and updatedAt automatically
});

// Only define indexes once - remove any timestamp, createdAt, updatedAt indexes
progressSchema.index({ userId: 1, date: -1 });
progressSchema.index({ workoutId: 1 });

module.exports = mongoose.model('Progress', progressSchema);
