// Direct database fix for trainer account
const mongoose = require('mongoose');
require('dotenv').config();

async function fixTrainerAccount() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techtrainers';
    console.log('Connecting to:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database');
    
    // Define User schema inline (minimal version)
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String,
      isApproved: Boolean,
      isDeleted: { type: Boolean, default: false }
    }, { 
      collection: 'users',
      strict: false  // Allow other fields
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Find and update the user
    const email = 'juniori@gmail.com';
    console.log(`Looking for user with email: ${email}`);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('Found user:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    });
    
    // Update the user
    const updated = await User.findOneAndUpdate(
      { email },
      { 
        role: 'trainer',
        isApproved: true
      },
      { new: true }
    );
    
    console.log('✅ User updated:', {
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isApproved: updated.isApproved
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

fixTrainerAccount();
