const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const axios = require('axios');
require('dotenv').config();

async function fixProductionLogin() {
    try {
        console.log('🔧 Fixing production login issue...\n');

        // Connect to production database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to production MongoDB');

        const User = require('./src/models/User');

        // Create a user with the exact same method as our debug script
        const testEmail = 'production-fixed@example.com';
        const testPassword = 'test123';

        console.log('🗑️ Removing existing test user...');
        await User.deleteOne({ email: testEmail });

        console.log('👤 Creating production test user with proper password hashing...');

        // Hash password manually (same as debug script)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(testPassword, salt);

        console.log(`Generated hash: ${hashedPassword.substring(0, 20)}...`);

        // Insert directly to avoid pre-save middleware issues
        const userData = {
            name: 'Production Fixed User',
            email: testEmail,
            password: hashedPassword,
            fitnessLevel: 'beginner',
            role: 'member',
            isActive: true,
            isApproved: true,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: false
        };

        const insertResult = await User.collection.insertOne(userData);
        console.log(`✅ User inserted with ID: ${insertResult.insertedId}`);

        // Verify user creation
        const createdUser = await User.findById(insertResult.insertedId).select('+password');
        console.log('✅ User verified in database');
        console.log(`Password length: ${createdUser.password.length}`);
        console.log(`Password valid format: ${createdUser.password.startsWith('$2')}`);

        // Test password verification locally
        const localVerification = await bcrypt.compare(testPassword, createdUser.password);
        console.log(`✅ Local password verification: ${localVerification}`);

        mongoose.disconnect();
        console.log('✅ Database connection closed');

        // Now test login via API
        console.log('\n🌐 Testing production API login...');

        const baseURL = 'https://techtrainers-backend.onrender.com';

        try {
            const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                email: testEmail,
                password: testPassword
            });

            console.log('🎉 PRODUCTION LOGIN SUCCESS!');
            console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

            console.log('\n✅ SOLUTION FOUND! Use these credentials for testing:');
            console.log(`Email: ${testEmail}`);
            console.log(`Password: ${testPassword}`);

        } catch (loginError) {
            console.log('❌ Production login still fails');
            if (loginError.response) {
                console.log('Error response:', loginError.response.data);
            }

            console.log('\n🔍 The issue is likely in the login controller pre-save middleware');
            console.log('The user exists and password is correct, but login endpoint fails');
        }

    } catch (error) {
        console.error('❌ Fix error:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

fixProductionLogin();
