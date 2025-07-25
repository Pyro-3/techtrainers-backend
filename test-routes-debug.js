const axios = require('axios');

async function testRoutesDebug() {
  try {
    console.log('🔍 Testing route configuration...\n');
    
    const baseURL = 'https://techtrainers-backend.onrender.com';
    
    // Test 1: Health endpoint
    console.log('1️⃣ Testing health endpoint...');
    try {
      const healthResponse = await axios.get(`${baseURL}/api/health`);
      console.log('✅ Health endpoint works');
      console.log('Response:', healthResponse.data);
    } catch (healthError) {
      console.log('❌ Health endpoint fails');
      if (healthError.response) {
        console.log('Status:', healthError.response.status);
        console.log('Error:', healthError.response.data);
      }
    }
    
    // Test 2: Check if auth routes exist
    console.log('\n2️⃣ Testing auth route availability...');
    try {
      // This should return a 400 or 401, not 404
      const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {});
      console.log('✅ Login route exists (got response)');
    } catch (loginError) {
      if (loginError.response) {
        if (loginError.response.status === 404) {
          console.log('❌ Login route NOT FOUND (404)');
          console.log('This means routes are not properly mounted');
        } else {
          console.log('✅ Login route exists (got non-404 error)');
          console.log('Status:', loginError.response.status);
          console.log('This is expected for empty request body');
        }
      } else {
        console.log('❌ Network error:', loginError.message);
      }
    }
    
    // Test 3: Try to register (should work)
    console.log('\n3️⃣ Testing registration route...');
    try {
      const registerResponse = await axios.post(`${baseURL}/api/auth/register`, {
        name: 'Route Test User',
        email: `route-test-${Date.now()}@example.com`,
        password: 'test123456',
        fitnessLevel: 'beginner'
      });
      console.log('✅ Registration route works');
      console.log('User created:', registerResponse.data.data.user.email);
    } catch (registerError) {
      if (registerError.response) {
        if (registerError.response.status === 404) {
          console.log('❌ Registration route NOT FOUND (404)');
        } else {
          console.log('Registration route exists but failed');
          console.log('Status:', registerError.response.status);
          console.log('Error:', registerError.response.data);
        }
      }
    }
    
    console.log('\n📋 Diagnosis:');
    console.log('If you see 404 errors above, the routes are not mounted properly');
    console.log('If you see 400/401/500 errors, the routes exist but have other issues');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testRoutesDebug();
