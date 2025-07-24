const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { userAuth } = require("../middleware/userAuth");
const { validateUser } = require("../middleware/ReqValidation");
const { uploadProfilePicture } = require("../middleware/fileUpload");
const { apiLimiter } = require("../middleware/rateLimit");

// All routes require authentication
router.use(userAuth);

// Profile routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validateUser.updateProfile,
  userController.updateProfile
);
router.delete("/profile", userController.deleteAccount);

// Profile picture
router.post(
  "/profile/picture",
  uploadProfilePicture,
  userController.uploadProfilePicture
);
router.delete("/profile/picture", userController.deleteProfilePicture);

// Preferences
router.put("/preferences", userController.updatePreferences);
router.get("/preferences", userController.getPreferences);

// Notifications settings
router.put("/notifications", userController.updateNotificationSettings);
router.get("/notifications", userController.getNotificationSettings);

// Goals management
router.get("/goals", userController.getGoals);
router.put("/goals", userController.updateGoals);

// Email analytics (for user's own email stats)
router.get("/email-stats", userController.getEmailStats);

module.exports = router;
