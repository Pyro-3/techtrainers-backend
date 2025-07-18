const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * Enhanced Authentication Routes for TechTrainers
 * Includes email verification, phone verification, and enhanced security
 */

// Basic Authentication
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", auth, authController.logout);
router.get("/me", auth, authController.getMe);
router.get("/status", auth, authController.getAuthStatus);

// Email Verification
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendEmailVerification);

// Phone Verification
router.post("/add-phone", auth, authController.addPhoneNumber);
router.post("/verify-phone", auth, authController.verifyPhone);

// Password Management
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", auth, authController.updatePassword);

// Token Validation
router.get("/validate-token", auth, authController.validateToken);

module.exports = router;
