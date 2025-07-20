// src/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Admin
import AdminDashboard       from './components/admin/AdminDashboard';
import UserManagement       from './components/admin/UserManagement';
import SupportTicketManager from './components/admin/SupportTicketManager';

// Pages
import LandingPage           from './pages/LandingPage';
import AboutPage             from './pages/AboutPage';
import BeginnerPage          from './pages/BeginnerPage';
import IntermediatePage      from './pages/IntermediatePage';
import AdvancedPage          from './pages/AdvancedPage';
import FitnessPage           from './pages/FitnessPage';
import DashboardPage         from './pages/DashboardPage';
import ProfilePage           from './pages/ProfilePage';
import SupportPage           from './pages/SupportPage';

// Auth & Workouts
import LoginPage             from './pages/LoginPage';
import WorkoutCreator        from './components/workout/WorkoutCreator';

// Layout & Guards
import ProtectedRoute        from './components/ProtectedRoute';

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Pages */}
    <Route path="/"             element={<LandingPage />} />
    <Route path="/about"        element={<AboutPage />} />
    <Route path="/beginner"     element={<BeginnerPage />} />
    <Route path="/intermediate" element={<IntermediatePage />} />
    <Route path="/advanced"     element={<AdvancedPage />} />
    <Route path="/fitness"      element={<FitnessPage />} />
    <Route path="/support"      element={<SupportPage />} />
    <Route path="/login"        element={<LoginPage />} />

    {/* Workout Generator */}
    <Route path="/workout-generator" element={<WorkoutCreator />} />

    {/* Member Dashboard (protected) */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
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

    {/* Trainer Dashboard */}
    <Route
      path="/trainer-dashboard"
      element={
        <ProtectedRoute requiredRole="trainer">
          <AdminDashboard /* or your TrainerDashboardPage */ />
        </ProtectedRoute>
      }
    />

    {/* Admin Dashboard + Features */}
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <ProtectedRoute requiredRole="admin">
          <UserManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/tickets"
      element={
        <ProtectedRoute requiredRole="admin">
          <SupportTicketManager />
        </ProtectedRoute>
      }
    />

    {/* Catch-all -> Home */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
