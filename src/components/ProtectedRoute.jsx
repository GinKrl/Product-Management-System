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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    // Fixed: Now correctly looks for user_type instead of role
    const userRole = currentUser?.user_type?.toUpperCase();

    if (!userRole) {
      return null; 
    }

    const hasAccess = allowedRoles.some(r => r.toUpperCase() === userRole);
    
    if (!hasAccess) {
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;