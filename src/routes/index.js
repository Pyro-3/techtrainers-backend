const express = require('express');
const cors = require('cors');

const router = express.Router();

// Enhanced CORS configuration
router.use(cors({
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

// Import routes
const authRoutes = require('./authRoutes');
const trainerRoutes = require('./trainerRoutes');
const chatRoutes = require('./chatRoutes');
const paymentRoutes = require('./enhancedPaymentRoutes');

// Health check route
router.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'TechTrainer API is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/trainers', trainerRoutes);
router.use('/chat', chatRoutes);
router.use('/payments', paymentRoutes);

// Debug route for login testing
router.post('/debug/login', async (req, res) => {
    try {
        const User = require('../models/User');
        const bcrypt = require('bcryptjs');

        const { email, password } = req.body;
        console.log('Debug login attempt:', email);

        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        console.log('Debug: User found:', !!user);
        console.log('Debug: User has password:', !!user?.password);

        if (user && user.password) {
            const isValid = await bcrypt.compare(password, user.password);
            console.log('Debug: Password valid:', isValid);
        }

        res.json({
            status: 'debug',
            userExists: !!user,
            hasPassword: !!user?.password,
            email: email
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// 404 handler
router.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`
    });
});

module.exports = router;