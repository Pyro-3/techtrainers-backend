const axios = require('axios');

async function testWithLogging() {
    try {
        console.log('🧪 Testing production login with enhanced logging...\n');

        const baseURL = 'https://techtrainers-backend.onrender.com';

        // Test with our manually created user
        const testCredentials = {
            email: 'production-fixed@example.com',
            password: 'test123'
        };

        console.log('🎯 Testing with manually created credentials:');
        console.log('Email:', testCredentials.email);
        console.log('Password:', testCredentials.password);
        console.log('URL:', `${baseURL}/api/auth/login`);

        console.log('\n📡 Making login request...');

        const response = await axios.post(`${baseURL}/api/auth/login`, testCredentials, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'TechTrainer-Debug-Script'
            },
            timeout: 30000
        });

        console.log('\n✅ LOGIN SUCCESS!');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('\n❌ LOGIN FAILED!');

        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Response:', JSON.stringify(error.response.data, null, 2));

            if (error.response.status === 401) {
                console.log('\n🔍 401 Error Analysis:');
                console.log('This means the request reached the server');
                console.log('But authentication failed at some point');
                console.log('Check the server logs for detailed debugging info');
            }
        } else if (error.request) {
            console.log('No response received:', error.message);
        } else {
            console.log('Request error:', error.message);
        }

        console.log('\n📋 Next steps:');
        console.log('1. Check your production server logs for the detailed console.log output');
        console.log('2. Look for the "LOGIN ATTEMPT STARTED" section in logs');
        console.log('3. Follow the step-by-step debug output to see where it fails');
    }
}

testWithLogging();
