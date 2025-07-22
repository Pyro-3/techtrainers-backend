const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const { userAuth } = require('../middleware/userAuth');
const { validateObjectId } = require('../middleware/ReqValidation');
const { apiLimiter } = require('../middleware/rateLimit');

// All routes require authentication
router.use(userAuth);

// Workout CRUD operations
router.post('/', apiLimiter, workoutController.createWorkout);
router.get('/', workoutController.getUserWorkouts);
router.get('/:id', validateObjectId, workoutController.getWorkout);
router.put('/:id', validateObjectId, workoutController.updateWorkout);
router.delete('/:id', validateObjectId, workoutController.deleteWorkout);

// Workout execution
router.post('/:id/start', validateObjectId, workoutController.startWorkout);
router.post('/:id/complete', validateObjectId, workoutController.completeWorkout);
router.post('/:id/pause', validateObjectId, workoutController.pauseWorkout);

// Workout sharing and templates
router.post('/:id/share', validateObjectId, workoutController.shareWorkout);
router.get('/templates/public', workoutController.getPublicTemplates);
router.post('/:id/clone', validateObjectId, workoutController.cloneWorkout);

// Workout statistics
router.get('/stats/summary', workoutController.getWorkoutStats);
router.get('/stats/progress', workoutController.getProgressStats);

module.exports = router;
