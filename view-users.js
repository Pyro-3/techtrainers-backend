// Script to view users in the database
const mongoose = require('mongoose');
const User = require('./src/models/User');

// MongoDB Atlas connection string
const mongoUri = "mongodb+srv://TechTrainer:gxZsRBvgpqHK9ctF@techtrainer.z8zfkvv.mongodb.net/?retryWrites=true&w=majority&appName=TechTrainer";

console.log("Connecting to MongoDB Atlas to view users...");

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to database successfully!");
    
    try {
      // Count users
      const userCount = await User.countDocuments();
      console.log(`\nTotal users in database: ${userCount}`);
      
      // Get all users
      const users = await User.find().select('-password');
      
      console.log("\nUSER LIST:");
      console.log("==========");
      
      if (users.length) {
        users.forEach((user, index) => {
          console.log(`\nUSER ${index + 1}:`);
          console.log(`ID: ${user._id}`);
          console.log(`Name: ${user.name}`);
          console.log(`Email: ${user.email}`);
          console.log(`Fitness Level: ${user.fitnessLevel}`);
          console.log(`Created: ${user.createdAt || 'N/A'}`);
        });
      } else {
        console.log("No users found in database");
      }
    } catch (err) {
      console.error("Error retrieving users:", err);
    } finally {
      // Close connection
      await mongoose.connection.close();
      console.log("\nDatabase connection closed");
      process.exit(0);
    }
  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1);
  });
