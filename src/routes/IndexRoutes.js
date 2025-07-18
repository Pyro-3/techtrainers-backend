const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const workoutRoutes = require('./workoutRoutes');
const exerciseRoutes = require('./ExerciseRoutes');
const progressRoutes = require('./ProgressRoutes');
const adminRoutes = require('./AdminRoutes');
const supportRoutes = require('./supportRoutes');
const notificationRoutes = require('./NotificationRoutes');

// Register routes with appropriate base paths
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/progress', progressRoutes);
router.use('/admin', adminRoutes);
router.use('/support', supportRoutes);
router.use('/notifications', notificationRoutes);

// Development routes (only available in dev environment)
if (process.env.NODE_ENV === 'development') {
  const devAuthRoutes = require('./devAuthRoutes');
  router.use('/dev', devAuthRoutes);
}

// API health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;