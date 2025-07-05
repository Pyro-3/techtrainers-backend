import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:5000/api' 
    : 'https://your-production-api.com/api');

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      // You might want to redirect to login page here
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: { name: string; email: string; password: string; fitnessLevel?: string }) => 
    api.post('/auth/register', userData),
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  changePassword: (passwordData: { currentPassword: string; newPassword: string }) => 
    api.post('/auth/change-password', passwordData)
};

// User API
export const userAPI = {
  updateProfile: (profileData: { name?: string; fitnessLevel?: string; goals?: string[] }) => 
    api.put('/users/profile', profileData),
  getUser: (id: string) => api.get(`/users/${id}`)
};

// Workout API
export const workoutAPI = {
  getWorkouts: (params?: any) => api.get('/workouts', { params }),
  getWorkout: (id: string) => api.get(`/workouts/${id}`),
  createWorkout: (workoutData: any) => api.post('/workouts', workoutData),
  updateWorkout: (id: string, workoutData: any) => api.put(`/workouts/${id}`, workoutData),
  deleteWorkout: (id: string) => api.delete(`/workouts/${id}`),
  startWorkout: (id: string) => api.post(`/workouts/${id}/start`),
  completeWorkout: (id: string) => api.post(`/workouts/${id}/complete`),
  getStats: () => api.get('/workouts/stats/summary')
};

// Trainer API
export const trainerAPI = {
  getTrainers: () => api.get('/trainers'),
  getTrainer: (id: string) => api.get(`/trainers/${id}`),
  bookSession: (sessionData: any) => api.post('/trainers/book-session', sessionData),
  getSessions: () => api.get('/trainers/my-sessions')
};

// Chat API
export const chatAPI = {
  sendMessage: (messageData: any) => api.post('/chat/message', messageData),
  getMessages: (params?: any) => api.get('/chat/messages', { params })
};

export default api;
