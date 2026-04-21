import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { session, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', height: '100vh',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: 14 }}>
          Checking security...
        </div>
      </div>
    );
  }

  // 1. No session → redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role check — if allowedRoles is provided, enforce it
  if (allowedRoles && allowedRoles.length > 0) {
    // Ensure we have the user_type from the DB before deciding access
    const userRole = currentUser?.user_type?.toUpperCase();

    // If user_type hasn't loaded yet but session exists, we should wait 
    // rather than redirecting to /products immediately
    if (!userRole) {
      return null; // Or a smaller loading spinner
    }

    const hasAccess = allowedRoles.some(r => r.toUpperCase() === userRole);
    
    if (!hasAccess) {
      // Unauthorized: Kick them back to the main product list
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;