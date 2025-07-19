import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupClick: () => void;
}

const LoginModal = ({ isOpen, onClose, onSignupClick }: LoginModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Use our auth context instead of local state
  const { login, loading: isLoading, error: authError, clearError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Sync the error from AuthContext to local state
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  // Clear errors when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      clearError();
    }
  }, [isOpen, clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
      try {
      console.log('Attempting login with:', { email: formData.email });
      // Use the login method from AuthContext
      await login(formData.email, formData.password);
      
      console.log('Login successful');
      // Reset form
      setFormData({
        email: '',
        password: ''
      });
      
      // Close modal - no need to refresh, AuthContext handles the state
      onClose();
      
    } catch (err: any) {
      // Error is handled by AuthContext and synced via useEffect
      console.error('Login error:', err);
      console.error('Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900">Log In to TechTrainer</h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors duration-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-stone-700 font-semibold mb-3">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-stone-50 text-stone-900 p-4 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-stone-700 font-semibold mb-3">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-stone-50 text-stone-900 p-4 rounded-lg border border-stone-200 focus:border-amber-500 focus:outline-none transition-colors duration-300"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className={`flex-1 ${isLoading ? 'bg-amber-500' : 'bg-amber-700 hover:bg-amber-800'} text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex justify-center items-center`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-4 px-6 rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-stone-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => {
                  onClose();
                  onSignupClick();
                }}
                className="text-amber-700 hover:text-amber-800 font-medium"
              >
                Sign up now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
