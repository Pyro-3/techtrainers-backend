// Script to list all pending trainers
// Usage: node list-pending-trainers.js

const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('./src/models/User');

const listPendingTrainers = async () => {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to database...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrainers');
    console.log('✅ Connected to database');
    
    // First check all users
    const allUsers = await User.find({}).select('name email role isApproved isDeleted');
    console.log(`Total users in database: ${allUsers.length}`);
    
    // List all trainers (approved and pending)
    const allTrainers = await User.find({ role: 'trainer', isDeleted: false }).select('name email isApproved createdAt');
    console.log(`Total trainers: ${allTrainers.length}`);
    
    if (allTrainers.length > 0) {
      console.log('\nAll trainers:');
      allTrainers.forEach((trainer, index) => {
        console.log(`${index + 1}. ${trainer.name} (${trainer.email}) - Approved: ${trainer.isApproved}`);
      });
    }
    
    // Find all pending trainers
    const pendingTrainers = await User.find({ 
      role: 'trainer', 
      isApproved: false,
      isDeleted: false 
    }).select('name email createdAt');
    
    if (pendingTrainers.length === 0) {
      console.log('\n❌ No pending trainers found.');
    } else {
      console.log(`\n⏳ Found ${pendingTrainers.length} pending trainer(s):\n`);
      
      pendingTrainers.forEach((trainer, index) => {
        console.log(`${index + 1}. ${trainer.name}`);
        console.log(`   Email: ${trainer.email}`);
        console.log(`   Created: ${trainer.createdAt}`);
        console.log(`   To approve: node approve-trainer.js ${trainer.email}\n`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing trainers:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

listPendingTrainers();
