import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  fitnessLevel?: string;
  createdAt?: string;
  profile?: {
    age?: number;
    height?: number;
    weight?: number;
    goals?: string[];
    experience?: string;
  };
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  fitnessLevel?: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          // Validate token by getting user profile
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          // Token is invalid or expired
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      }
      
      setLoading(false);
    };
    
    initializeAuth();
  }, []);
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Attempting login call to API');
      const response = await authAPI.login({ email, password });
      
      console.log('AuthContext: Login API response:', response.data);
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      
      // Update state
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      console.log('AuthContext: Authentication state updated, user logged in');
    } catch (err: any) {
      console.error('AuthContext: Login error:', err);
      console.error('AuthContext: Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        message: err.message
      });
      
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('AuthContext: Attempting signup call to API');
      const response = await authAPI.register(userData);
      
      console.log('AuthContext: Signup API response:', response.data);
      
      // Store token and user data
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      
      // Update state
      setUser(response.data.data.user);
      setIsAuthenticated(true);
      console.log('AuthContext: Authentication state updated, user registered');
    } catch (err: any) {
      console.error('AuthContext: Registration error:', err);
      console.error('AuthContext: Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers,
        message: err.message
      });
      
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
  };
  const clearError = () => setError(null);

  // Function to refresh user data from the server
  const refreshUserData = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.data.user);
      
      // Also update localStorage
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // If we can't get the user data, we might want to log them out
      if ((err as any).response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        signup,
        logout,
        clearError,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
