// Quick script to approve a trainer account
// Usage: node approve-trainer.js <email>

const mongoose = require('mongoose');
require('dotenv').config();

// Import User model (adjust path as needed)
const User = require('./src/models/User');

const approveTrainer = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrainers');
    console.log('Connected to database');
    
    // Find the trainer
    const trainer = await User.findOne({ email, role: 'trainer' });
    
    if (!trainer) {
      console.error(`Trainer with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`Found trainer: ${trainer.name} (${trainer.email})`);
    console.log(`Current approval status: ${trainer.isApproved}`);
    
    // Approve the trainer
    trainer.isApproved = true;
    await trainer.save();
    
    console.log(`✅ Trainer ${trainer.name} has been approved!`);
    
  } catch (error) {
    console.error('Error approving trainer:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node approve-trainer.js <email>');
  process.exit(1);
}

approveTrainer(email);
