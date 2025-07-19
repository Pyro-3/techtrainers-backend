import API from './api';

export const registerUser = async (userData) => {
  console.log('=== AuthService Debug ===');
  console.log('registerUser called with:', userData);
  console.log('API instance being used:', API.defaults.baseURL);
  
  try {
    console.log('Making POST request to /auth/register');
    console.log('Full URL will be:', API.defaults.baseURL + '/auth/register');
    
    const response = await API.post('/auth/register', userData);
    
    console.log('Registration response:', response);
    console.log('Response data:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('=== Registration Error Details ===');
    console.error('Error object:', error);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response);
    console.error('Error config:', error.config);
    console.error('Request URL that failed:', error.config?.url);
    console.error('Base URL used:', error.config?.baseURL);
    
    throw error;
  }
};