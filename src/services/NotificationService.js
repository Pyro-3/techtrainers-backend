const { logger } = require("../utils/AdvancedLogger");

/**
 * Real-time Notification Service
 * Handles push notifications, email notifications, and in-app notifications
 */
class NotificationService {
  constructor() {
    this.subscribers = new Map(); // In-memory storage for demo
    this.notificationQueue = [];
  }

  /**
   * Subscribe user to real-time notifications
   */
  subscribe(userId, socketId) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId).add(socketId);

    logger.logBusinessEvent("info", "User subscribed to notifications", {
      userId,
      socketId: socketId.substring(0, 10) + "...",
    });
  }

  /**
   * Unsubscribe user from notifications
   */
  unsubscribe(userId, socketId) {
    if (this.subscribers.has(userId)) {
      this.subscribers.get(userId).delete(socketId);
      if (this.subscribers.get(userId).size === 0) {
        this.subscribers.delete(userId);
      }
    }

    logger.logBusinessEvent("info", "User unsubscribed from notifications", {
      userId,
      socketId: socketId.substring(0, 10) + "...",
    });
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(userId, notification) {
    try {
      // Store notification in database
      await this.storeNotification(userId, notification);

      // Send real-time notification if user is online
      if (this.subscribers.has(userId)) {
        const userSockets = this.subscribers.get(userId);
        const io = global.io; // Assuming io is available globally

        if (io) {
          userSockets.forEach((socketId) => {
            io.to(socketId).emit("notification", notification);
          });
        }
      }

      // Send email notification if enabled
      if (notification.sendEmail) {
        await this.sendEmailNotification(userId, notification);
      }

      logger.logBusinessEvent("info", "Notification sent", {
        userId,
        type: notification.type,
        title: notification.title,
      });
    } catch (error) {
      logger.logError("Failed to send notification", {
        error: error.message,
        userId,
        notificationType: notification.type,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Send workout reminder notification
   */
  async sendWorkoutReminder(userId, workoutData) {
    const notification = {
      type: "workout_reminder",
      title: "Workout Reminder",
      message: `Don't forget about your ${workoutData.name} workout today!`,
      data: {
        workoutId: workoutData.id,
        workoutName: workoutData.name,
        scheduledTime: workoutData.scheduledTime,
      },
      timestamp: new Date(),
      sendEmail: true,
      priority: "medium",
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send appointment confirmation notification
   */
  async sendAppointmentConfirmation(userId, appointmentData) {
    const notification = {
      type: "appointment_confirmed",
      title: "Appointment Confirmed",
      message: `Your ${appointmentData.sessionType} with ${appointmentData.trainerName} has been confirmed!`,
      data: {
        appointmentId: appointmentData.id,
        trainerName: appointmentData.trainerName,
        sessionType: appointmentData.sessionType,
        date: appointmentData.date,
        time: appointmentData.time,
      },
      timestamp: new Date(),
      sendEmail: true,
      priority: "high",
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send subscription update notification
   */
  async sendSubscriptionUpdate(userId, subscriptionData) {
    const notification = {
      type: "subscription_update",
      title: "Subscription Updated",
      message: `Your subscription has been updated to ${subscriptionData.plan}`,
      data: {
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        endDate: subscriptionData.endDate,
      },
      timestamp: new Date(),
      sendEmail: true,
      priority: "medium",
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(userId, achievementData) {
    const notification = {
      type: "achievement_unlocked",
      title: "Achievement Unlocked!",
      message: `Congratulations! You've unlocked: ${achievementData.name}`,
      data: {
        achievementId: achievementData.id,
        name: achievementData.name,
        description: achievementData.description,
        icon: achievementData.icon,
      },
      timestamp: new Date(),
      sendEmail: false,
      priority: "low",
    };

    await this.sendNotification(userId, notification);
  }

  /**
   * Send system maintenance notification
   */
  async sendSystemNotification(message, priority = "medium") {
    const notification = {
      type: "system_announcement",
      title: "System Notification",
      message,
      data: {
        isSystemWide: true,
      },
      timestamp: new Date(),
      sendEmail: false,
      priority,
    };

    // Send to all connected users
    const allUsers = Array.from(this.subscribers.keys());
    await Promise.all(
      allUsers.map((userId) => this.sendNotification(userId, notification))
    );
  }

  /**
   * Store notification in database
   */
  async storeNotification(userId, notification) {
    try {
      const mongoose = require("mongoose");

      // Create notification schema if it doesn't exist
      let NotificationModel;
      try {
        NotificationModel = mongoose.model("Notification");
      } catch (error) {
        const notificationSchema = new mongoose.Schema(
          {
            userId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },
            type: {
              type: String,
              required: true,
            },
            title: {
              type: String,
              required: true,
            },
            message: {
              type: String,
              required: true,
            },
            data: {
              type: mongoose.Schema.Types.Mixed,
              default: {},
            },
            isRead: {
              type: Boolean,
              default: false,
            },
            priority: {
              type: String,
              enum: ["low", "medium", "high"],
              default: "medium",
            },
            timestamp: {
              type: Date,
              default: Date.now,
            },
          },
          {
            timestamps: true,
          }
        );

        notificationSchema.index({ userId: 1, timestamp: -1 });
        notificationSchema.index({ isRead: 1 });

        NotificationModel = mongoose.model("Notification", notificationSchema);
      }

      const dbNotification = new NotificationModel({
        userId,
        ...notification,
      });

      await dbNotification.save();
      return dbNotification;
    } catch (error) {
      logger.logError("Failed to store notification", {
        error: error.message,
        userId,
        notificationType: notification.type,
      });
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(userId, notification) {
    try {
      const mongoose = require("mongoose");
      const User = mongoose.model("User");
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      // Use existing email service
      const emailService = require("./AuthEmailService");
      const subject = notification.title;
      const emailBody = this.generateNotificationEmail(notification, user);

      await emailService.sendEmail(user.email, subject, emailBody);
    } catch (error) {
      logger.logError("Failed to send email notification", {
        error: error.message,
        userId,
        notificationType: notification.type,
      });
      // Don't throw error here to avoid breaking the main notification flow
    }
  }

  /**
   * Generate notification email HTML
   */
  generateNotificationEmail(notification, user) {
    const typeStyles = {
      workout_reminder: { color: "#3b82f6", bgColor: "#dbeafe" },
      appointment_confirmed: { color: "#059669", bgColor: "#d1fae5" },
      subscription_update: { color: "#d97706", bgColor: "#fef3c7" },
      achievement_unlocked: { color: "#8b5cf6", bgColor: "#ede9fe" },
      system_announcement: { color: "#6b7280", bgColor: "#f3f4f6" },
    };

    const style =
      typeStyles[notification.type] || typeStyles.system_announcement;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${
          style.bgColor
        }; padding: 20px; border-radius: 10px; border-left: 4px solid ${
      style.color
    };">
          <h2 style="color: ${style.color}; margin: 0 0 10px 0;">${
      notification.title
    }</h2>
          <p style="color: ${style.color}; margin: 0; font-size: 16px;">${
      notification.message
    }</p>
        </div>
        
        ${
          notification.data && Object.keys(notification.data).length > 0
            ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">Details</h3>
            ${Object.entries(notification.data)
              .map(
                ([key, value]) => `
              <p style="margin: 5px 0;"><strong>${key}:</strong> ${value}</p>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Dashboard
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            TechTrainers - Your Fitness Journey Starts Here
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const mongoose = require("mongoose");
      const Notification = mongoose.model("Notification");

      const { limit = 20, page = 1, unreadOnly = false } = options;

      const query = { userId };
      if (unreadOnly) {
        query.isRead = false;
      }

      const notifications = await Notification.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.countDocuments({
        userId,
        isRead: false,
      });

      return {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        unreadCount,
      };
    } catch (error) {
      logger.logError("Failed to get user notifications", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId, notificationId) {
    try {
      const mongoose = require("mongoose");
      const Notification = mongoose.model("Notification");

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );

      logger.logBusinessEvent("info", "Notification marked as read", {
        userId,
        notificationId,
      });
    } catch (error) {
      logger.logError("Failed to mark notification as read", {
        error: error.message,
        userId,
        notificationId,
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    try {
      const mongoose = require("mongoose");
      const Notification = mongoose.model("Notification");

      const result = await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      logger.logBusinessEvent("info", "All notifications marked as read", {
        userId,
        updatedCount: result.modifiedCount,
      });

      return result.modifiedCount;
    } catch (error) {
      logger.logError("Failed to mark all notifications as read", {
        error: error.message,
        userId,
      });
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId, notificationId) {
    try {
      const mongoose = require("mongoose");
      const Notification = mongoose.model("Notification");

      await Notification.findOneAndDelete({ _id: notificationId, userId });

      logger.logBusinessEvent("info", "Notification deleted", {
        userId,
        notificationId,
      });
    } catch (error) {
      logger.logError("Failed to delete notification", {
        error: error.message,
        userId,
        notificationId,
      });
      throw error;
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications() {
    try {
      const mongoose = require("mongoose");
      const Notification = mongoose.model("Notification");

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await Notification.deleteMany({
        timestamp: { $lt: thirtyDaysAgo },
      });

      logger.logBusinessEvent("info", "Old notifications cleaned up", {
        deletedCount: result.deletedCount,
      });

      return result.deletedCount;
    } catch (error) {
      logger.logError("Failed to cleanup old notifications", {
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new NotificationService();
