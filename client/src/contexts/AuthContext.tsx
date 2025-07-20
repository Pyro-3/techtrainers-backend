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

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'member' | 'trainer' | 'admin';
  fitnessLevel?: string;
  createdAt?: string;
  isApproved?: boolean;
  profileCompleted?: boolean;
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
  role?: 'member' | 'trainer';
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

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
          setIsAuthenticated(true);
        } catch (err) {
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
      const response = await authAPI.login({ email, password });
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
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
      const response = await authAPI.register(userData);
      localStorage.setItem('authToken', response.data.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
      setUser(response.data.data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  const clearError = () => setError(null);

  const refreshUserData = async () => {
    setLoading(true);
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.data.user);
      localStorage.setItem('userData', JSON.stringify(response.data.data.user));
    } catch (err) {
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
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
