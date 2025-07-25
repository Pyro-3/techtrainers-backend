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
    findByIdAndUpdate: async () => null,
    save: async () => { },
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
  logBusinessEvent = advancedLogger.logBusinessEvent || (() => { });
  logError = advancedLogger.logError || (() => { });
  logAuthEvent = advancedLogger.logAuthEvent || (() => { });
  logSecurityEvent = advancedLogger.logSecurityEvent || (() => { });
  logEmailOperation = advancedLogger.logEmailOperation || (() => { });
  logSmsOperation = advancedLogger.logSmsOperation || (() => { });
  logger = advancedLogger.logger || console;
} catch (error) {
  logBusinessEvent = logError = logAuthEvent = logSecurityEvent = logEmailOperation = logSmsOperation = () => { };
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

      console.log('Creating user with password length:', password.length);

      // Create new user (password will be hashed by pre-save middleware)
      const user = new User({
        name,
        email: email.toLowerCase(),
        password, // Let the pre-save middleware handle hashing
        fitnessLevel: fitnessLevel || "beginner",
        role: userRole,
        isActive: true,
        isApproved: userRole === "member" ? true : false,
        emailVerified: false,
        phoneVerified: false,
      });

      await user.save();
      console.log('User created successfully');

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
      console.log('='.repeat(50));
      console.log('🔑 LOGIN ATTEMPT STARTED');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Time:', new Date().toISOString());
      console.log('Request IP:', req.ip);
      console.log('User Agent:', req.get('User-Agent'));
      console.log('='.repeat(50));

      const { email, password } = req.body;
      console.log('📧 Email from request:', email);
      console.log('🔒 Password length:', password?.length);
      console.log('🔒 Password provided:', !!password);

      // Validate required fields
      if (!email || !password) {
        console.log('❌ VALIDATION FAILED: Missing email or password');
        console.log('Email present:', !!email);
        console.log('Password present:', !!password);
        return res.status(400).json({
          status: "error",
          message: "Please provide email and password",
        });
      }

      const searchEmail = email.toLowerCase();
      console.log('🔍 Searching for email:', searchEmail);

      // Find user by email - explicitly include password field
      console.log('📡 Starting database query...');
      const user = await User.findOne({ email: searchEmail }).select("+password");
      console.log('📡 Database query completed');

      if (!user) {
        console.log('❌ USER NOT FOUND in database');
        console.log('Searched email:', searchEmail);

        // Let's also check if user exists without password selection
        const userCheck = await User.findOne({ email: searchEmail });
        console.log('User exists without password select:', !!userCheck);
        if (userCheck) {
          console.log('User ID:', userCheck._id);
          console.log('User name:', userCheck.name);
          console.log('User role:', userCheck.role);
        }

        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      console.log('✅ USER FOUND!');
      console.log('User ID:', user._id);
      console.log('User email:', user.email);
      console.log('User name:', user.name);
      console.log('User role:', user.role);
      console.log('Has password field:', !!user.password);
      console.log('Password length:', user.password?.length);
      console.log('Password format valid:', user.password?.startsWith('$2'));
      console.log('User active:', user.isActive);
      console.log('User approved:', user.isApproved);

      // Check if user has a password (important check)
      if (!user.password) {
        console.error("❌ CRITICAL: User found but no password field");
        console.error("This suggests password was not selected properly");
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      console.log('🔐 Starting bcrypt password comparison...');
      console.log('Input password length:', password.length);
      console.log('Stored password hash (first 20 chars):', user.password.substring(0, 20));

      // Verify password with additional validation and detailed logging
      let isPasswordValid = false;
      try {
        console.log('🔐 Calling bcrypt.compare...');
        const startTime = Date.now();
        isPasswordValid = await bcrypt.compare(password, user.password);
        const endTime = Date.now();
        console.log('🔐 bcrypt.compare completed in', endTime - startTime, 'ms');
        console.log('🔐 Password comparison result:', isPasswordValid);

        // Additional verification with manual test
        if (!isPasswordValid) {
          console.log('🔍 DEBUGGING: Manual password test...');
          try {
            const manualTest = await bcrypt.compare('test123', user.password);
            console.log('Manual test with "test123":', manualTest);
            const manualTest2 = await bcrypt.compare('test123456', user.password);
            console.log('Manual test with "test123456":', manualTest2);
          } catch (manualError) {
            console.log('Manual test error:', manualError.message);
          }
        }

      } catch (bcryptError) {
        console.error("❌ BCRYPT ERROR:", bcryptError);
        console.error("Error type:", bcryptError.name);
        console.error("Error message:", bcryptError.message);
        console.error("Error stack:", bcryptError.stack);
        return res.status(500).json({
          status: "error",
          message: "Authentication error. Please try again.",
          debug: process.env.NODE_ENV === 'development' ? bcryptError.message : "bcrypt error"
        });
      }

      if (!isPasswordValid) {
        console.log('❌ PASSWORD INVALID');
        console.log('This means the user exists but password doesn\'t match');
        console.log('Possible causes:');
        console.log('1. Wrong password provided');
        console.log('2. Password was double-hashed during registration');
        console.log('3. Different bcrypt version/settings');
        return res.status(401).json({
          status: "error",
          message: "Invalid email or password",
        });
      }

      // Check if user is active
      if (user.isActive === false) {
        console.log('❌ USER ACCOUNT DEACTIVATED');
        return res.status(401).json({
          status: "error",
          message: "Account has been deactivated",
        });
      }

      console.log('✅ ALL CHECKS PASSED - GENERATING TOKEN');

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "techtrainer_secret",
        { expiresIn: "7d" }
      );

      console.log('✅ TOKEN GENERATED SUCCESSFULLY');

      // Update last login
      try {
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ LAST LOGIN UPDATED');
      } catch (saveError) {
        console.warn("⚠️ Failed to update last login:", saveError.message);
      }

      console.log('🎉 LOGIN SUCCESSFUL FOR:', user.email);
      console.log('='.repeat(50));

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
      console.error('💥'.repeat(20));
      console.error("CRITICAL LOGIN ERROR:", error);
      console.error("Error type:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error('💥'.repeat(20));
      res.status(500).json({
        status: "error",
        message: "Login failed. Please try again.",
        debug: process.env.NODE_ENV === 'development' ? error.message : "server error"
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
        message: "Failed to update password",
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
        message: "Failed to reset password",
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
      res.status(500).json({
        status: "error",
        message: "Logout failed",
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
      res.status(500).json({
        status: "error",
        message: "Internal server error during phone verification",
      });
    }
  },

  getAuthStatus: async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("-password");

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
            id: user._id,
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
      res.status(500).json({
        status: "error",
        message: "Token validation failed",
      });
    }
  },
};

module.exports = authController;
module.exports = authController;
