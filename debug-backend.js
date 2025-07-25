const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./src/models/User');

async function debugBackend() {
    try {
        console.log('🔍 Debugging backend issues...\n');

        // Test user creation
        const testEmail = 'debug@test.com';
        let user = await User.findOne({ email: testEmail });

        if (!user) {
            console.log('👤 Creating debug user...');
            const hashedPassword = await bcrypt.hash('test123', 12);
            user = new User({
                name: 'Debug User',
                email: testEmail,
                password: hashedPassword,
                fitnessLevel: 'beginner',
                role: 'member'
            });
            await user.save();
            console.log('✅ Debug user created');
        }

        // Test password verification
        console.log('\n🔐 Testing password verification...');
        const userWithPassword = await User.findOne({ email: testEmail }).select('+password');
        console.log('Has password field:', !!userWithPassword.password);

        const isMatch = await bcrypt.compare('test123', userWithPassword.password);
        console.log('Password matches:', isMatch);

        // Test direct login simulation
        console.log('\n🔑 Simulating login process...');
        const loginResult = {
            userFound: !!userWithPassword,
            passwordValid: isMatch,
            isActive: userWithPassword.isActive,
            isApproved: userWithPassword.isApproved
        };

        console.log('Login simulation result:', loginResult);

        if (loginResult.userFound && loginResult.passwordValid && loginResult.isActive) {
            console.log('\n✅ Backend should work! Issue might be in routes or middleware.');
        } else {
            console.log('\n❌ Backend has issues. Check database and user creation.');
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        mongoose.disconnect();
    }
}

debugBackend();
