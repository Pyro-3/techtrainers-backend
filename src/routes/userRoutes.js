const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { auth } = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with user ID and timestamp
    // Note: req.user should be available here since auth middleware runs first
    const userId = (req.user && req.user._id) ? req.user._id : 'unknown';
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `profile-${userId}-${timestamp}${extension}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// All routes require authentication
router.use(auth);

// Profile routes
router.get("/profile", async (req, res) => {
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
          profile: user.profile,
          preferences: user.preferences,
          stats: user.stats,
          subscription: user.subscription,
          isApproved: user.isApproved,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          profileCompleted: user.profileCompleted,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        }
      }
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user profile",
    });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.role;
    delete updateData.isActive;
    delete updateData.isApproved;
    delete updateData.emailVerified;
    delete updateData.phoneVerified;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        user: updatedUser
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update profile",
    });
  }
});

// @route   POST /api/users/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post("/profile/picture", auth, upload.single("profilePicture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const userId = req.user._id;
    const filename = req.file.filename;
    const filePath = `/uploads/profiles/${filename}`;

    // Update user with new profile picture path
    const user = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: filePath,
        "profile.profilePictureUrl": filePath
      },
      { new: true }
    ).select("-password");

    if (!user) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.log(`Profile picture uploaded for user ${userId}: ${filename}`);

    res.json({
      status: "success",
      data: {
        profilePicture: filePath,
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
        }
      },
      message: "Profile picture uploaded successfully",
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Failed to upload profile picture",
    });
  }
});

// @route   DELETE /api/users/profile/picture
// @desc    Delete profile picture
// @access  Private
router.delete("/profile/picture", async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Delete old profile picture file if it exists
    if (user.profilePicture) {
      const oldFilePath = path.join(__dirname, "../../", user.profilePicture);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Remove profile picture from user record
    await User.findByIdAndUpdate(userId, {
      $unset: {
        profilePicture: 1,
        "profile.profilePictureUrl": 1
      }
    });

    res.json({
      status: "success",
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("Delete profile picture error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete profile picture",
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("stats");

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        stats: user.stats || {
          totalWorkouts: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalExercises: 0,
          personalRecords: []
        }
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve user statistics",
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put("/preferences", async (req, res) => {
  try {
    const userId = req.user._id;
    const { preferences } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        preferences: updatedUser.preferences
      },
      message: "Preferences updated successfully",
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update preferences",
    });
  }
});

module.exports = router;
