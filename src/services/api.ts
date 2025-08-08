import axios from 'axios';

// API configuration - fix environment variable access for Vite
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://techtrainers-backend.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const logout = async () => {
    const response = await api.post('/auth/logout');
    return response.data;
};

// Subscription API functions
export const getSubscriptionPlans = async (province = 'ON') => {
    const response = await api.get(`/payments/plans?province=${province}`);
    return response.data;
};

// Trainer API functions
export const getTrainers = async () => {
    const response = await api.get('/trainers');
    return response.data;
};

// User API functions
export const getUserProfile = async () => {
    const response = await api.get('/users/profile');
    return response.data;
};

export const updateUserProfile = async (profileData: any) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
};

export const uploadProfilePicture = async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/users/profile/picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProfilePicture = async () => {
    const response = await api.delete('/users/profile/picture');
    return response.data;
};

export const getUserStats = async () => {
    const response = await api.get('/users/stats');
    return response.data;
};

export const updateUserPreferences = async (preferences: any) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
};

// Workout API functions
export const workoutAPI = {
    getWorkouts: async (params: any) => {
        const response = await api.get('/workouts', { params });
        return response.data;
    },
    getWorkout: async (id: string) => {
        const response = await api.get(`/workouts/${id}`);
        return response.data;
    },
    createWorkout: async (workoutData: any) => {
        const response = await api.post('/workouts', workoutData);
        return response.data;
    },
    updateWorkout: async (id: string, workoutData: any) => {
        const response = await api.put(`/workouts/${id}`, workoutData);
        return response.data;
    },
    startWorkout: async (id: string) => {
        const response = await api.post(`/workouts/${id}/start`);
        return response.data;
    },
    completeWorkout: async (id: string) => {
        const response = await api.post(`/workouts/${id}/complete`);
        return response.data;
    },
    deleteWorkout: async (id: string) => {
        const response = await api.delete(`/workouts/${id}`);
        return response.data;
    }
};

// Auth API object for compatibility
export const authAPI = {
    login,
    register,
    getCurrentUser,
    logout
};

// User API object for compatibility  
export const userAPI = {
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    getUserStats,
    updateUserPreferences,
    updateAvatar: uploadProfilePicture,
    updateProfile: updateUserProfile
};

export default api;
