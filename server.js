require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Initialize Express
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

console.log("🔄 Connecting to MongoDB...");

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 40000,
  connectTimeoutMS: 40000,
  maxPoolSize: 10,
})
.then(() => {
  console.log("✅ Connected to MongoDB via Mongoose");
})
.catch(err => {
  console.error("❌ MongoDB connection failed:", err.message);
  process.exit(1);
});

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const chatRoutes = require('./routes/chatRoutes');
const workoutLogRoutes = require('./routes/WorkoutLogRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/workout-logs', workoutLogRoutes);

// Health check
app.get('/api/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    time: new Date().toISOString()
  });
});

// Root route
app.get('/', (_, res) => {
  res.json({ message: 'Welcome to TechTrainer API' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
