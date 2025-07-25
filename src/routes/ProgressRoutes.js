const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { auth } = require('../middleware/auth');
const { validateProgress, validateObjectId } = require('../middleware/ReqValidation');
const { uploadProfilePicture } = require('../middleware/fileUpload');

// All routes require authentication
router.use(auth);

// Progress tracking
router.post('/', validateProgress.create, progressController.createProgressEntry);
router.get('/', progressController.getProgressHistory);
router.get('/stats', progressController.getProgressStats);
router.get('/:id', validateObjectId, progressController.getProgressEntry);
router.put('/:id', validateObjectId, validateProgress.create, progressController.updateProgressEntry);
router.delete('/:id', validateObjectId, progressController.deleteProgressEntry);

// Progress photos
router.post('/photos', uploadProfilePicture, progressController.addProgressPhoto);
router.get('/photos', progressController.getProgressPhotos);
router.delete('/photos/:photoId', progressController.deleteProgressPhoto);

module.exports = router;