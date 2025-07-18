const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { userAuth } = require('../middleware/userAuth');
const { validateObjectId } = require('../middleware/ReqValidation');

// All routes require authentication
router.use(userAuth);

// Notifications
router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', validateObjectId, notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/:id', validateObjectId, notificationController.deleteNotification);
router.delete('/clear-all', notificationController.clearAllNotifications);

module.exports = router;