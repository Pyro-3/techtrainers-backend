const axios = require('axios');

async function testProductionLogin() {
    try {
        console.log('🌐 Testing PRODUCTION login endpoint...\n');

        const baseURL = 'https://techtrainers-backend.onrender.com';

        // First test health endpoint
        console.log('🏥 Testing health endpoint...');
        const healthResponse = await axios.get(`${baseURL}/api/health`);
        console.log('Health check:', healthResponse.data);

        // Test registration first to create a user
        console.log('\n👤 Testing registration...');
        const registerData = {
            name: 'Test User Production',
            email: 'production-test@example.com',
            password: 'test123456',
            fitnessLevel: 'beginner'
        };

        try {
            const registerResponse = await axios.post(`${baseURL}/api/auth/register`, registerData);
            console.log('✅ Registration successful:', registerResponse.data);
        } catch (regError) {
            if (regError.response?.status === 400 && regError.response?.data?.message?.includes('Email already in use')) {
                console.log('ℹ️ User already exists, proceeding to login...');
            } else {
                throw regError;
            }
        }

        // Test login
        console.log('\n🔑 Testing login...');
        const loginData = {
            email: 'production-test@example.com',
            password: 'test123456'
        };

        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, loginData);
        console.log('✅ LOGIN SUCCESS!');
        console.log('Response:', JSON.stringify(loginResponse.data, null, 2));

        // Test protected endpoint
        if (loginResponse.data.data?.token) {
            console.log('\n🔐 Testing protected endpoint...');
            const token = loginResponse.data.data.token;

            const meResponse = await axios.get(`${baseURL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('✅ Protected endpoint works!');
            console.log('User data:', JSON.stringify(meResponse.data, null, 2));
        }

        console.log('\n🎉 PRODUCTION AUTHENTICATION FULLY WORKING!');
        console.log('🚀 Your frontend can now use these endpoints:');
        console.log(`   Login: ${baseURL}/api/auth/login`);
        console.log(`   Register: ${baseURL}/api/auth/register`);
        console.log(`   Profile: ${baseURL}/api/auth/me`);

    } catch (error) {
        console.error('\n❌ PRODUCTION TEST FAILED!');

        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testProductionLogin();
