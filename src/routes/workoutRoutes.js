const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const { auth, optionalAuth } = require("../middleware/auth");
const { validateObjectId } = require("../middleware/ReqValidation");
const { apiLimiter } = require("../middleware/rateLimit");

// Temporary basic route to test server startup
router.get("/health", (req, res) => {
  res.json({ status: "Workout routes loaded" });
});

// Public routes (no auth required) - static routes first
router.get("/", optionalAuth, workoutController.getWorkouts);
router.get("/search", optionalAuth, workoutController.searchWorkouts);
router.get("/categories", optionalAuth, workoutController.getWorkoutCategories);
router.get("/templates/public", workoutController.getPublicTemplates);

// Public dynamic routes
router.get("/:id", optionalAuth, validateObjectId, workoutController.getWorkout);

// Protected routes
router.use(auth);

// Protected static routes (must come before protected dynamic /:id routes)
router.get("/user/workouts", workoutController.getUserWorkouts);
if (workoutController.getUserWorkoutLogs) {
  router.get("/user/logs", workoutController.getUserWorkoutLogs);
}
if (workoutController.getWorkoutStats) {
  router.get("/stats/summary", workoutController.getWorkoutStats);
}
if (workoutController.getProgressStats) {
  router.get("/stats/progress", workoutController.getProgressStats);
}

// Other protected routes
router.post("/", apiLimiter, workoutController.createWorkout);
router.put("/:id", validateObjectId, workoutController.updateWorkout);
router.delete("/:id", validateObjectId, workoutController.deleteWorkout);

// Conditional routes (only if methods exist)
if (workoutController.startWorkout) {
  router.post("/:id/start", validateObjectId, workoutController.startWorkout);
}
if (workoutController.completeWorkout) {
  router.post("/:id/complete", validateObjectId, workoutController.completeWorkout);
}
if (workoutController.pauseWorkout) {
  router.post("/:id/pause", validateObjectId, workoutController.pauseWorkout);
}
if (workoutController.favoriteWorkout) {
  router.post("/:id/favorite", validateObjectId, workoutController.favoriteWorkout);
}
if (workoutController.unfavoriteWorkout) {
  router.delete("/:id/favorite", validateObjectId, workoutController.unfavoriteWorkout);
}
if (workoutController.logWorkout) {
  router.post("/:id/log", validateObjectId, workoutController.logWorkout);
}
if (workoutController.getUserWorkoutLogs) {
  router.get("/user/logs", workoutController.getUserWorkoutLogs);
}
if (workoutController.shareWorkout) {
  router.post("/:id/share", validateObjectId, workoutController.shareWorkout);
}
if (workoutController.cloneWorkout) {
  router.post("/:id/clone", validateObjectId, workoutController.cloneWorkout);
}

module.exports = router;
