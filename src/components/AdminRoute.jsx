import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // 1. Wait for Auth to figure out who is logged in
  if (loading) {
    return <div style={{ padding: '24px' }}>Verifying permissions...</div>; 
  }

  // 2. Safely get the user's role
  const userRole = currentUser?.user_type?.toUpperCase() || 'USER';

  // 3. The Guard: If they are just a USER, kick them out
  if (userRole === 'USER') {
    // We use "replace" so they can't use the browser's back button to get back here
    return <Navigate to="/products" replace state={{ alert: "Admin access required." }} />;
  }

  // 4. If they are ADMIN or SUPERADMIN, render the page
  return children;
};

export default AdminRoute;