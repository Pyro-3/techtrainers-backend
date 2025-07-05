require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Initialize app
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

// MongoDB URI
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}

// Connect to MongoDB via Mongoose
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      family: 4,
    });
    console.log('✅ Connected to MongoDB via Mongoose');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

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

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Start server
async function startServer() {
  await connectToMongoDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();

module.exports = app;
