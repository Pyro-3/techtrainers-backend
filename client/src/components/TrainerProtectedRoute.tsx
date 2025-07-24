// src/components/TrainerProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TrainerProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center py-20">Loading...</div>;

  if (!user || user.role !== 'trainer') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default TrainerProtectedRoute;
