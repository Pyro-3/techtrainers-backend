const User = require("../models/User");
const Booking = require("../models/Booking");
const Workout = require("../models/Workout");
const mongoose = require("mongoose");

/**
 * Trainer Controller
 * Handles all trainer-related operations
 */
const trainerController = {
  // Complete trainer profile
  completeProfile: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const {
        bio,
        specialties,
        certifications,
        experience,
        hourlyRate,
        availability,
        languages,
      } = req.body;

      const trainer = await User.findById(trainerId);

      if (!trainer || trainer.role !== "trainer") {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      // Update trainer profile
      trainer.trainerProfile = {
        bio,
        specialties,
        certifications,
        experience,
        hourlyRate,
        availability,
        languages,
        ...trainer.trainerProfile, // Preserve existing fields
      };

      trainer.profileCompleted = true;
      await trainer.save();

      res.json({
        status: "success",
        message: "Trainer profile completed successfully",
        data: {
          trainerId: trainer._id,
          name: trainer.name,
          email: trainer.email,
          profileCompleted: trainer.profileCompleted,
          trainerProfile: trainer.trainerProfile,
        },
      });
    } catch (error) {
      console.error("Error in completeProfile:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get trainer profile
  getProfile: async (req, res) => {
    try {
      const trainerId = req.user._id;

      const trainer = await User.findById(trainerId).select(
        "-password -emailVerificationToken -phoneVerificationToken -passwordResetToken"
      );

      if (!trainer || trainer.role !== "trainer") {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      // Get trainer stats
      const stats = await Promise.all([
        Booking.countDocuments({ trainerId, status: "completed" }),
        Booking.countDocuments({ trainerId, status: "approved" }),
        Booking.distinct("clientId", { trainerId, status: "approved" }),
      ]);

      const [completedSessions, activeSessions, uniqueClients] = stats;

      res.json({
        status: "success",
        data: {
          trainer,
          stats: {
            completedSessions,
            activeSessions,
            totalClients: uniqueClients.length,
          },
        },
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get booking requests
  getBookingRequests: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { page = 1, limit = 20, status = "pending" } = req.query;

      const skip = (page - 1) * limit;

      const bookings = await Booking.find({
        trainerId,
        status,
        isDeleted: false,
      })
        .populate("clientId", "name email phone profilePicture fitnessLevel")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Booking.countDocuments({
        trainerId,
        status,
        isDeleted: false,
      });

      res.json({
        status: "success",
        data: {
          bookings,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getBookingRequests:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Handle booking request (approve/reject)
  handleBookingRequest: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { requestId } = req.params;
      const { action, reason, trainerNotes } = req.body;

      if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid action. Must be approve or reject",
        });
      }

      const booking = await Booking.findOne({
        _id: requestId,
        trainerId,
        status: "pending",
      }).populate("clientId", "name email");

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking request not found",
        });
      }

      if (action === "approve") {
        await booking.approveBooking(trainerId, trainerNotes);
      } else {
        await booking.rejectBooking(trainerId, reason);
      }

      res.json({
        status: "success",
        message: `Booking request ${action}d successfully`,
        data: {
          bookingId: booking._id,
          clientName: booking.clientId.name,
          status: booking.status,
          sessionDate: booking.sessionDate,
        },
      });
    } catch (error) {
      console.error("Error in handleBookingRequest:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get trainer's clients
  getClients: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { page = 1, limit = 20 } = req.query;

      const skip = (page - 1) * limit;

      const clients = await Booking.getTrainerClients(trainerId);

      // Apply pagination
      const paginatedClients = clients.slice(skip, skip + parseInt(limit));

      res.json({
        status: "success",
        data: {
          clients: paginatedClients,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: clients.length,
            pages: Math.ceil(clients.length / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getClients:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get client's workouts
  getClientWorkouts: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { clientId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Verify trainer-client relationship
      const relationship = await Booking.findOne({
        clientId,
        trainerId,
        status: "approved",
        isDeleted: false,
      });

      if (!relationship) {
        return res.status(403).json({
          status: "error",
          message: "No approved trainer-client relationship found",
        });
      }

      const skip = (page - 1) * limit;

      const workouts = await Workout.find({ userId: clientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Workout.countDocuments({ userId: clientId });

      res.json({
        status: "success",
        data: {
          workouts,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error in getClientWorkouts:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Create workout for client
  createClientWorkout: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { clientId } = req.params;
      const workoutData = req.body;

      // Verify trainer-client relationship
      const relationship = await Booking.findOne({
        clientId,
        trainerId,
        status: "approved",
        isDeleted: false,
      });

      if (!relationship) {
        return res.status(403).json({
          status: "error",
          message: "No approved trainer-client relationship found",
        });
      }

      // Create workout for client
      const workout = new Workout({
        ...workoutData,
        userId: clientId,
        createdBy: trainerId,
        isTrainerCreated: true,
      });

      await workout.save();

      res.json({
        status: "success",
        message: "Workout created successfully for client",
        data: workout,
      });
    } catch (error) {
      console.error("Error in createClientWorkout:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get trainer dashboard data
  getDashboard: async (req, res) => {
    try {
      const trainerId = req.user._id;

      const stats = await Promise.all([
        Booking.countDocuments({ trainerId, status: "pending" }),
        Booking.countDocuments({ trainerId, status: "approved" }),
        Booking.countDocuments({ trainerId, status: "completed" }),
        Booking.distinct("clientId", { trainerId, status: "approved" }),
      ]);

      const [
        pendingBookings,
        approvedBookings,
        completedBookings,
        uniqueClients,
      ] = stats;

      // Get recent bookings
      const recentBookings = await Booking.find({
        trainerId,
        isDeleted: false,
      })
        .populate("clientId", "name email profilePicture")
        .sort({ createdAt: -1 })
        .limit(5);

      // Get upcoming sessions
      const upcomingSessions = await Booking.find({
        trainerId,
        status: "approved",
        sessionDate: { $gte: new Date() },
        isDeleted: false,
      })
        .populate("clientId", "name email profilePicture")
        .sort({ sessionDate: 1 })
        .limit(5);

      res.json({
        status: "success",
        data: {
          stats: {
            pendingBookings,
            approvedBookings,
            completedBookings,
            totalClients: uniqueClients.length,
          },
          recentBookings,
          upcomingSessions,
        },
      });
    } catch (error) {
      console.error("Error in getDashboard:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Update availability
  updateAvailability: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { availability } = req.body;

      const trainer = await User.findById(trainerId);

      if (!trainer || trainer.role !== "trainer") {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      trainer.trainerProfile.availability = availability;
      await trainer.save();

      res.json({
        status: "success",
        message: "Availability updated successfully",
        data: {
          availability: trainer.trainerProfile.availability,
        },
      });
    } catch (error) {
      console.error("Error in updateAvailability:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get trainer earnings/stats
  getEarnings: async (req, res) => {
    try {
      const trainerId = req.user._id;
      const { period = "month" } = req.query;

      let dateFilter = {};
      const now = new Date();

      switch (period) {
        case "week":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            },
          };
          break;
        case "month":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          };
          break;
        case "year":
          dateFilter = {
            createdAt: {
              $gte: new Date(now.getFullYear(), 0, 1),
            },
          };
          break;
      }

      const earnings = await Booking.aggregate([
        {
          $match: {
            trainerId: new mongoose.Types.ObjectId(trainerId),
            status: "completed",
            "payment.status": "paid",
            ...dateFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$payment.amount" },
            totalSessions: { $sum: 1 },
            averageSessionValue: { $avg: "$payment.amount" },
          },
        },
      ]);

      const result = earnings[0] || {
        totalEarnings: 0,
        totalSessions: 0,
        averageSessionValue: 0,
      };

      res.json({
        status: "success",
        data: {
          period,
          earnings: result,
        },
      });
    } catch (error) {
      console.error("Error in getEarnings:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = trainerController;
