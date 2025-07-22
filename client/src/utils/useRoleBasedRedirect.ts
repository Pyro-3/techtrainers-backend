import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirect } from './roleRedirect';

// Hook to handle automatic redirects based on user role and approval status
export const useRoleBasedRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const currentPath = location.pathname;
      const expectedPath = getRoleBasedRedirect(user.role, user.isApproved);
      
      // Paths that should trigger automatic redirect
      const redirectPaths = ['/', '/login', '/dashboard'];
      
      if (redirectPaths.includes(currentPath)) {
        if (currentPath !== expectedPath) {
          navigate(expectedPath, { replace: true });
        }
      }
      
      // Special redirects for trainers
      if (user.role === 'trainer') {
        // If trainer is trying to access general dashboard, redirect appropriately
        if (currentPath === '/dashboard') {
          if (user.isApproved) {
            navigate('/trainer/dashboard', { replace: true });
          } else {
            navigate('/trainer/pending-approval', { replace: true });
          }
        }
        
        // If trainer is approved but on pending page, redirect to dashboard
        if (user.isApproved && currentPath === '/trainer/pending-approval') {
          navigate('/trainer/dashboard', { replace: true });
        }
        
        // If trainer is not approved but trying to access trainer dashboard
        if (!user.isApproved && currentPath === '/trainer/dashboard') {
          navigate('/trainer/pending-approval', { replace: true });
        }
      }
    }
  }, [user, isAuthenticated, loading, navigate, location.pathname]);
};

export default useRoleBasedRedirect;
