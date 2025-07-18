const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * Token generation and verification utilities
 */

/**
 * Generate a random token
 * @param {number} byteLength - Length of bytes to generate
 * @returns {string} - Hex-encoded random token
 */
const generateRandomToken = (byteLength = 32) => {
  return crypto.randomBytes(byteLength).toString('hex');
};

/**
 * Generate a JWT token
 * @param {Object} payload - Data to encode in token
 * @param {string} expiresIn - Expiration time
 * @returns {string} - JWT token
 */
const generateJWT = (payload, expiresIn = '1d') => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate a password reset token
 * @returns {Object} - Token and hashed token
 */
const generatePasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Token expires in 1 hour
  const expiresAt = Date.now() + 3600000;
  
  return {
    resetToken,
    hash,
    expiresAt
  };
};

module.exports = {
  generateRandomToken,
  generateJWT,
  verifyJWT,
  generatePasswordResetToken
};