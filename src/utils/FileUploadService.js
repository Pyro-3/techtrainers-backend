const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { ApiError } = require('../middleware/errorHandler');

/**
 * File upload service for managing image and file uploads
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to local file
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `techtrainer/${folder}`,
      resource_type: 'auto'
    });
    
    // Delete local file after upload
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });
    
    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    // Delete local file if upload fails
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting local file after failed upload:', err);
    });
    
    console.error('Cloudinary upload error:', error);
    throw new ApiError('File upload failed', 500);
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new ApiError('Failed to delete file', 500);
  }
};

/**
 * Get file extension from MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} - File extension
 */
const getFileExtensionFromMime = (mimeType) => {
  const mimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
  };
  
  return mimeToExt[mimeType] || 'bin';
};

/**
 * Generate unique filename
 * @param {string} originalName - Original file name
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const basename = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
  
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return `${basename}-${timestamp}-${random}${ext}`;
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getFileExtensionFromMime,
  generateUniqueFilename
};