const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Import User model
const User = require('./src/models/User');

async function debugLogin() {
    try {
        console.log('🔍 Debugging login functionality...\n');

        // Check if test user exists
        const testEmail = 'test@example.com';
        let user = await User.findOne({ email: testEmail }).select('+password');

        if (!user) {
            console.log('👤 Creating test user...');
            // Create test user
            const hashedPassword = await bcrypt.hash('password123', 12);
            user = new User({
                name: 'Test User',
                email: testEmail,
                password: hashedPassword,
                fitnessLevel: 'beginner',
                role: 'member'
            });
            await user.save();
            console.log('✅ Test user created');
        }

        console.log(`📧 Test user email: ${user.email}`);
        console.log(`🔒 Has password: ${!!user.password}`);
        console.log(`📱 User active: ${user.isActive}`);
        console.log(`✅ User approved: ${user.isApproved}`);

        // Test password comparison
        const testPassword = 'password123';
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log(`🔐 Password match: ${isMatch}`);

        if (isMatch) {
            console.log('\n✅ Login should work! Frontend issue might be API URL or CORS.');
        } else {
            console.log('\n❌ Password comparison failed. Database issue.');
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        mongoose.disconnect();
    }
}

debugLogin();
