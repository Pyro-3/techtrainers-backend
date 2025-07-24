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

module.exports = router;
