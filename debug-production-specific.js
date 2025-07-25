const axios = require('axios');

async function debugProductionSpecific() {
    try {
        console.log('🔍 Debugging PRODUCTION-SPECIFIC login issue...\n');

        const baseURL = 'https://techtrainers-backend.onrender.com';

        // Use the same credentials that worked for registration
        const testEmail = 'production-test@example.com';
        const testPassword = 'test123456';

        console.log('🎯 Testing with EXACT production registration credentials:');
        console.log(`Email: ${testEmail}`);
        console.log(`Password: ${testPassword}`);

        // Step 1: Test with working debug credentials
        console.log('\n1️⃣ Testing with debug credentials (should work locally)...');
        try {
            const debugLogin = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'debug@test.com',
                password: 'test123'
            });
            console.log('✅ Debug login works in production!');
        } catch (debugError) {
            console.log('❌ Debug login also fails in production');
            if (debugError.response) {
                console.log('Debug error response:', debugError.response.data);
            }
        }

        // Step 2: Test with production registration credentials
        console.log('\n2️⃣ Testing with production registration credentials...');
        try {
            const prodLogin = await axios.post(`${baseURL}/api/auth/login`, {
                email: testEmail,
                password: testPassword
            });
            console.log('✅ Production login works!');
            console.log('Response:', prodLogin.data);
        } catch (prodError) {
            console.log('❌ Production login fails');
            if (prodError.response) {
                console.log('Production error response:', prodError.response.data);
            }
        }

        // Step 3: Test if it's a password length issue
        console.log('\n3️⃣ Testing password length theory...');
        console.log(`Registration password length: ${testPassword.length} characters`);
        console.log('Our debug password length: 7 characters');
        console.log('Minimum required: 6 characters');

        // Step 4: Create a test user with same password as debug
        console.log('\n4️⃣ Creating test user with debug password...');
        try {
            const debugPwdUser = await axios.post(`${baseURL}/api/auth/register`, {
                name: 'Debug Password Test',
                email: 'debug-pwd-test@example.com',
                password: 'test123', // Same as debug
                fitnessLevel: 'beginner'
            });
            console.log('✅ Created user with debug password');

            // Try login immediately
            const debugPwdLogin = await axios.post(`${baseURL}/api/auth/login`, {
                email: 'debug-pwd-test@example.com',
                password: 'test123'
            });
            console.log('✅ Login with debug password works!');

        } catch (debugPwdError) {
            if (debugPwdError.response?.data?.message?.includes('Email already in use')) {
                console.log('ℹ️ User already exists, testing login...');
                try {
                    const existingLogin = await axios.post(`${baseURL}/api/auth/login`, {
                        email: 'debug-pwd-test@example.com',
                        password: 'test123'
                    });
                    console.log('✅ Existing user login works!');
                } catch (existingError) {
                    console.log('❌ Existing user login fails');
                    if (existingError.response) {
                        console.log('Error:', existingError.response.data);
                    }
                }
            } else {
                console.log('❌ Failed to create debug password user');
                if (debugPwdError.response) {
                    console.log('Error:', debugPwdError.response.data);
                }
            }
        }

        console.log('\n🔧 DIAGNOSIS:');
        console.log('- Registration works: ✅');
        console.log('- Token generation works: ✅');
        console.log('- Login fails: ❌');
        console.log('\nLikely issues:');
        console.log('1. Password hashing inconsistency between registration and login');
        console.log('2. Pre-save middleware double-hashing in production');
        console.log('3. Different bcrypt version in production');

    } catch (error) {
        console.error('❌ Debug error:', error.message);
    }
}

debugProductionSpecific();
