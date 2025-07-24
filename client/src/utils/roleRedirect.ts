// Utility function for role-based redirects
export const getRoleBasedRedirect = (role: string, isApproved: boolean = true): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'trainer':
      if (!isApproved) {
        return '/trainer/pending-approval';
      }
      return '/trainer/dashboard';
    case 'member':
    default:
      return '/dashboard';
  }
};

export const redirectAfterAuth = (role: string, isApproved: boolean = true): void => {
  const redirectPath = getRoleBasedRedirect(role, isApproved);
  window.location.href = redirectPath;
};
