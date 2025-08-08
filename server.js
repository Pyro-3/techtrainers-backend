require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const workoutRoutes = require('./src/routes/workoutRoutes');
const trainerRoutes = require('./src/routes/trainerRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const paymentRoutes = require('./src/routes/enhancedPaymentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://localhost:3000', 
    'http://localhost:5000',
    'https://techtrainers-frontend.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'TechTrainer API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// DEBUG: Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/payments', paymentRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    debug: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/techtrainer')
.then(() => {
  console.log('✅ Connected to MongoDB');
  
  // Start server
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

module.exports = app;