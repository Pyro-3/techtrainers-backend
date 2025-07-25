const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Safely import User model
let User;
try {
  User = require("../models/User");
} catch (error) {
  console.error("Failed to import User model:", error.message);
  // Create a mock User model to prevent crashes
  User = {
    findOne: async () => null,
    findById: async () => null,
    findByIdAndUpdate: async () => null
  };
}

// Safely import optional services with fallbacks
let AuthEmailService, SmsService, logBusinessEvent, logError, logAuthEvent, logSecurityEvent, logEmailOperation, logSmsOperation, logger;

try {
  AuthEmailService = require("../services/AuthEmailService");
} catch (error) {
  AuthEmailService = class {
    async sendEmailVerification() { console.warn("Email service not available"); }
    async sendPasswordReset() { console.warn("Email service not available"); }
    async sendEmailVerificationConfirmation() { console.warn("Email service not available"); }
  };
}

try {
  SmsService = require("../services/SmsService");
} catch (error) {
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
  SmsService = {
    validatePhoneNumber: (phone) => phone,
    maskPhoneNumber: (phone) => phone.replace(/\d(?=\d{4})/g, "*"),
    isAvailable: () => false,
    getServiceStatus: () => ({ available: false }),
    sendPhoneVerification: async () => { throw new Error("SMS service unavailable"); },
    sendSecurityAlert: async () => { throw new Error("SMS service unavailable"); }
  };
}

try {
  const advancedLogger = require("../utils/AdvancedLogger");
  logBusinessEvent = advancedLogger.logBusinessEvent || (() => {});
  logError = advancedLogger.logError || (() => {});
  logAuthEvent = advancedLogger.logAuthEvent || (() => {});
  logSecurityEvent = advancedLogger.logSecurityEvent || (() => {});
  logEmailOperation = advancedLogger.logEmailOperation || (() => {});
  logSmsOperation = advancedLogger.logSmsOperation || (() => {});
  logger = advancedLogger.logger || console;
} catch (error) {
  logBusinessEvent = logError = logAuthEvent = logSecurityEvent = logEmailOperation = logSmsOperation = () => {};
  logger = console;
}

const authEmailService = new AuthEmailService();

// User authentication operations
const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, fitnessLevel, phone, role } = req.body;

      // Validate required fields
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

      // Set user role
      const userRole = role === "trainer" ? "trainer" : "member";

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        fitnessLevel: fitnessLevel || "beginner",
        role: userRole,
        isActive: true,
        isApproved: userRole === "member" ? true : false,
        emailVerified: false,
        phoneVerified: false,
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      // Return success response
      res.status(201).json({
        status: "success",
        data: {
          token,
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            fitnessLevel: user.fitnessLevel,
            isApproved: user.isApproved,
            isActive: user.isActive,
          }
        },
        message: userRole === "trainer" 
          ? "Trainer account created! Please wait for approval."
          : "Account created successfully!",
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        status: "error",
        message: "Registration failed. Please try again.",
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Please provide email and password",
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (user.isActive === false) {
        return res.status(401).json({
          status: "error",
          message: "Account has been deactivated",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      // Update last login
      try {
        user.lastLogin = new Date();
        await user.save();
      } catch (saveError) {
        console.warn("Failed to update last login:", saveError.message);
      }

      // Return success response
      res.json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved || false,
            isActive: user.isActive !== false,
            fitnessLevel: user.fitnessLevel || "beginner",
            profileCompleted: user.profileCompleted || false
          }
        }
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: "Login failed. Please try again.",
      });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          fitnessLevel: user.fitnessLevel,
          isApproved: user.isApproved,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      });
    } catch (error) {
      console.error("GetMe error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve user data",
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

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Please provide an email address",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return success to prevent email enumeration
      res.status(200).json({
        status: "success",
        message: "If your email is registered, you will receive password reset instructions",
      });
    } catch (error) {
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

      if (!token || !email || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Reset token, email, and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }

      // For now, just return an error as we haven't implemented reset tokens
      return res.status(400).json({
        status: "error",
        message: "Password reset feature is currently disabled",
      });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to reset password",
      });
    }
  },

  logout: async (req, res) => {
    try {
      if (req.user) {
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

  verifyEmail: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Email verification is currently disabled",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during email verification",
      });
    }
  },

  resendEmailVerification: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Email verification is currently disabled",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to resend verification email",
      });
    }
  },

  addPhoneNumber: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Phone verification is currently disabled",
      });
    } catch (error) {
      console.error("Add phone number error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while adding phone number",
      });
    }
  },

  verifyPhone: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Phone verification is currently disabled",
      });
    } catch (error) {
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

      const user = await User.findById(userId).select("-password");
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
            id: user._id, // Add for frontend compatibility
            name: user.name,
            email: user.email,
            role: user.role,
            fitnessLevel: user.fitnessLevel,
            emailVerified: user.emailVerified,
            phone: user.phone || null,
            phoneVerified: user.phoneVerified,
            isApproved: user.isApproved,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
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
es with fallbacks
module.exports = authController;let AuthEmailService, SmsService, logBusinessEvent, logError, logAuthEvent, logSecurityEvent, logEmailOperation, logSmsOperation, logger;


try {
  AuthEmailService = require("../services/AuthEmailService");
} catch (error) {
  AuthEmailService = class {
    async sendPasswordReset() { console.warn("Email service not available"); }
    async sendEmailVerificationConfirmation() { console.warn("Email service not available"); }
  };
}

try {
  SmsService = require("../services/SmsService");
} catch (error) {
  SmsService = {
    validatePhoneNumber: (phone) => phone,
    maskPhoneNumber: (phone) => phone.replace(/\d(?=\d{4})/g, "*"),
    isAvailable: () => false,
    getServiceStatus: () => ({ available: false }),
    sendPhoneVerification: async () => { throw new Error("SMS service unavailable"); },
    sendSecurityAlert: async () => { throw new Error("SMS service unavailable"); }
  };
}

try {
  logBusinessEvent = advancedLogger.logBusinessEvent || (() => {});
  logError = advancedLogger.logError || (() => {});
  logAuthEvent = advancedLogger.logAuthEvent || (() => {});
  logSecurityEvent = advancedLogger.logSecurityEvent || (() => {});
  logEmailOperation = advancedLogger.logEmailOperation || (() => {});
  logSmsOperation = advancedLogger.logSmsOperation || (() => {});
  logger = advancedLogger.logger || console;
} catch (error) {
  logBusinessEvent = logError = logAuthEvent = logSecurityEvent = logEmailOperation = logSmsOperation = () => {};
  logger = console;
}

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
        phone: phone || null,
        role: userRole,
        emailVerified: false,
        phoneVerified: false,
        isActive: true,
        // Trainers need approval, members don't
        isApproved: userRole === "member" ? true : false,
      });

      await user.save();

      // Generate JWT token for immediate login
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      // Send response with token for immediate login
      const userData = {
        _id: user._id,
        id: user._id, // Add for frontend compatibility
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        role: user.role,
        emailVerified: user.emailVerified,
        hasPhone: !!phone,
        isApproved: user.isApproved,
        isActive: user.isActive,
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
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          status: "error",
          message: "Account has been deactivated",
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Return success response
      res.json({
        status: "success",
        message: "Login successful",
        data: {
          token,
          user: {
            _id: user._id,
            id: user._id, // Add for frontend compatibility
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
            isActive: user.isActive,
            fitnessLevel: user.fitnessLevel,
            profileCompleted: user.profileCompleted || false
          }
        }
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during login",
      });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = req.user;

      const userData = {
        _id: user._id,
        id: user._id, // Add for frontend compatibility
        name: user.name,
        email: user.email,
        fitnessLevel: user.fitnessLevel,
        role: user.role,
        profile: user.profile,
        emailVerified: user.emailVerified,
        phone: user.phone || null,
        phoneVerified: user.phoneVerified,
        isApproved: user.isApproved,
        isActive: user.isActive,
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

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Please provide an email address",
        });
      }

      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return success to prevent email enumeration
      res.status(200).json({
        status: "success",
        message: "If your email is registered, you will receive password reset instructions",
      });
    } catch (error) {
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

      if (!token || !email || !newPassword) {
        return res.status(400).json({
          status: "error",
          message: "Reset token, email, and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters long",
        });
      }

      // For now, just return an error as we haven't implemented reset tokens
      return res.status(400).json({
        status: "error",
        message: "Password reset feature is currently disabled",
      });
    } catch (error) {
      console.error("Error in resetPassword:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to reset password",
      });
    }
  },

  logout: async (req, res) => {
    try {
      if (req.user) {
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

  verifyEmail: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Email verification is currently disabled",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error during email verification",
      });
    }
  },

  resendEmailVerification: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Email verification is currently disabled",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to resend verification email",
      });
    }
  },

  addPhoneNumber: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Phone verification is currently disabled",
      });
    } catch (error) {
      console.error("Add phone number error:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error while adding phone number",
      });
    }
  },

  verifyPhone: async (req, res) => {
    try {
      res.status(200).json({
        status: "success",
        message: "Phone verification is currently disabled",
      });
    } catch (error) {
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

      const user = await User.findById(userId).select("-password");
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
            id: user._id, // Add for frontend compatibility
            name: user.name,
            email: user.email,
            role: user.role,
            fitnessLevel: user.fitnessLevel,
            emailVerified: user.emailVerified,
            phone: user.phone || null,
            phoneVerified: user.phoneVerified,
            isApproved: user.isApproved,
            isActive: user.isActive,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
          },
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
    async sendEmailVerification() { console.warn("Email service not available"); }
