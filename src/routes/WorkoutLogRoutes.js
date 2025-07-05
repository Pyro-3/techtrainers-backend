const express = require('express');
const router = express.Router();
const workoutLogController = require('../controllers/WorkoutLogController');

router.post('/', workoutLogController.createWorkout);
router.get('/user/:userId', workoutLogController.getUserWorkouts);

module.exports = router;

