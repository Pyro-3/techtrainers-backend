const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./src/models/User');

async function fixDebugBackend() {
    try {
        console.log('🔧 Fixing backend authentication issues...\n');

        const testEmail = 'debug@test.com';
        const testPassword = 'test123';

        // Delete existing test user to start fresh
        console.log('🗑️ Removing existing test user...');
        await User.deleteOne({ email: testEmail });

        // Create new user WITHOUT triggering pre-save hook
        console.log('👤 Creating fresh test user...');
        const hashedPassword = await bcrypt.hash(testPassword, 12);

        const user = new User({
            name: 'Debug User',
            email: testEmail,
            password: hashedPassword, // Already hashed
            fitnessLevel: 'beginner',
            role: 'member'
        });

        // Save without triggering password hashing
        await user.save();
        console.log('✅ Fresh test user created');

        // Verify the user was created properly
        console.log('\n🔍 Verifying user creation...');
        const savedUser = await User.findOne({ email: testEmail }).select('+password');
        console.log('User found:', !!savedUser);
        console.log('Has password:', !!savedUser.password);
        console.log('Password length:', savedUser.password.length);
        console.log('Password starts with $2:', savedUser.password.startsWith('$2'));

        // Test password verification
        console.log('\n🔐 Testing password verification...');
        const isMatch = await bcrypt.compare(testPassword, savedUser.password);
        console.log('Password matches:', isMatch);

        // Test with the User model method
        const isMatchMethod = await savedUser.comparePassword(testPassword);
        console.log('Password matches (model method):', isMatchMethod);

        if (isMatch && isMatchMethod) {
            console.log('\n✅ SUCCESS! Backend authentication is now working correctly.');
            console.log('You can now test with:');
            console.log(`Email: ${testEmail}`);
            console.log(`Password: ${testPassword}`);
        } else {
            console.log('\n❌ Still having issues. Let\'s debug further...');
            console.log('Saved password hash:', savedUser.password.substring(0, 20) + '...');

            // Try manual hash comparison
            const manualHash = await bcrypt.hash(testPassword, 12);
            console.log('Manual hash:', manualHash.substring(0, 20) + '...');
            const manualMatch = await bcrypt.compare(testPassword, manualHash);
            console.log('Manual hash works:', manualMatch);
        }

    } catch (error) {
        console.error('❌ Fix error:', error);
    } finally {
        mongoose.disconnect();
    }
}

fixDebugBackend();
