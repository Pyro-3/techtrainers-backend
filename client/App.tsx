import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './src/pages/LandingPage';
import SelectTierPage from './src/pages/SelectTierPage';
import BeginnerPage from './src/pages/BeginnerPage';
import IntermediatePage from './src/pages/IntermediatePage';
import AdvancedPage from './src/pages/AdvancedPage';
import AboutPage from './src/pages/AboutPage';
import TestApiPage from './src/pages/TestApiPage';
import ProfilePage from './src/pages/ProfilePage';
import DashboardPage from './src/pages/DashboardPage';
import FitnessPage from './src/pages/FitnessPage';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // While checking auth status, show nothing or a loading spinner
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // If authenticated, show the protected content
  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-inter">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/select-tier" element={<SelectTierPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
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
        <Route path="/about" element={<AboutPage />} />
        <Route path="/api-test" element={<TestApiPage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;