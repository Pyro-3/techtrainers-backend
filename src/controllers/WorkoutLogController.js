const WorkoutLog = require('../models/WorkoutLog');

exports.createWorkout = async (req, res) => {
  try {
    const workout = await WorkoutLog.create(req.body);
    res.status(201).json(workout);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserWorkouts = async (req, res) => {
  try {
    const workouts = await WorkoutLog.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
