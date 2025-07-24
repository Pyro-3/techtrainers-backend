<<<<<<< HEAD
const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const { userAuth, optionalAuth } = require("../middleware/userAuth");
const { validateObjectId } = require("../middleware/ReqValidation");
const { apiLimiter } = require("../middleware/rateLimit");

// Public routes (with optional auth for personalization)
router.get("/", optionalAuth, workoutController.getWorkouts);
router.get("/search", optionalAuth, workoutController.searchWorkouts);
router.get("/categories", optionalAuth, workoutController.getWorkoutCategories);
router.get(
  "/:id",
  optionalAuth,
  validateObjectId,
  workoutController.getWorkout
);

// Protected routes
router.use(userAuth);
router.post("/", apiLimiter, workoutController.createWorkout);
router.put("/:id", validateObjectId, workoutController.updateWorkout);
router.delete("/:id", validateObjectId, workoutController.deleteWorkout);

// User workout interactions
router.post(
  "/:id/favorite",
  validateObjectId,
  workoutController.favoriteWorkout
);
router.delete(
  "/:id/favorite",
  validateObjectId,
  workoutController.unfavoriteWorkout
);
router.post("/:id/log", validateObjectId, workoutController.logWorkout);
router.get("/user/logs", workoutController.getUserWorkoutLogs);
=======
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
>>>>>>> 7d6c2bb1a198b12d40463fa90c03a8d40e4ea691

module.exports = router;
