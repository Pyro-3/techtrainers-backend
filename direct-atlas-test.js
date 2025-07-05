// Direct MongoDB Atlas Connection Test
const mongoose = require('mongoose');

// The direct connection string (from your input)
const mongoUri = "mongodb+srv://TechTrainer:gxZsRBvgpqHK9ctF@techtrainer.z8zfkvv.mongodb.net/?retryWrites=true&w=majority&appName=TechTrainer";

console.log("Attempting to connect directly to MongoDB Atlas...");

mongoose.connect(mongoUri)
  .then(async conn => {
    console.log("\n✅ SUCCESS: Connected to MongoDB Atlas!");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
    
    // List collections
    const collections = await conn.connection.db.listCollections().toArray();
    
    console.log('\nAvailable collections:');
    if (collections.length) {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('No collections found (empty database)');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error("\n❌ ERROR: Failed to connect to MongoDB Atlas");
    console.error(err);
    process.exit(1);
  });
