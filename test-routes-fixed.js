#!/usr/bin/env node

/**
 * Test script to verify that routes are working after the fix
 * Run with: node test-routes-fixed.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';

const tests = [
  { name: 'Health Check', path: '/api/health' },
  { name: 'Test Route', path: '/api/test' },
  { name: 'Workout Health', path: '/api/workouts/health' },
  { name: 'All Workouts', path: '/api/workouts' },
  { name: 'Workout Search', path: '/api/workouts/search' },
  { name: 'Workout Categories', path: '/api/workouts/categories' },
  { name: 'Public Templates', path: '/api/workouts/templates/public' },
  { name: 'User Profile (should be 401, not 404)', path: '/api/users/profile' },
];

async function testRoute(test) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${test.path}`;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const status = res.statusCode;
        const isSuccess = status !== 404; // Any status except 404 means route was found
        
        console.log(`${isSuccess ? '✅' : '❌'} ${test.name}: ${status} ${res.statusMessage}`);
        if (status === 404) {
          console.log(`   URL: ${url}`);
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
        
        resolve({ ...test, status, success: isSuccess });
      });
    }).on('error', (err) => {
      console.log(`❌ ${test.name}: Connection failed - ${err.message}`);
      resolve({ ...test, status: 'ERROR', success: false });
    });
  });
}

async function runTests() {
  console.log('🧪 Testing routes after the fix...\n');
  console.log('Note: We expect 200, 401, 400, or 500 responses - just NOT 404\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await testRoute(test);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between requests
  }
  
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`${successful}/${total} routes found (not returning 404)`);
  
  if (successful === total) {
    console.log('\n🎉 All routes are working! No more 404 errors.');
  } else {
    console.log('\n⚠️  Some routes are still returning 404. Check:');
    console.log('   1. Server is running on port 5000');
    console.log('   2. Route files exist and export properly');
    console.log('   3. Route mounting order in server.js');
  }
}

// Check if server is running first
http.get(`${BASE_URL}/api/health`, (res) => {
  if (res.statusCode === 200) {
    runTests();
  } else {
    console.log('❌ Server health check failed. Make sure server is running on port 5000');
  }
}).on('error', () => {
  console.log('❌ Cannot connect to server. Please start your server first:');
  console.log('   npm run dev');
  console.log('   or');
  console.log('   node server.js');
});
