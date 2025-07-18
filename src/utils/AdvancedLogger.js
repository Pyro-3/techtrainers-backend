/**
 * Advanced Logger - Integration Layer for DatabaseLogger
 * Provides backward compatibility while using the new DatabaseLogger
 */

const { logger, LOG_LEVELS, LOG_CATEGORIES } = require("./DatabaseLogger");

/**
 * Log business events with proper categorization
 */
const logBusinessEvent = async (event, data = {}, req = null) => {
  try {
    const category = getEventCategory(event);
    const level = getEventLevel(event);

    await logger.log(
      level,
      category,
      `Business Event: ${event}`,
      {
        event,
        action: event,
        ...data,
        severity: getEventSeverity(event),
      },
      req
    );
  } catch (error) {
    console.error("Failed to log business event:", error);
  }
};

/**
 * Log errors with proper categorization
 */
const logError = async (context, error, data = {}, req = null) => {
  try {
    const category = getErrorCategory(context);

    await logger.log(
      LOG_LEVELS.ERROR,
      category,
      `Error: ${context}`,
      {
        context,
        action: context,
        error: error.message,
        stack: error.stack,
        ...data,
        severity: "high",
      },
      req
    );
  } catch (logError) {
    console.error("Failed to log error:", logError);
  }
};

/**
 * Log authentication events
 */
const logAuthEvent = async (event, data = {}, req = null) => {
  try {
    const level = getAuthEventLevel(event);

    await logger.auth(
      level,
      `Auth Event: ${event}`,
      {
        event,
        action: event,
        ...data,
        severity: getAuthEventSeverity(event),
      },
      req
    );
  } catch (error) {
    console.error("Failed to log auth event:", error);
  }
};

/**
 * Log API requests
 */
const logApiRequest = async (req, res, duration = 0) => {
  try {
    const level = res.statusCode >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;
    const success = res.statusCode < 400;

    await logger.api(
      level,
      `API Request: ${req.method} ${req.originalUrl}`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        success,
        action: "API_REQUEST",
      },
      req
    );
  } catch (error) {
    console.error("Failed to log API request:", error);
  }
};

/**
 * Log database operations
 */
const logDatabaseOperation = async (operation, data = {}, req = null) => {
  try {
    const level = data.error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

    await logger.database(
      level,
      `Database Operation: ${operation}`,
      {
        operation,
        action: operation,
        ...data,
      },
      req
    );
  } catch (error) {
    console.error("Failed to log database operation:", error);
  }
};

/**
 * Log email operations
 */
const logEmailOperation = async (operation, data = {}, req = null) => {
  try {
    const level = data.error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

    await logger.email(
      level,
      `Email Operation: ${operation}`,
      {
        operation,
        action: operation,
        ...data,
      },
      req
    );
  } catch (error) {
    console.error("Failed to log email operation:", error);
  }
};

/**
 * Log SMS operations
 */
const logSmsOperation = async (operation, data = {}, req = null) => {
  try {
    const level = data.error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

    await logger.sms(
      level,
      `SMS Operation: ${operation}`,
      {
        operation,
        action: operation,
        ...data,
      },
      req
    );
  } catch (error) {
    console.error("Failed to log SMS operation:", error);
  }
};

/**
 * Log security events
 */
const logSecurityEvent = async (event, data = {}, req = null) => {
  try {
    await logger.security(
      `Security Event: ${event}`,
      {
        event,
        action: event,
        ...data,
        severity: "high",
      },
      req
    );
  } catch (error) {
    console.error("Failed to log security event:", error);
  }
};

/**
 * Log appointment operations
 */
const logAppointmentOperation = async (operation, data = {}, req = null) => {
  try {
    const level = data.error ? LOG_LEVELS.ERROR : LOG_LEVELS.INFO;

    await logger.appointment(
      level,
      `Appointment Operation: ${operation}`,
      {
        operation,
        action: operation,
        ...data,
      },
      req
    );
  } catch (error) {
    console.error("Failed to log appointment operation:", error);
  }
};

/**
 * Determine event category based on event type
 */
const getEventCategory = (event) => {
  const categoryMap = {
    USER_REGISTERED: LOG_CATEGORIES.AUTH,
    USER_LOGIN: LOG_CATEGORIES.AUTH,
    USER_LOGOUT: LOG_CATEGORIES.AUTH,
    PASSWORD_RESET: LOG_CATEGORIES.AUTH,
    EMAIL_VERIFIED: LOG_CATEGORIES.AUTH,
    PHONE_VERIFIED: LOG_CATEGORIES.AUTH,
    APPOINTMENT_BOOKED: LOG_CATEGORIES.APPOINTMENT,
    APPOINTMENT_CANCELLED: LOG_CATEGORIES.APPOINTMENT,
    APPOINTMENT_RESCHEDULED: LOG_CATEGORIES.APPOINTMENT,
    EMAIL_SENT: LOG_CATEGORIES.EMAIL,
    SMS_SENT: LOG_CATEGORIES.SMS,
    DATABASE_OPERATION: LOG_CATEGORIES.DATABASE,
    API_REQUEST: LOG_CATEGORIES.API,
    SECURITY_VIOLATION: LOG_CATEGORIES.SECURITY,
    ACCOUNT_LOCKED: LOG_CATEGORIES.SECURITY,
    FAILED_LOGIN: LOG_CATEGORIES.SECURITY,
    USER_CREATED: LOG_CATEGORIES.USER,
    USER_UPDATED: LOG_CATEGORIES.USER,
    USER_DELETED: LOG_CATEGORIES.USER,
  };

  return categoryMap[event] || LOG_CATEGORIES.SYSTEM;
};

/**
 * Determine event level based on event type
 */
const getEventLevel = (event) => {
  const levelMap = {
    USER_REGISTERED: LOG_LEVELS.INFO,
    USER_LOGIN: LOG_LEVELS.INFO,
    USER_LOGOUT: LOG_LEVELS.INFO,
    PASSWORD_RESET: LOG_LEVELS.INFO,
    EMAIL_VERIFIED: LOG_LEVELS.INFO,
    PHONE_VERIFIED: LOG_LEVELS.INFO,
    APPOINTMENT_BOOKED: LOG_LEVELS.INFO,
    APPOINTMENT_CANCELLED: LOG_LEVELS.INFO,
    APPOINTMENT_RESCHEDULED: LOG_LEVELS.INFO,
    EMAIL_SENT: LOG_LEVELS.INFO,
    SMS_SENT: LOG_LEVELS.INFO,
    DATABASE_OPERATION: LOG_LEVELS.INFO,
    API_REQUEST: LOG_LEVELS.INFO,
    SECURITY_VIOLATION: LOG_LEVELS.SECURITY,
    ACCOUNT_LOCKED: LOG_LEVELS.SECURITY,
    FAILED_LOGIN: LOG_LEVELS.WARN,
    USER_CREATED: LOG_LEVELS.INFO,
    USER_UPDATED: LOG_LEVELS.INFO,
    USER_DELETED: LOG_LEVELS.WARN,
  };

  return levelMap[event] || LOG_LEVELS.INFO;
};

/**
 * Determine error category based on context
 */
const getErrorCategory = (context) => {
  const categoryMap = {
    USER_REGISTRATION_FAILED: LOG_CATEGORIES.AUTH,
    USER_LOGIN_FAILED: LOG_CATEGORIES.AUTH,
    PASSWORD_RESET_FAILED: LOG_CATEGORIES.AUTH,
    EMAIL_VERIFICATION_FAILED: LOG_CATEGORIES.AUTH,
    PHONE_VERIFICATION_FAILED: LOG_CATEGORIES.AUTH,
    APPOINTMENT_BOOKING_FAILED: LOG_CATEGORIES.APPOINTMENT,
    APPOINTMENT_CANCELLATION_FAILED: LOG_CATEGORIES.APPOINTMENT,
    EMAIL_SEND_FAILED: LOG_CATEGORIES.EMAIL,
    SMS_SEND_FAILED: LOG_CATEGORIES.SMS,
    DATABASE_ERROR: LOG_CATEGORIES.DATABASE,
    API_ERROR: LOG_CATEGORIES.API,
    SECURITY_ERROR: LOG_CATEGORIES.SECURITY,
    USER_ERROR: LOG_CATEGORIES.USER,
  };

  return categoryMap[context] || LOG_CATEGORIES.SYSTEM;
};

/**
 * Determine event severity
 */
const getEventSeverity = (event) => {
  const severityMap = {
    USER_REGISTERED: "low",
    USER_LOGIN: "low",
    USER_LOGOUT: "low",
    PASSWORD_RESET: "medium",
    EMAIL_VERIFIED: "low",
    PHONE_VERIFIED: "low",
    APPOINTMENT_BOOKED: "low",
    APPOINTMENT_CANCELLED: "low",
    APPOINTMENT_RESCHEDULED: "low",
    EMAIL_SENT: "low",
    SMS_SENT: "low",
    DATABASE_OPERATION: "low",
    API_REQUEST: "low",
    SECURITY_VIOLATION: "critical",
    ACCOUNT_LOCKED: "high",
    FAILED_LOGIN: "medium",
    USER_CREATED: "low",
    USER_UPDATED: "low",
    USER_DELETED: "medium",
  };

  return severityMap[event] || "low";
};

/**
 * Determine auth event level
 */
const getAuthEventLevel = (event) => {
  const levelMap = {
    LOGIN_SUCCESS: LOG_LEVELS.INFO,
    LOGIN_FAILED: LOG_LEVELS.WARN,
    LOGOUT: LOG_LEVELS.INFO,
    REGISTRATION: LOG_LEVELS.INFO,
    PASSWORD_RESET_REQUEST: LOG_LEVELS.INFO,
    PASSWORD_RESET_SUCCESS: LOG_LEVELS.INFO,
    EMAIL_VERIFICATION_SENT: LOG_LEVELS.INFO,
    EMAIL_VERIFIED: LOG_LEVELS.INFO,
    PHONE_VERIFICATION_SENT: LOG_LEVELS.INFO,
    PHONE_VERIFIED: LOG_LEVELS.INFO,
    ACCOUNT_LOCKED: LOG_LEVELS.SECURITY,
    ACCOUNT_UNLOCKED: LOG_LEVELS.INFO,
    FAILED_LOGIN_ATTEMPT: LOG_LEVELS.WARN,
    SECURITY_VIOLATION: LOG_LEVELS.SECURITY,
  };

  return levelMap[event] || LOG_LEVELS.INFO;
};

/**
 * Determine auth event severity
 */
const getAuthEventSeverity = (event) => {
  const severityMap = {
    LOGIN_SUCCESS: "low",
    LOGIN_FAILED: "medium",
    LOGOUT: "low",
    REGISTRATION: "low",
    PASSWORD_RESET_REQUEST: "medium",
    PASSWORD_RESET_SUCCESS: "medium",
    EMAIL_VERIFICATION_SENT: "low",
    EMAIL_VERIFIED: "low",
    PHONE_VERIFICATION_SENT: "low",
    PHONE_VERIFIED: "low",
    ACCOUNT_LOCKED: "high",
    ACCOUNT_UNLOCKED: "medium",
    FAILED_LOGIN_ATTEMPT: "medium",
    SECURITY_VIOLATION: "critical",
  };

  return severityMap[event] || "low";
};

// Export all functions and the logger instance
module.exports = {
  // Main logger instance
  logger,

  // Constants
  LOG_LEVELS,
  LOG_CATEGORIES,

  // Legacy compatibility functions
  logBusinessEvent,
  logError,

  // New specialized logging functions
  logAuthEvent,
  logApiRequest,
  logDatabaseOperation,
  logEmailOperation,
  logSmsOperation,
  logSecurityEvent,
  logAppointmentOperation,

  // Direct access to logger methods
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  security: logger.security.bind(logger),
  audit: logger.audit.bind(logger),

  // Category-specific methods
  auth: logger.auth.bind(logger),
  database: logger.database.bind(logger),
  api: logger.api.bind(logger),
  email: logger.email.bind(logger),
  sms: logger.sms.bind(logger),
  appointment: logger.appointment.bind(logger),
  user: logger.user.bind(logger),
};
