const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ApiError } = require('./errorHandler');
const crypto = require('crypto');

/**
 * Middleware for handling file uploads
 * Supports profile pictures, workout attachments, and other app files
 */

// Define upload directories
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PROFILE_PICTURES_DIR = path.join(UPLOAD_DIR, 'profile-pictures');
const WORKOUT_FILES_DIR = path.join(UPLOAD_DIR, 'workout-files');
const EXERCISE_IMAGES_DIR = path.join(UPLOAD_DIR, 'exercise-images');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');

// Ensure directories exist
[UPLOAD_DIR, PROFILE_PICTURES_DIR, WORKOUT_FILES_DIR, EXERCISE_IMAGES_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate a unique filename
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileExtension = path.extname(originalname);
  const sanitizedFilename = path.basename(originalname, fileExtension)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
  
  return `${sanitizedFilename}-${timestamp}-${randomString}${fileExtension}`;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file type
    if (file.fieldname === 'profilePicture') {
      cb(null, PROFILE_PICTURES_DIR);
    } else if (file.fieldname === 'workoutFile') {
      cb(null, WORKOUT_FILES_DIR);
    } else if (file.fieldname === 'exerciseImage') {
      cb(null, EXERCISE_IMAGES_DIR);
    } else {
      cb(null, TEMP_DIR);
    }
  },
  filename: (req, file, cb) => {
    cb(null, generateUniqueFilename(file.originalname));
  }
});

// File filter for image uploads
const imageFilter = (req, file, cb) => {
  // Allow only image file types
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new ApiError('Only image files are allowed', 400), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  // Allow common document file types
  const allowedFileTypes = /pdf|doc|docx|txt|rtf|csv|xlsx|xls|ppt|pptx/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  } else {
    return cb(new ApiError('Only document files are allowed', 400), false);
  }
};

// Create multer instances
const uploadProfilePicture = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('profilePicture');

const uploadExerciseImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8MB
  }
}).single('exerciseImage');

const uploadWorkoutFiles = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // For workout files, allow both images and documents
    if (file.mimetype.startsWith('image/')) {
      imageFilter(req, file, cb);
    } else {
      documentFilter(req, file, cb);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
}).array('workoutFiles', 5); // Allow up to 5 files

// Error handling wrapper for multer middleware
const handleMulterError = (uploadFunction) => {
  return (req, res, next) => {
    uploadFunction(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError('File too large', 400));
        }
        return next(new ApiError(`Upload error: ${err.message}`, 400));
      } else if (err) {
        return next(err);
      }
      next();
    });
  };
};

// Function to delete uploaded files
const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// Utility function to get a file's public URL
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  
  const relativePath = path.relative(UPLOAD_DIR, filePath);
  const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;
  return `${baseUrl}/${relativePath.replace(/\\/g, '/')}`;
};

module.exports = {
  uploadProfilePicture: handleMulterError(uploadProfilePicture),
  uploadExerciseImage: handleMulterError(uploadExerciseImage),
  uploadWorkoutFiles: handleMulterError(uploadWorkoutFiles),
  deleteFile,
  getFileUrl,
  UPLOAD_DIR,
  PROFILE_PICTURES_DIR,
  WORKOUT_FILES_DIR,
  EXERCISE_IMAGES_DIR
};