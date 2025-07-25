const axios = require('axios');
require('dotenv').config();

async function testActualLogin() {
    try {
        console.log('🔑 Testing actual login endpoint...\n');

        const baseURL = process.env.NODE_ENV === 'production'
            ? 'https://techtrainers-backend.onrender.com'
            : 'http://localhost:5000';

        const loginData = {
            email: 'debug@test.com',
            password: 'test123'
        };

        console.log(`🌐 Testing login at: ${baseURL}/api/auth/login`);
        console.log(`📧 Email: ${loginData.email}`);
        console.log(`🔒 Password: ${loginData.password}`);

        // Test the actual login endpoint
        const response = await axios.post(`${baseURL}/api/auth/login`, loginData, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log('\n✅ LOGIN SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

        // Test protected endpoint with token
        if (response.data.data && response.data.data.token) {
            console.log('\n🔐 Testing protected endpoint...');
            const token = response.data.data.token;

            const meResponse = await axios.get(`${baseURL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Protected endpoint works!');
            console.log('User data:', JSON.stringify(meResponse.data, null, 2));
        }

        console.log('\n🎉 FULL AUTHENTICATION FLOW WORKING!');
        console.log('🚀 Your frontend should now work properly with these credentials.');

    } catch (error) {
        console.error('\n❌ LOGIN FAILED!');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.message);
            console.error('Check if your server is running on the correct port');
        } else {
            console.error('Error:', error.message);
        }

        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure your server is running: npm start');
        console.log('2. Check server logs for errors');
        console.log('3. Verify the API URL is correct');
        console.log('4. Test with curl: curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d \'{"email":"debug@test.com","password":"test123"}\'');
    }
}

testActualLogin();
