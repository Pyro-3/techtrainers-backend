import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from '../utils/roleRedirect';

const LoginPage: React.FC = () => {
  const { login, signup, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [error, setError] = useState('');
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Handle navigation after successful login
  useEffect(() => {
    if (isAuthenticated && user && justLoggedIn) {
      const redirectPath = getRoleBasedRedirect(user.role, user.isApproved);
      navigate(redirectPath);
      setJustLoggedIn(false);
    }
  }, [isAuthenticated, user, justLoggedIn, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        await login(email, password);
        setJustLoggedIn(true);
      } else {
        await signup({ name, email, password });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLoginMode ? 'Login to TechTrainer' : 'Sign Up for TechTrainer'}
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-stone-700">Name</label>
              <input
                type="text"
                className="w-full border border-stone-300 rounded px-3 py-2 mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700">Email</label>
            <input
              type="email"
              className="w-full border border-stone-300 rounded px-3 py-2 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700">Password</label>
            <input
              type="password"
              className="w-full border border-stone-300 rounded px-3 py-2 mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-stone-900 text-white py-2 px-4 rounded hover:bg-stone-700 transition"
          >
            {isLoginMode ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            className="text-amber-500 hover:underline"
            onClick={() => setIsLoginMode(!isLoginMode)}
          >
            {isLoginMode ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
