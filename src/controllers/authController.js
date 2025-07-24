const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AuthEmailService = require("../services/AuthEmailService");
const SmsService = require("../services/SmsService");
const {
  logBusinessEvent,
  logError,
  logAuthEvent,
  logSecurityEvent,
  logEmailOperation,
  logSmsOperation,
  logger,
} = require("../utils/AdvancedLogger");

const authEmailService = new AuthEmailService();

// User authentication operations
const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, fitnessLevel, phone, role } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Please provide name, email, and password",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: "error",
          message: "Please provide a valid email address",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        await logSecurityEvent(
          "DUPLICATE_REGISTRATION_ATTEMPT",
          {
            email: email.toLowerCase(),
            existingUserId: existingUser._id,
          },
          req
        );

        return res.status(400).json({
          status: "error",
          message: "Email already in use",
        });
      }

      // Validate password strength
      if (password.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }

      // Validate fitness level
      const validFitnessLevels = ["beginner", "intermediate", "advanced"];
      if (fitnessLevel && !validFitnessLevels.includes(fitnessLevel)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid fitness level. Must be beginner, intermediate, or advanced",
        });
      }

      // Validate phone number if provided
      let formattedPhone = null;
      if (phone) {
        try {
          formattedPhone = SmsService.validatePhoneNumber(phone);

          // Check if phone already exists
          const existingPhone = await User.findOne({ phone: formattedPhone });
          if (existingPhone) {
            await logSecurityEvent(
              "DUPLICATE_PHONE_REGISTRATION_ATTEMPT",
              {
                phone: formattedPhone,
                existingUserId: existingPhone._id,
              },
              req
            );

            return res.status(400).json({
              status: "error",
              message: "Phone number already registered",
            });
          }
        } catch (phoneError) {
          return res.status(400).json({
            status: "error",
            message: "Invalid phone number format",
          });
        }
      }

      // Validate role if provided
      const validRoles = ["member", "trainer"];
      let userRole = "member"; // default role
      
      if (role && validRoles.includes(role)) {
        userRole = role;
      } else if (role && !validRoles.includes(role)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid role. Must be 'member' or 'trainer'",
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        fitnessLevel: fitnessLevel || "beginner",
        phone: formattedPhone,
        role: userRole,
        emailVerified: false,
        phoneVerified: false,
        // Trainers need approval, members don't
        isApproved: userRole === "member" ? true : false,
      });

      // Generate email verification token
      const emailToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      try {
        await authEmailService.sendEmailVerification(user, emailToken);
        await logEmailOperation(
          "EMAIL_VERIFICATION_SENT",
          {
            userId: user._id,
            email: user.email,
            tokenGenerated: true,
          },
          req
        );
      } catch (emailError) {
        await logEmailOperation(
          "EMAIL_VERIFICATION_FAILED",
          {
            userId: user._id,
            email: user.email,
            error: emailError.message,
          },
          req
        );
        console.error("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
      }

      await logBusinessEvent(
        "USER_REGISTERED",
        {
          userId: user._id,
          email: user.email,
          name: user.name,
          hasPhone: !!formattedPhone,
          fitnessLevel: user.fitnessLevel,
        },
        req
      );

      await logAuthEvent(
        "REGISTRATION",
        {
          userId: user._id,
          email: user.email,
          name: user.name,
          hasPhone: !!formattedPhone,
          emailVerificationRequired: true,
        },
        req
      );

      // Generate JWT token for immediate login (skip email verification for better UX)
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      // Send response with token for immediate login
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPhone: !!formattedPhone,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        status: "success",
        data: {
          user: userData,
          token,
        },
        message:
          userRole === "trainer" 
            ? "Trainer account created successfully! Please complete your profile and wait for approval."
            : "Account created successfully! Welcome to TechTrainer!",
      });
    } catch (error) {
      await logError("USER_REGISTRATION_FAILED", error, {
        email: req.body?.email,
      });
      console.error("Error in register:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Registration failed",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Please provide email and password",
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      // Check if user exists
      if (!user) {
        await logAuthEvent(
          "LOGIN_FAILED",
          {
            email: email.toLowerCase(),
            reason: "USER_NOT_FOUND",
          },
          req
        );

        await logSecurityEvent(
          "LOGIN_ATTEMPT_UNKNOWN_USER",
          {
            email: email.toLowerCase(),
          },
          req
        );

        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        const lockTimeRemaining = Math.ceil(
          (user.lockUntil - Date.now()) / (60 * 1000)
        );

        await logSecurityEvent(
          "LOGIN_ATTEMPT_LOCKED_ACCOUNT",
          {
            userId: user._id,
            email: user.email,
            lockTimeRemaining,
          },
          req
        );

        return res.status(423).json({
          status: "error",
          message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
          lockTimeRemaining,
        });
      }

      // Check if account is active
      if (user.isActive === false) {
        await logSecurityEvent(
          "LOGIN_ATTEMPT_DEACTIVATED_ACCOUNT",
          {
            userId: user._id,
            email: user.email,
          },
          req
        );

        return res.status(401).json({
          status: "error",
          message: "Your account has been deactivated",
        });
      }

      // Check if password is correct
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();

        await logAuthEvent(
          "FAILED_LOGIN_ATTEMPT",
          {
            userId: user._id,
            email: user.email,
            loginAttempts: user.loginAttempts + 1,
            reason: "INVALID_PASSWORD",
          },
          req
        );

        await logSecurityEvent(
          "FAILED_LOGIN_ATTEMPT",
          {
            userId: user._id,
            email: user.email,
            attemptCount: user.loginAttempts + 1,
            maxAttempts: user.maxLoginAttempts || 5,
          },
          req
        );

        return res.status(401).json({
          status: "error",
          message: "Invalid credentials",
        });
      }

      // Check email verification
      if (!user.emailVerified) {
        await logAuthEvent(
          "LOGIN_FAILED",
          {
            userId: user._id,
            email: user.email,
            reason: "EMAIL_NOT_VERIFIED",
          },
          req
        );

        return res.status(403).json({
          status: "error",
          message: "Please verify your email address before logging in",
          emailVerificationRequired: true,
          email: user.email,
        });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
        await logAuthEvent(
          "LOGIN_ATTEMPTS_RESET",
          {
            userId: user._id,
            email: user.email,
            previousAttempts: user.loginAttempts,
          },
          req
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      // Update last login timestamp
      user.lastLogin = Date.now();
      await user.save();

      await logAuthEvent(
        "LOGIN_SUCCESS",
        {
          userId: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          tokenGenerated: true,
        },
        req
      );

      await logBusinessEvent(
        "USER_LOGIN_SUCCESS",
        {
          userId: user._id,
          email: user.email,
          name: user.name,
        },
        req
      );

      // Send response with user data (excluding password)
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        role: user.role,
        profile: user.profile,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        hasPhone: !!user.phone,
        twoFactorEnabled: user.twoFactorAuth?.enabled || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };

      res.status(200).json({
        status: "success",
        data: {
          user: userData,
          token,
        },
        message: "Login successful",
      });
    } catch (error) {
      await logError(
        "LOGIN_ERROR",
        error,
        {
          email: req.body?.email,
          userId: req.user?._id,
        },
        req
      );

      console.error("Error in login:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Login failed",
      });
    }
  },

  getMe: async (req, res) => {
    try {
      // req.user is set by the auth middleware
      const user = req.user;

      // Return user data (excluding password)
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        role: user.role,
        profile: user.profile,
        emailVerified: user.emailVerified,
        phone: user.phone ? SmsService.maskPhoneNumber(user.phone) : null,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorAuth?.enabled || false,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };

      res.status(200).json({
        status: "success",
        data: userData,
        message: "User data retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getMe:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve user data",
      });
    }
  },

  updatePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Please provide current password and new password",
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }

      // Get user from database to verify password
      const user = await User.findById(req.user._id);

      // Check if current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error("Error in updatePassword:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update password",
      });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Please provide an email address",
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      // If no user found, still return success to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          status: "success",
          message:
            "If your email is registered, you will receive password reset instructions",
        });
      }

      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();

      // Send reset email using AuthEmailService
      try {
        await authEmailService.sendPasswordReset(user, resetToken);
      } catch (emailError) {
        console.error("Failed to send password reset email:", emailError);
        return res.status(500).json({
          status: "error",
          message: "Failed to send password reset email",
        });
      }

      await logBusinessEvent("PASSWORD_RESET_REQUESTED", {
        userId: user._id,
        email: user.email,
      });

      res.status(200).json({
        status: "success",
        message:
          "If your email is registered, you will receive password reset instructions",
      });
    } catch (error) {
      await logError("PASSWORD_RESET_REQUEST_ERROR", error, {
        email: req.body?.email,
      });
      console.error("Error in forgotPassword:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to process password reset request",
      });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, email, newPassword } = req.body;

      // Validate input
      if (!token || !email || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Reset token, email, and new password are required",
        });
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired reset token",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token fields
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.resetLoginAttempts(); // Clear any login attempts

      await user.save();

      // Send security notification to phone if available
      if (user.phone && user.phoneVerified && SmsService.isAvailable()) {
        try {
          await SmsService.sendSecurityAlert(
            user.phone,
            "PASSWORD_CHANGED",
            user.name
          );
        } catch (smsError) {
          console.error("Failed to send security SMS:", smsError);
        }
      }

      await logBusinessEvent("PASSWORD_RESET_COMPLETED", {
        userId: user._id,
        email: user.email,
      });

      // Generate new JWT token
      const jwtToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      res.status(200).json({
        status: "success",
        data: { token: jwtToken },
        message: "Password reset successful",
      });
    } catch (error) {
      await logError("PASSWORD_RESET_ERROR", error, { email: req.body?.email });
      console.error("Error in resetPassword:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to reset password",
      });
    }
  },

  // Additional useful auth methods

  logout: async (req, res) => {
    try {
      // For JWT, we can't invalidate the token on the server
      // Client is responsible for removing the token

      // However, we can log the logout event
      if (req.user) {
        // Update last activity timestamp
        await User.findByIdAndUpdate(req.user._id, {
          lastActivity: Date.now(),
        });
      }

      res.status(200).json({
        status: "success",
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Logout failed",
      });
    }
  },

  // Email Verification Methods
  verifyEmail: async (req, res) => {
    try {
      const { token, email } = req.body;

      if (!token || !email) {
        return res.status(400).json({
          status: "error",
          message: "Verification token and email are required",
        });
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification token",
        });
      }

      // Verify email
      await user.verifyEmail();

      // Send welcome email
      try {
        await authEmailService.sendEmailVerificationConfirmation(user);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }

      await logBusinessEvent("EMAIL_VERIFIED", {
        userId: user._id,
        email: user.email,
        name: user.name,
      });

      res.json({
        status: "success",
        message:
          "Email verified successfully! You can now log in to your account.",
        data: {
          emailVerified: true,
          canLogin: true,
        },
      });
    } catch (error) {
      await logError("EMAIL_VERIFICATION_ERROR", error, {
        email: req.body?.email,
      });
      console.error("Email verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during email verification",
      });
    }
  },

  resendEmailVerification: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      if (user.emailVerified) {
        return res.status(400).json({
          status: "error",
          message: "Email is already verified",
        });
      }

      // Generate new verification token
      const emailToken = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await authEmailService.sendEmailVerification(user, emailToken);

      await logBusinessEvent("EMAIL_VERIFICATION_RESENT", {
        userId: user._id,
        email: user.email,
      });

      res.json({
        status: "success",
        message: "Verification email sent successfully",
      });
    } catch (error) {
      await logError("EMAIL_VERIFICATION_RESEND_ERROR", error, {
        email: req.body?.email,
      });
      console.error("Resend verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to resend verification email",
      });
    }
  },

  // Phone Verification Methods
  addPhoneNumber: async (req, res) => {
    try {
      const { phone } = req.body;
      const userId = req.user._id;

      if (!phone) {
        return res.status(400).json({
          status: "error",
          message: "Phone number is required",
        });
      }

      // Validate and format phone number
      let formattedPhone;
      try {
        formattedPhone = SmsService.validatePhoneNumber(phone);
      } catch (phoneError) {
        return res.status(400).json({
          status: "error",
          message: "Invalid phone number format",
        });
      }

      // Check if phone already exists for another user
      const existingPhone = await User.findOne({
        phone: formattedPhone,
        _id: { $ne: userId },
      });

      if (existingPhone) {
        return res.status(400).json({
          status: "error",
          message: "This phone number is already registered to another account",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Update phone number
      user.phone = formattedPhone;
      user.phoneVerified = false;

      // Generate verification code
      const verificationCode = user.generatePhoneVerificationToken();
      await user.save();

      // Send SMS verification
      if (SmsService.isAvailable()) {
        try {
          await SmsService.sendPhoneVerification(
            formattedPhone,
            verificationCode,
            user.name
          );

          res.json({
            status: "success",
            message:
              "Phone number added successfully. Please verify with the code sent to your phone.",
            data: {
              phone: SmsService.maskPhoneNumber(formattedPhone),
              verificationRequired: true,
            },
          });
        } catch (smsError) {
          console.error("SMS sending failed:", smsError);
          res.json({
            status: "success",
            message:
              "Phone number added successfully. SMS service is currently unavailable.",
            data: {
              phone: SmsService.maskPhoneNumber(formattedPhone),
              verificationRequired: true,
              verificationCode:
                process.env.NODE_ENV === "development"
                  ? verificationCode
                  : undefined,
            },
          });
        }
      } else {
        res.json({
          status: "success",
          message:
            "Phone number added successfully. SMS verification is currently unavailable.",
          data: {
            phone: SmsService.maskPhoneNumber(formattedPhone),
            verificationRequired: true,
            verificationCode:
              process.env.NODE_ENV === "development"
                ? verificationCode
                : undefined,
          },
        });
      }

      await logBusinessEvent("PHONE_NUMBER_ADDED", {
        userId: user._id,
        phone: SmsService.maskPhoneNumber(formattedPhone),
      });
    } catch (error) {
      await logError("PHONE_NUMBER_ADD_ERROR", error, {
        userId: req.user?._id,
      });
      console.error("Add phone number error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while adding phone number",
      });
    }
  },

  verifyPhone: async (req, res) => {
    try {
      const { verificationCode } = req.body;
      const userId = req.user._id;

      if (!verificationCode) {
        return res.status(400).json({
          status: "error",
          message: "Verification code is required",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      if (!user.phone) {
        return res.status(400).json({
          status: "error",
          message: "No phone number found for verification",
        });
      }

      // Verify phone
      const isValid = await user.verifyPhone(verificationCode);
      if (!isValid) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification code",
        });
      }

      await logBusinessEvent("PHONE_VERIFIED", {
        userId: user._id,
        phone: SmsService.maskPhoneNumber(user.phone),
      });

      res.json({
        status: "success",
        message: "Phone number verified successfully!",
        data: {
          phoneVerified: true,
          phone: SmsService.maskPhoneNumber(user.phone),
        },
      });
    } catch (error) {
      await logError("PHONE_VERIFICATION_ERROR", error, {
        userId: req.user?._id,
      });
      console.error("Phone verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during phone verification",
      });
    }
  },

  // Get Authentication Status
  getAuthStatus: async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select(
        "-password -emailVerificationToken -phoneVerificationToken -passwordResetToken"
      );
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            fitnessLevel: user.fitnessLevel,
            emailVerified: user.emailVerified,
            phone: user.phone ? SmsService.maskPhoneNumber(user.phone) : null,
            phoneVerified: user.phoneVerified,
            twoFactorEnabled: user.twoFactorAuth?.enabled || false,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
          smsService: SmsService.getServiceStatus(),
        },
      });
    } catch (error) {
      console.error("Auth status error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  validateToken: async (req, res) => {
    try {
      // req.user is set by the auth middleware
      // If this middleware executes successfully, token is valid

      res.status(200).json({
        status: "success",
        data: {
          userId: req.user._id,
          role: req.user.role,
        },
        message: "Token is valid",
      });
    } catch (error) {
      console.error("Error in validateToken:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Token validation failed",
      });
    }
  },
};

module.exports = authController;
