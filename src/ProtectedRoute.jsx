import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // ⬅️ Import the Auth hook

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // ⬅️ Get state from global context
  
  // Navigate to the root path (login page) if not authenticated
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;