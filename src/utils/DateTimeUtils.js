/**
 * Date and time utility functions
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date
 */
const formatDate = (date) => {
  date = date instanceof Date ? date : new Date(date);
  return date.toISOString().split('T')[0];
};

/**
 * Get date range for a given period
 * @param {string} period - Period ('day', 'week', 'month', 'year')
 * @returns {Object} - Start and end dates
 */
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1); // First day of month
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setMonth(0, 1); // January 1st
      start.setHours(0, 0, 0, 0);
      break;
    default:
      throw new Error('Invalid period specified');
  }
  
  return {
    start,
    end: now
  };
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - Date to check
 * @returns {boolean} - Whether date is in the past
 */
const isDateInPast = (date) => {
  const checkDate = date instanceof Date ? date : new Date(date);
  return checkDate < new Date();
};

/**
 * Calculate time difference in minutes
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {number} - Minutes between dates
 */
const getMinutesBetweenDates = (start, end) => {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  
  return Math.round((endDate - startDate) / (1000 * 60));
};

/**
 * Get days between two dates
 * @param {Date|string} start - Start date
 * @param {Date|string} end - End date
 * @returns {number} - Days between dates
 */
const getDaysBetweenDates = (start, end) => {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  
  // Set to noon to avoid DST issues
  startDate.setHours(12, 0, 0, 0);
  endDate.setHours(12, 0, 0, 0);
  
  return Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
};

/**
 * Add days to a date
 * @param {Date} date - Base date
 * @param {number} days - Days to add
 * @returns {Date} - New date
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

module.exports = {
  formatDate,
  getDateRange,
  isDateInPast,
  getMinutesBetweenDates,
  getDaysBetweenDates,
  addDays
};