/**
 * Database helper functions
 */

const mongoose = require("mongoose");
const LoggerUtils = require("./LoggerUtils");

const logger = LoggerUtils.createLogger("database");

/**
 * Connect to MongoDB database
 * @returns {Promise} - Connection promise
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    logger.info("🔄 Connecting to MongoDB...");

    const options = {
      serverSelectionTimeoutMS: 40000,
      connectTimeoutMS: 40000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    await mongoose.connect(uri, options);

    logger.info("✅ Connected to MongoDB successfully");

    // Connection event handlers
    mongoose.connection.on("disconnected", () => {
      logger.warn("📤 MongoDB disconnected");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("🔄 MongoDB reconnected");
    });

    return mongoose.connection;
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise} - Disconnection promise
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info("📤 MongoDB connection closed");
  } catch (error) {
    logger.error("❌ Error closing MongoDB connection:", error);
    throw error;
  }
};

/**
 * Get database connection status
 * @returns {string} - Connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
};

/**
 * Convert string ID to MongoDB ObjectId
 * @param {string} id - String ID
 * @returns {ObjectId} - MongoDB ObjectId
 */
const toObjectId = (id) => {
  return new mongoose.Types.ObjectId(id);
};

/**
 * Check if string is valid MongoDB ObjectId
 * @param {string} id - String ID to validate
 * @returns {boolean} - Validation result
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Create pagination options for MongoDB queries
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10)
 * @param {string} options.sortBy - Field to sort by
 * @param {string} options.sortOrder - Sort direction ('asc' or 'desc')
 * @returns {Object} - MongoDB query options
 */
const createPaginationOptions = (options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = Math.min(parseInt(options.limit) || 10, 100); // Max 100 items per page
  const skip = (page - 1) * limit;

  const queryOptions = {
    skip,
    limit,
  };

  if (options.sortBy) {
    const sortDirection = options.sortOrder?.toLowerCase() === "asc" ? 1 : -1;
    queryOptions.sort = { [options.sortBy]: sortDirection };
  } else {
    // Default sort by createdAt descending
    queryOptions.sort = { createdAt: -1 };
  }

  return queryOptions;
};

/**
 * Get results with pagination metadata
 * @param {Model} model - Mongoose model
 * @param {Object} query - Query object
 * @param {Object} options - Query options
 * @param {string|Object} [populate] - Fields to populate
 * @returns {Object} - Results with pagination metadata
 */
const getPaginatedResults = async (
  model,
  query = {},
  options = {},
  populate = null
) => {
  const paginationOptions = createPaginationOptions(options);

  // Build the database query
  let dbQuery = model.find(query);

  // Apply pagination
  dbQuery = dbQuery.skip(paginationOptions.skip).limit(paginationOptions.limit);

  // Apply sorting
  if (paginationOptions.sort) {
    dbQuery = dbQuery.sort(paginationOptions.sort);
  }

  // Apply population
  if (populate) {
    dbQuery = dbQuery.populate(populate);
  }

  // Execute query
  const results = await dbQuery.lean();

  // Get total count for pagination
  const totalResults = await model.countDocuments(query);
  const totalPages = Math.ceil(totalResults / paginationOptions.limit);
  const currentPage = parseInt(options.page) || 1;

  return {
    results,
    pagination: {
      page: currentPage,
      limit: paginationOptions.limit,
      totalResults,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1,
    },
  };
};

/**
 * Create database indexes for better performance
 * @param {Model} model - Mongoose model
 * @param {Array} indexes - Array of index specifications
 */
const createIndexes = async (model, indexes) => {
  try {
    for (const index of indexes) {
      await model.createIndex(index.fields, index.options || {});
      logger.info(`✅ Index created for ${model.modelName}:`, index.fields);
    }
  } catch (error) {
    logger.error(`❌ Error creating indexes for ${model.modelName}:`, error);
  }
};

/**
 * Perform database health check
 * @returns {Object} - Health check results
 */
const healthCheck = async () => {
  try {
    const status = getConnectionStatus();

    if (status !== "connected") {
      return {
        status: "unhealthy",
        message: `Database is ${status}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Test database operation
    await mongoose.connection.db.admin().ping();

    return {
      status: "healthy",
      message: "Database connection is working",
      readyState: status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  toObjectId,
  isValidObjectId,
  createPaginationOptions,
  getPaginatedResults,
  createIndexes,
  healthCheck,
};
