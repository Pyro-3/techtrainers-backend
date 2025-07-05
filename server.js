require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Initialize Express app
const app = express();

// Middleware setup
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB URI from environment
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

// MongoDB Client with modern config (no deprecated options)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 40000,
  connectTimeoutMS: 40000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority',
});

// Start server and database
async function startServer() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Connected to MongoDB');

    // Route imports
    const authRoutes = require('./src/routes/authRoutes');
    const userRoutes = require('./src/routes/userRoutes');
    const workoutRoutes = require('./src/routes/workoutRoutes');
    const trainerRoutes = require('./src/routes/trainerRoutes');
    const chatRoutes = require('./src/routes/chatRoutes');
    const workoutLogRoutes = require('./src/routes/WorkoutLogRoutes');

    // Use routes
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
        time: new Date().toISOString(),
      });
    });

    // Default route
    app.get('/', (_, res) => {
      res.json({ message: 'Welcome to TechTrainer API' });
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('🔥 Server Error:', err);
      res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error',
      });
    });

    // Launch server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    if (err.code === 8000) {
      console.error('🔧 Check your MongoDB credentials and IP whitelist');
    }
    process.exit(1);
  }
}

startServer();

module.exports = app;
