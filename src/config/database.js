const mongoose = require("mongoose");

/**
 * Database Configuration Utility
 * Ensures proper connection to the correct database
 */

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Ensure the database name is explicitly set
    const dbName = process.env.DB_NAME || "techtrainer";

    // Parse the URI to ensure it includes the database name
    let connectionUri = uri;
    if (!uri.includes(`/${dbName}?`)) {
      // If the URI doesn't include the database name, add it
      const baseUri = uri.split("?")[0];
      const params = uri.split("?")[1];

      if (baseUri.endsWith("/")) {
        connectionUri = `${baseUri}${dbName}?${params}`;
      } else if (baseUri.includes("/") && !baseUri.endsWith(`/${dbName}`)) {
        // Replace the database name in the URI
        const parts = baseUri.split("/");
        parts[parts.length - 1] = dbName;
        connectionUri = `${parts.join("/")}?${params}`;
      } else {
        connectionUri = `${baseUri}/${dbName}?${params}`;
      }
    }

    const options = {
      serverSelectionTimeoutMS: 40000,
      connectTimeoutMS: 40000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      // Explicitly set the database name
      dbName: dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    console.log(`🔄 Connecting to MongoDB database: ${dbName}`);
    console.log(
      `🔗 Connection URI: ${connectionUri.replace(/:.*@/, "://**:**@")}`
    );

    await mongoose.connect(connectionUri, options);

    // Verify we're connected to the correct database
    const db = mongoose.connection.db;
    console.log(`✅ Connected to MongoDB database: ${db.databaseName}`);

    // List collections to verify
    const collections = await db.listCollections().toArray();
    console.log(
      `📋 Available collections: ${collections.map((c) => c.name).join(", ")}`
    );

    return {
      success: true,
      database: db.databaseName,
      collections: collections.map((c) => c.name),
    };
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    throw error;
  }
};

/**
 * Create static admin account
 */
const createStaticAdmin = async () => {
  try {
    const User = require("./models/User");
    const bcrypt = require("bcryptjs");

    const adminEmail = "admin@techtrainers.ca";
    const adminPassword = "Adm1n$$33!";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("✅ Static admin account already exists");
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin account
    const admin = new User({
      name: "System Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
      isStaticAdmin: true,
      profileCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await admin.save();
    console.log("✅ Static admin account created successfully");
    console.log(`📧 Admin email: ${adminEmail}`);
    console.log(`🔒 Admin password: ${adminPassword}`);

    return admin;
  } catch (error) {
    console.error("❌ Failed to create static admin:", error.message);
    throw error;
  }
};

/**
 * Database health check
 */
const healthCheck = async () => {
  try {
    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection not established");
    }

    // Check database name
    const dbName = db.databaseName;
    console.log(`🏥 Health check - Database: ${dbName}`);

    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Collections: ${collections.map((c) => c.name).join(", ")}`);

    // Check if we can perform basic operations
    const User = require("./models/User");
    const userCount = await User.countDocuments();
    console.log(`👥 Total users: ${userCount}`);

    return {
      success: true,
      database: dbName,
      collections: collections.map((c) => c.name),
      userCount,
    };
  } catch (error) {
    console.error("❌ Database health check failed:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Fix collection references
 */
const fixCollectionReferences = async () => {
  try {
    const db = mongoose.connection.db;

    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    console.log("📋 Current collections:", collectionNames);

    // Check if there are any collections that need to be moved/renamed
    const expectedCollections = [
      "users",
      "workouts",
      "workoutlogs",
      "logs",
      "supporttickets",
      "supportfeedbacks",
      "bookings",
    ];

    for (const expectedCollection of expectedCollections) {
      if (!collectionNames.includes(expectedCollection)) {
        console.log(`⚠️  Missing collection: ${expectedCollection}`);
      } else {
        console.log(`✅ Found collection: ${expectedCollection}`);
      }
    }

    return {
      success: true,
      currentCollections: collectionNames,
      expectedCollections,
    };
  } catch (error) {
    console.error("❌ Failed to fix collection references:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  connectToDatabase,
  createStaticAdmin,
  healthCheck,
  fixCollectionReferences,
};
