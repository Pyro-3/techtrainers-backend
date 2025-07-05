require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Enhanced connection options for reliability
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  w: 'majority'
});

async function connectDB() {
  try {
    // Connect to MongoDB
    await client.connect();
    
    // Verify connection with ping
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged your deployment. You successfully connected to MongoDB!");
    
    // Return database instance (replace 'your-database-name' with actual DB name)
    return client.db(process.env.DB_NAME || 'your-database-name');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      codeName: error.codeName
    });
    
    // Don't exit process immediately, allow for retry logic
    throw error;
  }
}

// For server integration - keeps connection alive
async function initDatabase() {
  try {
    const db = await connectDB();
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});

module.exports = { connectDB, initDatabase, client };