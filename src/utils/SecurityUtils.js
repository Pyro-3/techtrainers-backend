const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/**
 * Security utilities
 */

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 10) => {
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare plain text password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - Whether passwords match
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate a cryptographically secure random string
 * @param {number} length - Length of string
 * @returns {string} - Random string
 */
const generateSecureToken = (length = 32) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

/**
 * Hash a string using SHA-256
 * @param {string} data - String to hash
 * @returns {string} - Hashed string
 */
const hashString = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

/**
 * Mask sensitive data like credit card or email
 * @param {string} data - Data to mask
 * @param {string} type - Type of data ('email', 'card', 'phone')
 * @returns {string} - Masked data
 */
const maskSensitiveData = (data, type) => {
  if (!data) return "";

  switch (type) {
    case "email":
      const [username, domain] = data.split("@");
      return `${username.charAt(0)}${"*".repeat(username.length - 2)}${username.charAt(username.length - 1)}@${domain}`;

    case "card":
      return `${"*".repeat(data.length - 4)}${data.slice(-4)}`;

    case "phone":
      return `${"*".repeat(data.length - 4)}${data.slice(-4)}`;

    default:
      return data;
  }
};

module.exports = {
  hashPassword,
  comparePassword,
  generateSecureToken,
  hashString,
  maskSensitiveData,
};
