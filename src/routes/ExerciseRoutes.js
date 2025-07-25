const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/ReqValidation');
const { uploadExerciseImage } = require('../middleware/fileUpload');
const { apiLimiter } = require('../middleware/rateLimit');

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, exerciseController.getExercises);
router.get('/search', optionalAuth, exerciseController.searchExercises);
router.get('/:id', optionalAuth, validateObjectId, exerciseController.getExercise);

// Protected routes
router.use(auth);
router.post('/', apiLimiter, uploadExerciseImage, exerciseController.createExercise);
router.put('/:id', validateObjectId, uploadExerciseImage, exerciseController.updateExercise);
router.delete('/:id', validateObjectId, exerciseController.deleteExercise);
router.post('/:id/favorite', validateObjectId, exerciseController.favoriteExercise);
router.delete('/:id/favorite', validateObjectId, exerciseController.unfavoriteExercise);

module.exports = router;