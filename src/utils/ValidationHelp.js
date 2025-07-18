/**
 * Common validation helpers for use throughout the application
 */

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} - Whether ID is valid
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Check if a string is a valid email
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is a strong password
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid and feedback
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      feedback: 'Password must be at least 8 characters long'
    };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);
  
  const validations = [
    { condition: hasUppercase, message: 'uppercase letter' },
    { condition: hasLowercase, message: 'lowercase letter' },
    { condition: hasNumbers, message: 'number' },
    { condition: hasSpecialChars, message: 'special character' }
  ];
  
  const failedValidations = validations.filter(v => !v.condition).map(v => v.message);
  
  if (failedValidations.length > 0) {
    return {
      isValid: false,
      feedback: `Password must contain at least one ${failedValidations.join(', ')}`
    };
  }
  
  return {
    isValid: true,
    feedback: 'Password meets strength requirements'
  };
};

/**
 * Sanitize an object by removing specified fields
 * @param {Object} obj - Object to sanitize
 * @param {Array<string>} fieldsToRemove - Fields to remove
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj, fieldsToRemove = ['password', 'passwordConfirmation']) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach(field => delete sanitized[field]);
  return sanitized;
};

module.exports = {
  isValidObjectId,
  isValidEmail,
  validatePasswordStrength,
  sanitizeObject
};