const healthController = {
    // Basic health check
    getHealth: async (req, res) => {
        try {
            res.json({
                status: "success",
                message: "TechTrainer API is running!",
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || "development",
                version: "1.0.0",
                endpoints: {
                    auth: "/api/auth/*",
                    trainers: "/api/trainers/*",
                    payments: "/api/payments/*",
                    chat: "/api/chat/*",
                    docs: "/api/docs"
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Health check failed"
            });
        }
    },

    // Detailed system status
    getStatus: async (req, res) => {
        try {
            const mongoose = require('mongoose');

            res.json({
                status: "success",
                data: {
                    server: {
                        uptime: process.uptime(),
                        memory: process.memoryUsage(),
                        platform: process.platform,
                        nodeVersion: process.version
                    },
                    database: {
                        status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
                        host: mongoose.connection.host,
                        name: mongoose.connection.name
                    },
                    features: {
                        twilio: !!process.env.TWILIO_ACCOUNT_SID,
                        openai: !!process.env.OPENAI_API_KEY,
                        stripe: !!process.env.STRIPE_SECRET_KEY
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Status check failed"
            });
        }
    }
};

module.exports = healthController;
