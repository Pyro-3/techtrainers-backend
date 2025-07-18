const User = require("../models/User");
const Booking = require("../models/Booking");
const SupportTicket = require("../models/SupportTicket");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

/**
 * Admin Controller
 * Handles all admin-related operations
 */
const adminController = {
  // Get all users with filtering
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        isApproved,
        isActive,
        search,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filter object
      const filter = { isStaticAdmin: { $ne: true } }; // Exclude static admin

      if (role && role !== "all") {
        filter.role = role;
      }

      if (isApproved !== undefined) {
        filter.isApproved = isApproved === "true";
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === "true";
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Pagination
      const skip = (page - 1) * limit;

      // Get users
      const users = await User.find(filter)
        .select(
          "-password -emailVerificationToken -phoneVerificationToken -passwordResetToken"
        )
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      const total = await User.countDocuments(filter);

      return res.status(200).json({
        status: "success",
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            limit: parseInt(limit),
          },
        },
        message: "Users retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve users",
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format",
        });
      }

      // Find user by ID
      const user = await User.findById(id).select("-password");

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Get additional user stats
      const workoutCount = await mongoose
        .model("Workout")
        .countDocuments({ userId: id });
      const ticketCount = await SupportTicket.countDocuments({ userId: id });

      return res.status(200).json({
        status: "success",
        data: {
          user,
          stats: {
            workoutCount,
            ticketCount,
          },
        },
        message: "User details retrieved successfully",
      });
    } catch (error) {
      console.error("Error in getUserById:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to retrieve user details",
      });
    }
  },

  // Approve trainer
  approveTrainer: async (req, res) => {
    try {
      const { trainerId } = req.params;
      const { approved = true, adminNotes } = req.body;

      const trainer = await User.findById(trainerId);

      if (!trainer) {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      if (trainer.role !== "trainer") {
        return res.status(400).json({
          status: "error",
          message: "User is not a trainer",
        });
      }

      if (trainer.isStaticAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Cannot modify static admin account",
        });
      }

      trainer.isApproved = approved;
      if (adminNotes) {
        trainer.adminNotes = adminNotes;
      }

      await trainer.save();

      res.json({
        status: "success",
        message: `Trainer ${
          approved ? "approved" : "disapproved"
        } successfully`,
        data: {
          trainerId: trainer._id,
          name: trainer.name,
          email: trainer.email,
          isApproved: trainer.isApproved,
        },
      });
    } catch (error) {
      console.error("Error in approveTrainer:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Prevent deletion of static admin
      if (user.isStaticAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Static admin account cannot be deleted",
        });
      }

      // Soft delete - deactivate account
      user.isActive = false;
      user.lastLogin = new Date();
      await user.save();

      res.json({
        status: "success",
        message: "User account deactivated successfully",
      });
    } catch (error) {
      console.error("Error in deleteUser:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["user", "trainer", "admin"].includes(role)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid role",
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      if (user.isStaticAdmin) {
        return res.status(403).json({
          status: "error",
          message: "Static admin account cannot be modified",
        });
      }

      const oldRole = user.role;
      user.role = role;

      // Reset trainer-specific fields if changing from trainer
      if (oldRole === "trainer" && role !== "trainer") {
        user.isApproved = false;
        user.profileCompleted = false;
      }

      // Set default values for new trainers
      if (role === "trainer" && oldRole !== "trainer") {
        user.isApproved = false;
        user.profileCompleted = false;
      }

      await user.save();

      res.json({
        status: "success",
        message: "User role updated successfully",
        data: {
          userId: user._id,
          name: user.name,
          email: user.email,
          oldRole,
          newRole: role,
        },
      });
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get pending trainer approvals
  getPendingTrainers: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const pendingTrainers = await User.find({
        role: "trainer",
        isApproved: false,
        isActive: true,
      })
        .select(
          "-password -emailVerificationToken -phoneVerificationToken -passwordResetToken"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments({
        role: "trainer",
        isApproved: false,
        isActive: true,
      });

      res.json({
        status: "success",
        data: {
          trainers: pendingTrainers,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getPendingTrainers:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get admin dashboard stats
  getDashboardStats: async (req, res) => {
    try {
      const stats = await Promise.all([
        User.countDocuments({ role: "user", isActive: true }),
        User.countDocuments({ role: "trainer", isActive: true }),
        User.countDocuments({
          role: "trainer",
          isApproved: true,
          isActive: true,
        }),
        User.countDocuments({
          role: "trainer",
          isApproved: false,
          isActive: true,
        }),
        Booking.countDocuments({ status: "pending" }),
        Booking.countDocuments({ status: "approved" }),
        Booking.countDocuments({ status: "completed" }),
      ]);

      const [
        totalUsers,
        totalTrainers,
        approvedTrainers,
        pendingTrainers,
        pendingBookings,
        approvedBookings,
        completedBookings,
      ] = stats;

      // Get recent activity
      const recentUsers = await User.find({ isActive: true })
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5);

      const recentBookings = await Booking.find({})
        .populate("clientId", "name email")
        .populate("trainerId", "name email")
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        status: "success",
        data: {
          stats: {
            users: {
              total: totalUsers,
              trainers: totalTrainers,
              approvedTrainers,
              pendingTrainers,
            },
            bookings: {
              pending: pendingBookings,
              approved: approvedBookings,
              completed: completedBookings,
              total: pendingBookings + approvedBookings + completedBookings,
            },
          },
          recentActivity: {
            users: recentUsers,
            bookings: recentBookings,
          },
        },
      });
    } catch (error) {
      console.error("Error in getDashboardStats:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Create static admin account
  createStaticAdmin: async (req, res) => {
    try {
      // Check if static admin already exists
      const existingAdmin = await User.findOne({ isStaticAdmin: true });

      if (existingAdmin) {
        return res.status(400).json({
          status: "error",
          message: "Static admin account already exists",
        });
      }

      // Create static admin
      const adminData = {
        name: "System Administrator",
        email: "admin@techtrainers.ca",
        password: "Adm1n$$33!",
        role: "admin",
        isStaticAdmin: true,
        isActive: true,
        emailVerified: true,
        isApproved: true,
        profileCompleted: true,
      };

      const admin = new User(adminData);
      await admin.save();

      res.json({
        status: "success",
        message: "Static admin account created successfully",
        data: {
          adminId: admin._id,
          email: admin.email,
        },
      });
    } catch (error) {
      console.error("Error in createStaticAdmin:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Bulk actions
  bulkActions: async (req, res) => {
    try {
      const { action, userIds, data } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "User IDs array is required",
        });
      }

      // Prevent bulk actions on static admin
      const staticAdmin = await User.findOne({ isStaticAdmin: true });
      if (staticAdmin && userIds.includes(staticAdmin._id.toString())) {
        return res.status(403).json({
          status: "error",
          message: "Cannot perform bulk actions on static admin account",
        });
      }

      let result;
      switch (action) {
        case "approve":
          result = await User.updateMany(
            { _id: { $in: userIds }, role: "trainer" },
            { isApproved: true }
          );
          break;
        case "disapprove":
          result = await User.updateMany(
            { _id: { $in: userIds }, role: "trainer" },
            { isApproved: false }
          );
          break;
        case "deactivate":
          result = await User.updateMany(
            { _id: { $in: userIds } },
            { isActive: false }
          );
          break;
        case "activate":
          result = await User.updateMany(
            { _id: { $in: userIds } },
            { isActive: true }
          );
          break;
        default:
          return res.status(400).json({
            status: "error",
            message: "Invalid action",
          });
      }

      res.json({
        status: "success",
        message: `Bulk ${action} completed successfully`,
        data: {
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount,
        },
      });
    } catch (error) {
      console.error("Error in bulkActions:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Additional useful admin methods

  deactivateUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format",
        });
      }

      // Prevent self-deactivation
      if (req.user.id === id) {
        return res.status(403).json({
          status: "error",
          message: "You cannot deactivate your own account",
        });
      }

      // Find and update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isActive: false },
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
        data: updatedUser,
        message: "User deactivated successfully",
      });
    } catch (error) {
      console.error("Error in deactivateUser:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to deactivate user",
      });
    }
  },

  activateUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid user ID format",
        });
      }

      // Find and update user
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { isActive: true },
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
        data: updatedUser,
        message: "User activated successfully",
      });
    } catch (error) {
      console.error("Error in activateUser:", error);
      return res.status(500).json({
        status: "error",
        message: error.message || "Failed to activate user",
      });
    }
  },
};

module.exports = adminController;
