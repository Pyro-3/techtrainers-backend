const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./src/models/User');

async function fixUserDebug() {
    try {
        console.log('🔧 COMPREHENSIVE USER MODEL FIX\n');

        const testEmail = 'debug@test.com';
        const testPassword = 'test123';

        // Step 1: Completely remove existing user
        console.log('🗑️ Step 1: Removing existing test user...');
        const deleteResult = await User.deleteOne({ email: testEmail });
        console.log(`   Deleted ${deleteResult.deletedCount} user(s)`);

        // Step 2: Create fresh user with manual password hashing
        console.log('\n👤 Step 2: Creating fresh test user...');

        // Hash password manually to avoid pre-save conflicts
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(testPassword, salt);
        console.log(`   Generated salt: ${salt.substring(0, 10)}...`);
        console.log(`   Hashed password: ${hashedPassword.substring(0, 20)}...`);

        // Create user object
        const userData = {
            name: 'Debug User',
            email: testEmail,
            password: hashedPassword, // Already hashed
            fitnessLevel: 'beginner',
            role: 'member',
            isActive: true,
            isApproved: true,
            emailVerified: false,
            phoneVerified: false,
            profileCompleted: false
        };

        // Insert directly to avoid pre-save middleware
        const insertResult = await User.collection.insertOne(userData);
        console.log(`   User inserted with ID: ${insertResult.insertedId}`);

        // Step 3: Verify user was created correctly
        console.log('\n🔍 Step 3: Verifying user creation...');
        const createdUser = await User.findById(insertResult.insertedId).select('+password');
        console.log(`   User found: ${!!createdUser}`);
        console.log(`   Email: ${createdUser.email}`);
        console.log(`   Has password: ${!!createdUser.password}`);
        console.log(`   Password length: ${createdUser.password.length}`);
        console.log(`   Password starts with $2: ${createdUser.password.startsWith('$2')}`);
        console.log(`   Is active: ${createdUser.isActive}`);
        console.log(`   Is approved: ${createdUser.isApproved}`);
        console.log(`   Role: ${createdUser.role}`);

        // Step 4: Test password verification
        console.log('\n🔐 Step 4: Testing password verification...');

        // Test 1: Direct bcrypt comparison
        const directMatch = await bcrypt.compare(testPassword, createdUser.password);
        console.log(`   Direct bcrypt.compare: ${directMatch}`);

        // Test 2: User model method
        const modelMethod = await createdUser.comparePassword(testPassword);
        console.log(`   User.comparePassword method: ${modelMethod}`);

        // Test 3: Alternative method
        const altMethod = await createdUser.correctPassword(testPassword, createdUser.password);
        console.log(`   User.correctPassword method: ${altMethod}`);

        // Step 5: Test login simulation
        console.log('\n🔑 Step 5: Full login simulation...');
        const loginUser = await User.findOne({ email: testEmail }).select('+password');

        if (loginUser) {
            const loginResult = {
                userFound: true,
                hasPassword: !!loginUser.password,
                passwordValid: await bcrypt.compare(testPassword, loginUser.password),
                isActive: loginUser.isActive,
                isApproved: loginUser.isApproved,
                role: loginUser.role
            };

            console.log('   Login simulation result:', loginResult);

            if (loginResult.userFound && loginResult.passwordValid && loginResult.isActive) {
                console.log('\n✅ SUCCESS! Login should work perfectly now!');
                console.log('\n🚀 Test credentials:');
                console.log(`   Email: ${testEmail}`);
                console.log(`   Password: ${testPassword}`);
                console.log('\n🎯 Next steps:');
                console.log('   1. Run: node debug-backend.js');
                console.log('   2. Test frontend login');
                console.log('   3. Check backend logs for authentication');
            } else {
                console.log('\n❌ Still having issues. Debug info:');
                Object.entries(loginResult).forEach(([key, value]) => {
                    console.log(`   ${key}: ${value}`);
                });
            }
        }

    } catch (error) {
        console.error('\n❌ Fix error:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        mongoose.disconnect();
    }
}

fixUserDebug();
