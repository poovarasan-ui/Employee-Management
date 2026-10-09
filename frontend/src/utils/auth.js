// Helper utility to get current logged in user and role permissions

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing user from localStorage:', e);
    return null;
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role || 'admin'; // Defaults to admin for legacy/existing accounts
};

export const isAdminOrHr = () => {
  const role = getUserRole();
  return role === 'admin' || role === 'hr';
};

export const isEmployee = () => {
  return getUserRole() === 'employee';
};
