const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true
  },
  sets: {
    type: String,
    required: true
  },
  reps: {
    type: String,
    required: true
  },
  weight: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
