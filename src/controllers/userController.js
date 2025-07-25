const User = require("../models/User");
const Workout = require("../models/Workout");
const Progress = require("../models/ProgressModel");
const SupportTicket = require("../models/SupportTicket");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// User profile and data operations
const userController = {
  getUserProfile: async (req, res) => {
    try {
      const userId = req.user._id;

      // Fetch user with all profile data but exclude password
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Get additional user statistics
      const stats = {
        workouts: await Workout.countDocuments({ userId }),
        completedWorkouts: await Workout.countDocuments({
          userId,
          status: "completed",
        }),
      };

      // Get latest progress entry
      const latestProgress = await Progress.findOne({ userId })
        .sort({ date: -1 })
        .limit(1);

      return res.status(200).json({
        status: "success",
        data: {
          user,
          stats,
          latestProgress: latestProgress || null,
        },
        message: "User profile retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve user profile",
      });
    }
  },

  updateUserProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      const { name, email, fitnessLevel, profile } = req.body;

      // Check if email is being changed and if it's already taken
      if (email && email !== req.user.email) {
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (emailExists) {
          return res.status(400).json({
            status: "error",
            message: "Email already in use",
          });
        }
      }

      // Build update object with only defined fields
      const updateData = {};

      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (fitnessLevel) updateData.fitnessLevel = fitnessLevel;

      // Handle nested profile updates
      if (profile) {
        // First get current user to merge profile data properly
        const currentUser = await User.findById(userId);

        // Initialize profile if it doesn't exist
        if (!currentUser.profile) {
          currentUser.profile = {};
        }

        // Update profile fields
        updateData.profile = {
          ...currentUser.profile,
          ...profile,
        };

        // Handle nested measurements object
        if (profile.measurements) {
          updateData.profile.measurements = {
            ...(currentUser.profile.measurements || {}),
            ...profile.measurements,
          };
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      res.json({
        status: "success",
        data: {
          user: {
            _id: updatedUser._id,
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            fitnessLevel: updatedUser.fitnessLevel,
            profile: updatedUser.profile,
            preferences: updatedUser.preferences,
            stats: updatedUser.stats,
            subscription: updatedUser.subscription,
            isApproved: updatedUser.isApproved,
            isActive: updatedUser.isActive,
            emailVerified: updatedUser.emailVerified,
            phoneVerified: updatedUser.phoneVerified,
            profileCompleted: updatedUser.profileCompleted,
            createdAt: updatedUser.createdAt,
            lastLogin: updatedUser.lastLogin,
          },
        },
        message: "User profile updated successfully",
      });
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update user profile",
      });
    }
  },

  getWorkoutStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const { timeframe = "30days" } = req.query;

      // Determine date range based on timeframe
      const endDate = new Date();
      let startDate;

      switch (timeframe) {
        case "7days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        case "90days":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 90);
          break;
        case "6months":
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1year":
          startDate = new Date();
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "alltime":
          startDate = new Date(0); // Start of time
          break;
        default:
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Default to 30 days
      }

      // Get total workout count
      const totalWorkouts = await Workout.countDocuments({
        userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Get completed workout count
      const completedWorkouts = await Workout.countDocuments({
        userId,
        status: "completed",
        completedAt: {
          $gte: startDate,
          $lte: endDate,
        },
      });

      // Get total workout duration
      const durationResult = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: "completed",
            completedAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalDuration: { $sum: "$duration" },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]);

      // Get workout stats by day
      const workoutsByDay = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: "completed",
            completedAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$completedAt" },
              month: { $month: "$completedAt" },
              day: { $dayOfMonth: "$completedAt" },
            },
            count: { $sum: 1 },
            duration: { $sum: "$duration" },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
            "_id.day": 1,
          },
        },
      ]);

      // Format workout by day data
      const formattedWorkoutsByDay = workoutsByDay.map((day) => ({
        date: `${day._id.year}-${String(day._id.month).padStart(
          2,
          "0"
        )}-${String(day._id.day).padStart(2, "0")}`,
        count: day.count,
        duration: day.duration,
      }));

      // Get workout stats by type/category
      const workoutsByType = await Workout.aggregate([
        {
          $match: {
            userId: mongoose.Types.ObjectId(userId),
            status: "completed",
            completedAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            duration: { $sum: "$duration" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      // Get streak data
      const workoutDates = await Workout.find({
        userId,
        status: "completed",
      })
        .select("completedAt")
        .sort("completedAt");

      // Calculate current and longest streaks
      const streaks = calculateWorkoutStreaks(workoutDates);

      return res.status(200).json({
        status: "success",
        data: {
          timeframe,
          totalWorkouts,
          completedWorkouts,
          completionRate:
            totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0,
          totalDuration:
            durationResult.length > 0 ? durationResult[0].totalDuration : 0,
          avgDuration:
            durationResult.length > 0 ? durationResult[0].avgDuration : 0,
          workoutsByDay: formattedWorkoutsByDay,
          workoutsByType,
          streaks,
        },
        message: "Workout statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getWorkoutStats:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve workout statistics",
      });
    }
  },

  updateFitnessLevel: async (req, res) => {
    try {
      const userId = req.user._id;
      const { fitnessLevel } = req.body;

      // Validate fitness level
      const validLevels = ["beginner", "intermediate", "advanced"];
      if (!fitnessLevel || !validLevels.includes(fitnessLevel)) {
        return res.status(400).json({
          status: "error",
          message:
            "Invalid fitness level. Must be beginner, intermediate, or advanced",
        });
      }

      // Update user fitness level
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fitnessLevel },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Create a progress note about the level change
      const progressNote = new Progress({
        userId,
        date: new Date(),
        notes: `Fitness level updated to ${fitnessLevel}`,
        fitnessLevel,
      });

      await progressNote.save();

      return res.status(200).json({
        status: "success",
        data: {
          user: updatedUser,
          fitnessLevel,
        },
        message: `Fitness level updated to ${fitnessLevel}`,
      });
    } catch (error) {
      console.error("Error in updateFitnessLevel:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update fitness level",
      });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const userId = req.user._id;
      const { password } = req.body;

      // Check if password is provided
      if (!password) {
        return res.status(400).json({
          status: "error",
          message: "Password is required to delete account",
        });
      }

      // Get user with password
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          status: "error",
          message: "Invalid password",
        });
      }

      // Begin a session for transaction
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Anonymize user data instead of deleting
        await User.findByIdAndUpdate(
          userId,
          {
            name: "Deleted User",
            email: `deleted_${Date.now()}_${userId}@example.com`,
            isActive: false,
            deletedAt: new Date(),
            profile: {
              // Clear sensitive profile data
              age: null,
              gender: null,
              height: null,
              weight: null,
              measurements: {},
            },
          },
          { session }
        );

        // Mark related data as deleted rather than actually deleting it
        // This preserves data integrity while respecting user privacy

        // Update workouts
        await Workout.updateMany({ userId }, { isDeleted: true }, { session });

        // Update progress entries
        await Progress.updateMany({ userId }, { isDeleted: true }, { session });

        // Update support tickets
        await SupportTicket.updateMany(
          { userId },
          {
            isUserDeleted: true,
            // Add a system message about account deletion
            $push: {
              messages: {
                sender: "system",
                message: "User has deleted their account",
                timestamp: new Date(),
              },
            },
          },
          { session }
        );

        // Commit the transaction
        await session.commitTransaction();

        return res.status(200).json({
          status: "success",
          message: "Account deleted successfully",
        });
      } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        throw error;
      } finally {
        // End session
        session.endSession();
      }
    } catch (error) {
      console.error("Error in deleteAccount:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete account",
      });
    }
  },

  // Additional useful methods

  getProfileOverview: async (req, res) => {
    try {
      const userId = req.user._id;

      // Get user data (excluding password)
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Get activity summary
      const totalWorkouts = await Workout.countDocuments({ userId });
      const completedWorkouts = await Workout.countDocuments({
        userId,
        status: "completed",
      });

      // Get most recent completed workout
      const lastWorkout = await Workout.findOne({
        userId,
        status: "completed",
      }).sort({ completedAt: -1 });

      // Get recent progress
      const recentProgress = await Progress.find({ userId })
        .sort({ date: -1 })
        .limit(5);

      // Calculate user's streak
      const workoutDates = await Workout.find({
        userId,
        status: "completed",
      })
        .select("completedAt")
        .sort("completedAt");

      const streaks = calculateWorkoutStreaks(workoutDates);

      // Get upcoming planned workouts
      const upcomingWorkouts = await Workout.find({
        userId,
        status: "scheduled",
        scheduledFor: { $gte: new Date() },
      })
        .sort({ scheduledFor: 1 })
        .limit(3);

      return res.status(200).json({
        status: "success",
        data: {
          user,
          activitySummary: {
            totalWorkouts,
            completedWorkouts,
            progressEntries: await Progress.countDocuments({ userId }),
            lastWorkout: lastWorkout || null,
            streak: streaks.current,
          },
          recentProgress,
          upcomingWorkouts,
        },
        message: "Profile overview retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getProfileOverview:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve profile overview",
      });
    }
  },

  updateNotificationSettings: async (req, res) => {
    try {
      const userId = req.user._id;
      const { notificationSettings } = req.body;

      if (!notificationSettings) {
        return res.status(400).json({
          status: "error",
          message: "Notification settings are required",
        });
      }

      // Update only notification settings
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { "preferences.notifications": notificationSettings },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          notificationSettings: updatedUser.preferences?.notifications || {},
        },
        message: "Notification settings updated successfully",
      });
    } catch (error) {
      console.error("Error in updateNotificationSettings:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update notification settings",
      });
    }
  },

  uploadProfilePicture: async (req, res) => {
    try {
      const userId = req.user._id;

      // In a real implementation, req.file would contain the uploaded file
      // processed by middleware like multer

      if (!req.file) {
        return res.status(400).json({
          status: "error",
          message: "No file uploaded",
        });
      }

      // For this example, we'll assume the file is uploaded to some storage
      // and we get back a URL
      const fileUrl =
        req.file.path ||
        `https://example.com/profiles/${userId}/${req.file.filename}`;

      // Update user profile with new picture URL
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { "profile.profilePicture": fileUrl },
        { new: true }
      ).select("-password");

      return res.status(200).json({
        status: "success",
        data: {
          profilePicture: fileUrl,
        },
        message: "Profile picture uploaded successfully",
      });
    } catch (error) {
      console.error("Error in uploadProfilePicture:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to upload profile picture",
      });
    }
  },

  // Delete profile picture
  deleteProfilePicture: async (req, res) => {
    try {
      const userId = req.user._id;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $unset: { "profile.profilePicture": 1 } },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Profile picture deleted successfully",
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Error deleting profile picture:", error);
      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get user goals
  getGoals: async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select("profile.goals");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          goals: user.profile?.goals || [],
        },
        message: "User goals retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getGoals:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve user goals",
      });
    }
  },

  // Update user goals
  updateGoals: async (req, res) => {
    try {
      const userId = req.user._id;
      const { goals } = req.body;

      // Validate goals array
      if (!Array.isArray(goals)) {
        return res.status(400).json({
          status: "error",
          message: "Goals must be an array",
        });
      }

      // Validate each goal against enum values
      const validGoals = [
        "weight_loss",
        "muscle_gain",
        "strength_building",
        "endurance_improvement",
        "flexibility_mobility",
        "athletic_performance",
        "general_fitness",
        "body_toning",
        "stress_relief",
        "rehabilitation",
        "competition_prep",
        "lifestyle_change",
      ];

      const invalidGoals = goals.filter((goal) => !validGoals.includes(goal));
      if (invalidGoals.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid goals: ${invalidGoals.join(", ")}`,
        });
      }

      // Update user goals
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { "profile.goals": goals },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          goals: updatedUser.profile?.goals || [],
        },
        message: "User goals updated successfully",
      });
    } catch (error) {
      console.error("Error in updateGoals:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update user goals",
      });
    }
  },

  // Get user profile (alias for getUserProfile)
  getProfile: async (req, res) => {
    return userController.getUserProfile(req, res);
  },

  // Update user profile (alias for updateUserProfile)
  updateProfile: async (req, res) => {
    return userController.updateUserProfile(req, res);
  },

  // Update user preferences
  updatePreferences: async (req, res) => {
    try {
      const userId = req.user._id;
      const { preferences } = req.body;

      if (!preferences) {
        return res.status(400).json({
          status: "error",
          message: "Preferences are required",
        });
      }

      // Update user preferences
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

      return res.status(200).json({
        status: "success",
        data: {
          preferences: updatedUser.preferences || {},
        },
        message: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Error in updatePreferences:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to update preferences",
      });
    }
  },

  // Get user preferences
  getPreferences: async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select("preferences");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          preferences: user.preferences || {},
        },
        message: "Preferences retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getPreferences:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve preferences",
      });
    }
  },

  // Get notification settings
  getNotificationSettings: async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).select(
        "preferences.notifications"
      );

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      return res.status(200).json({
        status: "success",
        data: {
          notificationSettings: user.preferences?.notifications || {},
        },
        message: "Notification settings retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getNotificationSettings:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve notification settings",
      });
    }
  },

  // Get user's email statistics
  getEmailStats: async (req, res) => {
    try {
      const userId = req.user._id;
      const { days = 30 } = req.query;

      // Get user to get their email
      const user = await User.findById(userId).select("email");
      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Import EmailAnalytics model
      const EmailAnalytics = require("../models/EmailAnalytics");

      // Get user's email statistics
      const emailStats = await EmailAnalytics.getUserEmailStats(user.email, parseInt(days));

      // Get recent email activity
      const recentEmails = await EmailAnalytics.find({
        recipientEmail: user.email
      })
      .sort({ sentAt: -1 })
      .limit(10)
      .select('emailType subject status sentAt deliveredAt openedAt clickedAt errorMessage');

      return res.status(200).json({
        status: "success",
        data: {
          stats: emailStats,
          recentActivity: recentEmails,
          period: `${days} days`
        },
        message: "Email statistics retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getEmailStats:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve email statistics",
      });
    }
  },
};

// Helper function to calculate workout streaks
function calculateWorkoutStreaks(workoutDates) {
  if (workoutDates.length === 0) return { current: 0, longest: 0 };

  // Create array of dates in YYYY-MM-DD format
  const dates = workoutDates
    .map((workout) => new Date(workout.completedAt).toISOString().split("T")[0])
    .sort();

  // Remove duplicates (multiple workouts on same day)
  const uniqueDates = [...new Set(dates)];

  let currentStreak = 1;
  let longestStreak = 1;

  // Calculate streaks by comparing adjacent dates
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    // Check if dates are consecutive
    const diffTime = Math.abs(currDate - prevDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day, streak continues
      currentStreak++;

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      // Break in streak
      currentStreak = 1;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

module.exports = userController;
