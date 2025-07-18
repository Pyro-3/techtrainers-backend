const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminAuth, adminOnly } = require('../middleware/adminAuth');
const { validateObjectId } = require('../middleware/ReqValidation');

// All routes require admin authentication
router.use(adminAuth);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', validateObjectId, adminController.getUser);
router.put('/users/:id', validateObjectId, adminController.updateUser);
router.delete('/users/:id', validateObjectId, adminController.deleteUser);
router.patch('/users/:id/status', validateObjectId, adminController.toggleUserStatus);
router.patch('/users/:id/role', validateObjectId, adminOnly, adminController.updateUserRole);

// Content management
router.get('/exercises', adminController.getAllExercises);
router.post('/exercises', adminController.createExercise);
router.put('/exercises/:id', validateObjectId, adminController.updateExercise);
router.delete('/exercises/:id', validateObjectId, adminController.deleteExercise);

// Analytics & Reporting
router.get('/analytics/users', adminOnly, adminController.getUserAnalytics);
router.get('/analytics/workouts', adminOnly, adminController.getWorkoutAnalytics);
router.get('/analytics/platform', adminOnly, adminController.getPlatformAnalytics);

// Support ticket management
router.get('/support/tickets', adminController.getAllSupportTickets);
router.get('/support/tickets/:id', validateObjectId, adminController.getSupportTicket);
router.put('/support/tickets/:id', validateObjectId, adminController.updateSupportTicket);
router.post('/support/tickets/:id/reply', validateObjectId, adminController.replySupportTicket);
router.patch('/support/tickets/:id/status', validateObjectId, adminController.updateTicketStatus);
router.patch('/support/tickets/:id/assign', validateObjectId, adminController.assignTicket);

module.exports = router;