const mongoose = require('mongoose');
require('dotenv').config();

async function checkProductionUsers() {
    try {
        console.log('🔍 Checking production users...\n');

        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to production MongoDB');

        const User = require('./src/models/User');

        // Get all users
        const allUsers = await User.find({}).select('name email role isActive isApproved createdAt');
        console.log(`📊 Total users in production: ${allUsers.length}\n`);

        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} (${user.email})`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   Approved: ${user.isApproved}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        // Check specific test users
        const testEmails = [
            'debug@test.com',
            'production-test@example.com',
            'production-fixed@example.com',
            'debug-pwd-test@example.com'
        ];

        console.log('🎯 Checking specific test users...\n');

        for (const email of testEmails) {
            const user = await User.findOne({ email }).select('+password');
            if (user) {
                console.log(`✅ ${email}:`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Has password: ${!!user.password}`);
                console.log(`   Password length: ${user.password?.length}`);
                console.log(`   Password format: ${user.password?.startsWith('$2') ? 'Valid bcrypt' : 'Invalid'}`);
                console.log(`   Active: ${user.isActive}`);
                console.log(`   Approved: ${user.isApproved}`);
            } else {
                console.log(`❌ ${email}: Not found`);
            }
            console.log('');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.disconnect();
    }
}

checkProductionUsers();
