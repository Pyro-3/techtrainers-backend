const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

// Health check routes
router.get('/', healthController.getHealth);
router.get('/status', healthController.getStatus);

module.exports = router;
