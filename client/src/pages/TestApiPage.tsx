import { useState } from 'react';
import { authAPI } from '../services/api';

const TestApiPage = () => {
  const [testResults, setTestResults] = useState<{ test: string; status: string; message: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Test registration with a random email
      try {
        const randomEmail = `test${Math.floor(Math.random() * 10000)}@example.com`;
        const registerResponse = await authAPI.register({
          name: 'Test User',
          email: randomEmail,
          password: 'password123',
          fitnessLevel: 'beginner'
        });
        
        setTestResults(prev => [...prev, {
          test: 'User Registration',
          status: 'SUCCESS',
          message: `Successfully registered user: ${registerResponse.data.data.user.name} (${registerResponse.data.data.user.email})`
        }]);
        
        // Store token for subsequent tests
        localStorage.setItem('testAuthToken', registerResponse.data.data.token);
        localStorage.setItem('testUserEmail', randomEmail);
        
      } catch (error: any) {
        setTestResults(prev => [...prev, {
          test: 'User Registration',
          status: 'FAILED',
          message: error.response?.data?.message || error.message
        }]);
      }
      
      // Test 2: Test login with the created user
      try {
        const testEmail = localStorage.getItem('testUserEmail');
        if (testEmail) {
          const loginResponse = await authAPI.login({
            email: testEmail, 
            password: 'password123'
          });
          
          setTestResults(prev => [...prev, {
            test: 'User Login',
            status: 'SUCCESS',
            message: `Successfully logged in: ${loginResponse.data.data.user.name}`
          }]);
        } else {
          throw new Error('No test user email available');
        }
      } catch (error: any) {
        setTestResults(prev => [...prev, {
          test: 'User Login',
          status: 'FAILED',
          message: error.response?.data?.message || error.message
        }]);
      }
      
    } catch (error: any) {
      console.error('Test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      <div className="mb-8">
        <button 
          onClick={runTests}
          disabled={isLoading}
          className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 disabled:bg-amber-400"
        >
          {isLoading ? 'Running Tests...' : 'Run API Tests'}
        </button>
      </div>
      
      {testResults.length > 0 && (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <div className="bg-stone-100 px-6 py-4 border-b border-stone-200 font-semibold">
            Test Results
          </div>
          <div className="divide-y divide-stone-200">
            {testResults.map((result, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{result.test}</span>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    result.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-stone-600 text-sm">{result.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-stone-50 rounded-lg border border-stone-200">
        <h2 className="text-xl font-semibold mb-4">API Endpoints</h2>
        <ul className="space-y-3 text-sm">
          <li><code className="bg-stone-100 px-2 py-1 rounded">/api/auth/register</code> - Register a new user</li>
          <li><code className="bg-stone-100 px-2 py-1 rounded">/api/auth/login</code> - Login a user</li>
          <li><code className="bg-stone-100 px-2 py-1 rounded">/api/auth/me</code> - Get user profile</li>
        </ul>
      </div>
    </div>
  );
};

export default TestApiPage;
