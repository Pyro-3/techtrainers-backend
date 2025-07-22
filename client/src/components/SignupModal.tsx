import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleRedirect';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupModal = ({ isOpen, onClose }: SignupModalProps) => {
  const [formData, setFormData] = useState<{
    role: 'trainer' | 'member' | undefined;
    name: string;
    email: string;
    password: string;
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  }>({
    role: undefined,
    name: '',
    email: '',
    password: '',
    fitnessLevel: 'beginner',
  });

  const { signup, loading: isLoading, error: authError, clearError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      clearError();
      setSuccess(null);
      setFormData({
        role: undefined,
        name: '',
        email: '',
        password: '',
        fitnessLevel: 'beginner',
      });
    }
  }, [isOpen, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        fitnessLevel: formData.role === 'member' ? formData.fitnessLevel : undefined,
      };

      await signup(payload);
      
      // Show success message based on role
      if (formData.role === 'trainer') {
        setSuccess('Trainer registration successful! Your application is now under review. Redirecting...');
      } else {
        setSuccess('Registration successful! Welcome to TechTrainer!');
      }

      // Role-based redirect after a short delay
      setTimeout(() => {
        onClose();
        // Get the user data from AuthContext to check approval status
        const redirectPath = getRoleBasedRedirect(
          formData.role || 'member', 
          formData.role === 'member' ? true : false // Trainers start as not approved
        );
        window.location.href = redirectPath;
      }, 2000);
    } catch (err) {
      console.error('Signup failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'role' ? (value === '' ? undefined : value as 'member' | 'trainer') : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-stone-900">Join TechTrainer</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-stone-700 font-semibold mb-3">
              I am a:
            </label>
            <select
              id="role"
              name="role"
              value={formData.role || ''}
              onChange={handleChange}
              required
              className="w-full bg-stone-50 p-4 rounded-lg border"
            >
              <option value="">Select Role</option>
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>

          {formData.role && (
            <>
              <div>
                <label htmlFor="name" className="block text-stone-700 font-semibold mb-3">
                  Full Name:
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-stone-50 p-4 rounded-lg border"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>

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
                  className="w-full bg-stone-50 p-4 rounded-lg border"
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
                  className="w-full bg-stone-50 p-4 rounded-lg border"
                  placeholder="Create a secure password"
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              {formData.role === 'member' && (
                <div>
                  <label htmlFor="fitnessLevel" className="block text-stone-700 font-semibold mb-3">
                    Your Fitness Level:
                  </label>
                  <select
                    id="fitnessLevel"
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleChange}
                    className="w-full bg-stone-50 p-4 rounded-lg border"
                    disabled={isLoading}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className={`flex-1 ${isLoading ? 'bg-amber-500' : 'bg-amber-700 hover:bg-amber-800'} text-white font-semibold py-4 px-6 rounded-lg`}
              disabled={isLoading || !formData.role}
            >
              {isLoading ? 'Processing...' : 'Start Training'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-4 px-6 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
