/**
 * Standard response formatter for API
 * Ensures consistent response structure throughout the application
 */

/**
 * Format a successful response
 * @param {Object} data - The data to send back
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const formatSuccess = (data = null, message = "Success", statusCode = 200) => {
  return {
    status: "success",
    message,
    data,
    timestamp: new Date().toISOString(),
    statusCode,
  };
};

/**
 * Format an error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array|Object} errors - Detailed error information (optional)
 */
const formatError = (
  message = "An error occurred",
  statusCode = 500,
  errors = null
) => {
  const response = {
    status: "error",
    message,
    timestamp: new Date().toISOString(),
    statusCode,
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const success = (res, data = null, message = "Success", statusCode = 200) => {
  return res.status(statusCode).json(formatSuccess(data, message, statusCode));
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array|Object} errors - Detailed errors
 */
const error = (
  res,
  message = "An error occurred",
  statusCode = 500,
  errors = null
) => {
  return res.status(statusCode).json(formatError(message, statusCode, errors));
};

/**
 * Send paginated success response
 * @param {Object} res - Express response object
 * @param {Array} results - Array of results
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
const paginated = (
  res,
  results,
  pagination,
  message = "Data retrieved successfully"
) => {
  return success(
    res,
    {
      results,
      pagination,
    },
    message
  );
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const created = (res, data, message = "Resource created successfully") => {
  return success(res, data, message, 201);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
const noContent = (res) => {
  return res.status(204).send();
};

/**
 * Send bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Array|Object} errors - Validation errors
 */
const badRequest = (res, message = "Bad request", errors = null) => {
  return error(res, message, 400, errors);
};

/**
 * Send unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = "Unauthorized") => {
  return error(res, message, 401);
};

/**
 * Send forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = "Forbidden") => {
  return error(res, message, 403);
};

/**
 * Send not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFound = (res, message = "Resource not found") => {
  return error(res, message, 404);
};

/**
 * Send conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflict = (res, message = "Conflict") => {
  return error(res, message, 409);
};

/**
 * Send internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const serverError = (res, message = "Internal server error") => {
  return error(res, message, 500);
};

module.exports = {
  formatSuccess,
  formatError,
  success,
  error,
  paginated,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
};
