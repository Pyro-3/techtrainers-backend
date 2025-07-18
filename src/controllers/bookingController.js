const Booking = require("../models/Booking");
const User = require("../models/User");
const mongoose = require("mongoose");

/**
 * Booking Controller
 * Handles all booking-related operations
 */
const bookingController = {
  // Create a new booking request
  createBooking: async (req, res) => {
    try {
      const clientId = req.user._id;
      const {
        trainerId,
        sessionDate,
        sessionTime,
        duration = 60,
        sessionType = "in-person",
        location,
        goals,
        clientNotes,
      } = req.body;

      // Verify trainer exists and is approved
      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== "trainer") {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      if (!trainer.isApproved) {
        return res.status(400).json({
          status: "error",
          message: "Trainer is not approved yet",
        });
      }

      // Check if booking already exists for the same date/time
      const existingBooking = await Booking.findOne({
        trainerId,
        sessionDate: new Date(sessionDate),
        "sessionTime.start": sessionTime.start,
        status: { $in: ["pending", "approved"] },
      });

      if (existingBooking) {
        return res.status(400).json({
          status: "error",
          message: "Trainer is not available at this time",
        });
      }

      // Calculate payment amount based on trainer's hourly rate
      const hourlyRate = trainer.trainerProfile?.hourlyRate || 50;
      const amount = (duration / 60) * hourlyRate;

      // Create booking
      const booking = new Booking({
        clientId,
        trainerId,
        sessionDate: new Date(sessionDate),
        sessionTime,
        duration,
        sessionType,
        location,
        goals,
        clientNotes,
        payment: {
          amount,
          currency: "CAD",
          status: "pending",
        },
      });

      await booking.save();

      // Populate trainer and client info
      await booking.populate([
        { path: "trainerId", select: "name email trainerProfile" },
        { path: "clientId", select: "name email phone" },
      ]);

      res.json({
        status: "success",
        message: "Booking request created successfully",
        data: booking,
      });
    } catch (error) {
      console.error("Error in createBooking:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get client's bookings
  getClientBookings: async (req, res) => {
    try {
      const clientId = req.user._id;
      const { page = 1, limit = 20, status, upcoming = false } = req.query;

      const skip = (page - 1) * limit;

      // Build filter
      const filter = { clientId, isDeleted: false };

      if (status) {
        filter.status = status;
      }

      if (upcoming === "true") {
        filter.sessionDate = { $gte: new Date() };
        filter.status = { $in: ["pending", "approved"] };
      }

      const bookings = await Booking.find(filter)
        .populate("trainerId", "name email phone profilePicture trainerProfile")
        .sort({ sessionDate: upcoming === "true" ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Booking.countDocuments(filter);

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
      console.error("Error in getClientBookings:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get booking by ID
  getBookingById: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await Booking.findById(bookingId)
        .populate("clientId", "name email phone profilePicture")
        .populate(
          "trainerId",
          "name email phone profilePicture trainerProfile"
        );

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking not found",
        });
      }

      // Check if user has access to this booking
      const hasAccess =
        booking.clientId._id.toString() === userId.toString() ||
        booking.trainerId._id.toString() === userId.toString() ||
        req.user.role === "admin";

      if (!hasAccess) {
        return res.status(403).json({
          status: "error",
          message: "Access denied",
        });
      }

      res.json({
        status: "success",
        data: booking,
      });
    } catch (error) {
      console.error("Error in getBookingById:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Cancel booking
  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;
      const { reason } = req.body;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking not found",
        });
      }

      // Check if user can cancel this booking
      const canCancel =
        booking.clientId.toString() === userId.toString() ||
        booking.trainerId.toString() === userId.toString() ||
        req.user.role === "admin";

      if (!canCancel) {
        return res.status(403).json({
          status: "error",
          message: "You cannot cancel this booking",
        });
      }

      // Can only cancel pending or approved bookings
      if (!["pending", "approved"].includes(booking.status)) {
        return res.status(400).json({
          status: "error",
          message: "Cannot cancel this booking",
        });
      }

      await booking.cancelBooking(userId, reason);

      res.json({
        status: "success",
        message: "Booking cancelled successfully",
        data: {
          bookingId: booking._id,
          status: booking.status,
          cancellation: booking.cancellation,
        },
      });
    } catch (error) {
      console.error("Error in cancelBooking:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Complete booking (for trainers)
  completeBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const trainerId = req.user._id;
      const { sessionNotes, clientAttended = true } = req.body;

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking not found",
        });
      }

      // Only trainer can complete the booking
      if (booking.trainerId.toString() !== trainerId.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Only the trainer can complete this booking",
        });
      }

      // Can only complete approved bookings
      if (booking.status !== "approved") {
        return res.status(400).json({
          status: "error",
          message: "Can only complete approved bookings",
        });
      }

      await booking.completeBooking(sessionNotes, clientAttended);

      // Update payment status to paid (in real app, this would be handled by payment processor)
      booking.payment.status = "paid";
      booking.payment.paidAt = new Date();
      await booking.save();

      res.json({
        status: "success",
        message: "Booking completed successfully",
        data: {
          bookingId: booking._id,
          status: booking.status,
          completion: booking.completion,
        },
      });
    } catch (error) {
      console.error("Error in completeBooking:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Rate booking (for clients)
  rateBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const clientId = req.user._id;
      const { rating, review } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          status: "error",
          message: "Rating must be between 1 and 5",
        });
      }

      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          status: "error",
          message: "Booking not found",
        });
      }

      // Only client can rate the booking
      if (booking.clientId.toString() !== clientId.toString()) {
        return res.status(403).json({
          status: "error",
          message: "Only the client can rate this booking",
        });
      }

      // Can only rate completed bookings
      if (booking.status !== "completed") {
        return res.status(400).json({
          status: "error",
          message: "Can only rate completed bookings",
        });
      }

      // Update booking rating
      booking.completion.clientRating = rating;
      if (review) {
        booking.completion.sessionNotes = review;
      }
      await booking.save();

      // Update trainer's overall rating
      const trainer = await User.findById(booking.trainerId);
      if (trainer) {
        const allRatings = await Booking.find({
          trainerId: booking.trainerId,
          status: "completed",
          "completion.clientRating": { $exists: true },
        }).select("completion.clientRating");

        const totalRatings = allRatings.length;
        const averageRating =
          allRatings.reduce((sum, b) => sum + b.completion.clientRating, 0) /
          totalRatings;

        trainer.trainerProfile.rating = {
          average: Math.round(averageRating * 10) / 10,
          count: totalRatings,
        };
        await trainer.save();
      }

      res.json({
        status: "success",
        message: "Booking rated successfully",
        data: {
          bookingId: booking._id,
          rating: booking.completion.clientRating,
        },
      });
    } catch (error) {
      console.error("Error in rateBooking:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get available time slots for a trainer
  getAvailableSlots: async (req, res) => {
    try {
      const { trainerId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          status: "error",
          message: "Date is required",
        });
      }

      const trainer = await User.findById(trainerId);
      if (!trainer || trainer.role !== "trainer") {
        return res.status(404).json({
          status: "error",
          message: "Trainer not found",
        });
      }

      const searchDate = new Date(date);
      const dayOfWeek = searchDate.toLocaleDateString("en-US", {
        weekday: "lowercase",
      });

      // Get trainer's availability for the day
      const availability = trainer.trainerProfile?.availability || {};
      const availableDays = availability.days || [];
      const timeSlots = availability.timeSlots || [];

      if (!availableDays.includes(dayOfWeek)) {
        return res.json({
          status: "success",
          data: {
            availableSlots: [],
            message: "Trainer not available on this day",
          },
        });
      }

      // Get existing bookings for the date
      const existingBookings = await Booking.find({
        trainerId,
        sessionDate: {
          $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
          $lt: new Date(searchDate.setHours(23, 59, 59, 999)),
        },
        status: { $in: ["pending", "approved"] },
      }).select("sessionTime");

      // Generate available slots
      const availableSlots = [];
      timeSlots.forEach((slot) => {
        const startTime = slot.start;
        const endTime = slot.end;

        // Generate hourly slots between start and end time
        const start = parseInt(startTime.split(":")[0]);
        const end = parseInt(endTime.split(":")[0]);

        for (let hour = start; hour < end; hour++) {
          const timeSlot = `${hour.toString().padStart(2, "0")}:00`;

          // Check if slot is already booked
          const isBooked = existingBookings.some(
            (booking) => booking.sessionTime.start === timeSlot
          );

          if (!isBooked) {
            availableSlots.push({
              start: timeSlot,
              end: `${(hour + 1).toString().padStart(2, "0")}:00`,
            });
          }
        }
      });

      res.json({
        status: "success",
        data: {
          date,
          availableSlots,
          trainer: {
            name: trainer.name,
            availability: trainer.trainerProfile?.availability,
          },
        },
      });
    } catch (error) {
      console.error("Error in getAvailableSlots:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },

  // Get booking statistics
  getBookingStats: async (req, res) => {
    try {
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

      const stats = await Booking.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$payment.amount" },
          },
        },
      ]);

      const totalBookings = await Booking.countDocuments(dateFilter);
      const totalRevenue = await Booking.aggregate([
        {
          $match: {
            ...dateFilter,
            "payment.status": "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$payment.amount" },
          },
        },
      ]);

      res.json({
        status: "success",
        data: {
          period,
          totalBookings,
          totalRevenue: totalRevenue[0]?.total || 0,
          statusBreakdown: stats,
          generatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Error in getBookingStats:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = bookingController;
