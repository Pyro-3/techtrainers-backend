import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../services/api';

interface User {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: string;
    fitnessLevel: string;
    isApproved: boolean;
    isActive: boolean;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
    | { type: 'AUTH_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    loading: false,
    error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                loading: true,
                error: null,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                loading: false,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                loading: false,
                user: null,
                token: null,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
            };
        default:
            return state;
    }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const login = async (email: string, password: string) => {
        try {
            console.log('AuthContext: Starting login');

            dispatch({ type: 'AUTH_START' });

            const response = await apiLogin(email, password);
            const { user, token } = response.data;

            localStorage.setItem('token', token);

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, token }
            });

        } catch (error: any) {
            localStorage.removeItem('token');
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    const register = async (userData: any) => {
        try {
            dispatch({ type: 'AUTH_START' });

            const response = await apiRegister(userData);
            const { user, token } = response.data;

            // Store token in localStorage
            localStorage.setItem('token', token);

            dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user, token }
            });
        } catch (error: any) {
            // Remove token on error
            localStorage.removeItem('token');

            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    const clearError = () => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !state.user) {
            // Verify token and get user data
            getCurrentUser()
                .then(response => {
                    dispatch({
                        type: 'AUTH_SUCCESS',
                        payload: { user: response.data, token }
                    });
                })
                .catch(() => {
                    localStorage.removeItem('token');
                    dispatch({ type: 'LOGOUT' });
                });
        }
    }, []);

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
    };

return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
);
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
