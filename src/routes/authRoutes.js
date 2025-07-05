require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

// MongoDB connection URI
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB via Mongoose...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 40000,
      connectTimeoutMS: 40000
    });
    console.log('✅ Connected to MongoDB via Mongoose');

    // Routes
    const authRoutes = require('./src/routes/authRoutes');
    const userRoutes = require('./src/routes/userRoutes');
    const workoutRoutes = require('./src/routes/workoutRoutes');
    const trainerRoutes = require('./src/routes/trainerRoutes');
    const chatRoutes = require('./src/routes/chatRoutes');
    const workoutLogRoutes = require('./src/routes/WorkoutLogRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/workouts', workoutRoutes);
    app.use('/api/trainers', trainerRoutes);
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

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('🔥 Server Error:', err);
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
      });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
