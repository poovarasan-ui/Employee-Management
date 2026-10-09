import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getCurrentUser, isAdminOrHr } from '../utils/auth';

const ProtectedRoute = ({ adminOnly = false }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdminOrHr()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
