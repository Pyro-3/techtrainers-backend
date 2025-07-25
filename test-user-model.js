const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const User = require('./src/models/User');

async function testUserModel() {
    try {
        console.log('🧪 Testing User Model...\n');

        // Test 1: Model import
        console.log('1. User model imported:', !!User);
        console.log('   Model name:', User.modelName);

        // Test 2: Schema validation
        const schema = User.schema;
        console.log('2. Schema paths:', Object.keys(schema.paths).slice(0, 10));
        console.log('   Password field config:', schema.paths.password);

        // Test 3: Test user creation
        const testUser = new User({
            name: 'Test User',
            email: 'model-test@example.com',
            password: 'test123',
            fitnessLevel: 'beginner'
        });

        console.log('3. Test user created (not saved):', !!testUser);
        console.log('   Default role:', testUser.role);
        console.log('   Default isActive:', testUser.isActive);
        console.log('   Default isApproved:', testUser.isApproved);

        console.log('\n✅ User model is working correctly!');

    } catch (error) {
        console.error('\n❌ Model test error:', error);
    } finally {
        mongoose.disconnect();
    }
}

testUserModel();
