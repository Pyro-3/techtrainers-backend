// App.tsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import LandingPage from './src/pages/LandingPage';
import SelectTierPage from './src/pages/SelectTierPage';
import BeginnerPage from './src/pages/BeginnerPage';
import IntermediatePage from './src/pages/IntermediatePage';
import AdvancedPage from './src/pages/AdvancedPage';
import AboutPage from './src/pages/AboutPage';
import SupportPage from './src/pages/SupportPage';
import TestApiPage from './src/pages/TestApiPage';
import LoginPage from './src/pages/LoginPage';

import DashboardPage from './src/pages/DashboardPage';
import FitnessPage from './src/pages/FitnessPage';
import ProfilePage from './src/pages/ProfilePage';

import WorkoutCreator from './src/components/workout/WorkoutCreator';

import TrainerDashboardPage from './src/pages/TrainerDashboardPage';
import TrainerClientDashboard from './src/pages/TrainerClientDashboard';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute = ({
  children,
  requiredRole
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/select-tier" element={<SelectTierPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/workout-generator" element={<WorkoutCreator />} />
      <Route path="/api-test" element={<TestApiPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Member‑only */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <FitnessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fitness"
        element={
          <ProtectedRoute>
            <FitnessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/beginner"
        element={
          <ProtectedRoute>
            <BeginnerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intermediate"
        element={
          <ProtectedRoute>
            <IntermediatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advanced"
        element={
          <ProtectedRoute>
            <AdvancedPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Trainer‑only */}
      <Route
        path="/trainer-dashboard"
        element={
          <ProtectedRoute requiredRole="trainer">
            <TrainerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trainer/clients/:clientId"
        element={
          <ProtectedRoute requiredRole="trainer">
            <TrainerClientDashboard />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={
          <div className="text-center pt-32 text-red-600 text-2xl font-bold">
            Unauthorized: You do not have permission to view this page.
          </div>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}
