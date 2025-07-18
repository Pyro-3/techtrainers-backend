const { logger } = require("../utils/AdvancedLogger");
const NotificationService = require("../services/NotificationService");

/**
 * Notification Controller
 * Handle notification-related requests
 */

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      userId.toString(),
      {
        page: parseInt(page),
        limit: parseInt(limit),
        unreadOnly: unreadOnly === "true",
      }
    );

    res.json({
      status: "success",
      data: notifications,
    });
  } catch (error) {
    await logger.logError("Failed to get notifications", {
      error: error.message,
      userId: req.user?._id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve notifications",
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await NotificationService.markAsRead(userId.toString(), [id]);

    res.json({
      status: "success",
      message: "Notification marked as read",
    });
  } catch (error) {
    await logger.logError("Failed to mark notification as read", {
      error: error.message,
      userId: req.user?._id,
      notificationId: req.params.id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to mark notification as read",
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await NotificationService.markAllAsRead(userId.toString());

    res.json({
      status: "success",
      message: "All notifications marked as read",
    });
  } catch (error) {
    await logger.logError("Failed to mark all notifications as read", {
      error: error.message,
      userId: req.user?._id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to mark all notifications as read",
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    await NotificationService.deleteNotification(userId.toString(), id);

    res.json({
      status: "success",
      message: "Notification deleted",
    });
  } catch (error) {
    await logger.logError("Failed to delete notification", {
      error: error.message,
      userId: req.user?._id,
      notificationId: req.params.id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to delete notification",
    });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await NotificationService.clearAllNotifications(userId.toString());

    res.json({
      status: "success",
      message: "All notifications cleared",
    });
  } catch (error) {
    await logger.logError("Failed to clear all notifications", {
      error: error.message,
      userId: req.user?._id,
      stack: error.stack,
    });

    res.status(500).json({
      status: "error",
      message: "Failed to clear all notifications",
    });
  }
};
