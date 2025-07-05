const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
console.log(`Looking for .env file at: ${envPath}`);
console.log(`File exists: ${fs.existsSync(envPath)}`);

dotenv.config({ path: envPath });

// Manually read MongoDB URI from .env file if not loaded by dotenv
if (!process.env.MONGODB_URI) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const mongoUriMatch = envContent.match(/MONGODB_URI=(.*)/);
    if (mongoUriMatch && mongoUriMatch[1]) {
      process.env.MONGODB_URI = mongoUriMatch[1].trim();
      console.log('Manually extracted MongoDB URI from .env file');
    }
  } catch (err) {
    console.error('Error reading .env file:', err);
  }
}

// Get MongoDB URI
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrainer';

console.log('Testing database connection...');
console.log(`Attempting to connect to: ${mongoUri ? mongoUri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@') : 'UNDEFINED_CONNECTION_STRING'}`);

// Extended timeout options
mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 40000,
  connectTimeoutMS: 40000
})
.then(async conn => {
  console.log('\n✅ SUCCESS: Connected to MongoDB!');
  console.log(`Host: ${conn.connection.host}`);
  console.log(`Database: ${conn.connection.db.databaseName}`);
  
  const collections = await conn.connection.db.listCollections().toArray();
  console.log('\nAvailable collections:');
  collections.length
    ? collections.forEach(c => console.log(`- ${c.name}`))
    : console.log('No collections found (empty database)');

  const userCount = await conn.connection.db.collection('users').countDocuments();
  console.log(`\nUsers in database: ${userCount}`);

  if (userCount === 0) {
    console.log('\nCreating a sample user...');
    await conn.connection.db.collection('users').insertOne({
      name: 'Test User',
      email: 'test@example.com',
      fitnessLevel: 'beginner',
      createdAt: new Date(),
      isTestUser: true
    });
    console.log('Sample user created successfully!');
  }

  console.log('\nDatabase connection test completed successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('\n❌ ERROR: Failed to connect to MongoDB');
  console.error(err);

  if (err.code === 'ECONNREFUSED') {
    console.log('\nTips:');
    console.log('1. Ensure MongoDB is installed and running');
    console.log('2. Verify the MongoDB URI in your .env file');
    console.log('3. If using Atlas, check IP whitelist and network access');
  }

  process.exit(1);
});
