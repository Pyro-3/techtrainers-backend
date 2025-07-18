const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  weight: {
    type: Number,
    min: 0
  },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number
  },
  bodyFat: {
    type: Number,
    min: 0,
    max: 100
  },
  notes: String,
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  workoutId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workout'
  },
  workoutDuration: Number,
  caloriesBurned: Number,
  workoutRating: {
    type: Number,
    min: 1,
    max: 5
  },
  workoutType: String,
  workoutDifficulty: String,
  photoUrl: String,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
progressSchema.index({ userId: 1, date: -1 });

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;