const axios = require('axios');

async function testFrontendAPI() {
    try {
        console.log('🎯 Testing Frontend API Configuration...\n');

        // Test the exact endpoint your frontend is using
        const frontendAPIURL = 'https://techtrainers-backend.onrender.com/api';

        console.log(`🌐 Frontend API Base URL: ${frontendAPIURL}`);

        // Test login with exact frontend credentials
        const testLogin = {
            email: 'debug@test.com',
            password: 'test123'
        };

        console.log('🔑 Testing login with debug credentials...');
        console.log(`📧 Email: ${testLogin.email}`);
        console.log(`🔒 Password: ${testLogin.password}`);

        const loginResponse = await axios.post(`${frontendAPIURL}/auth/login`, testLogin, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        console.log('\n✅ FRONTEND LOGIN WORKING!');
        console.log('Status:', loginResponse.status);
        console.log('Success response:', JSON.stringify(loginResponse.data, null, 2));

        console.log('\n🎉 Your frontend should now work!');
        console.log('Try logging in with:');
        console.log(`Email: ${testLogin.email}`);
        console.log(`Password: ${testLogin.password}`);

    } catch (error) {
        console.error('\n❌ FRONTEND API TEST FAILED!');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error response:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 500) {
                console.log('\n🔧 500 Error - Backend issue detected!');
                console.log('Check your backend logs for the specific error.');
            }
        } else {
            console.error('Network error:', error.message);
        }

        console.log('\n📋 Debug checklist:');
        console.log('1. ✅ User model working');
        console.log('2. ✅ Password verification working');
        console.log('3. ❓ API endpoint working?');
        console.log('4. ❓ Server deployed properly?');
    }
}

testFrontendAPI();
