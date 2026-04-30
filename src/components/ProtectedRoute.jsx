import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRightsContext } from '../contexts/UserRightsContext';

// Added 'requiredRight' to the props
const ProtectedRoute = ({ children, allowedRoles, requiredRight }) => {
  const { session, loading: authLoading } = useAuth();
  const { userRole, rights, loadingRights } = useRightsContext();

  // 1. Wait for everything to load. 
  if (authLoading || loadingRights) {
    return (
      <div style={{
        display: 'flex', height: '100vh',
        alignItems: 'center', justifyContent: 'center',
        background: '#fff', fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ color: '#b91c1c', fontWeight: 600, fontSize: 14 }}>
          Verifying Permissions...
        </div>
      </div>
    );
  }

  // 2. No session? Kick to login.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = userRole?.toUpperCase();

  // 3. Right Check (Sprint 3 Requirement)
  // Role-based restrictions: ADMIN cannot perform PRD_DEL or REP_002
  if (requiredRight) {
    if (currentRole === 'ADMIN' && (requiredRight === 'PRD_DEL' || requiredRight === 'REP_002')) {
      console.warn(`Access Denied: ${currentRole} is not permitted to perform ${requiredRight}`);
      return <Navigate to="/products" replace />;
    }

    const hasRight = rights[requiredRight] === 1;
    
    if (!hasRight && currentRole !== 'SUPERADMIN') {
      console.warn(`Access Denied: Missing right ${requiredRight}`);
      return <Navigate to="/products" replace />;
    }
  }

  // 4. Role Check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!currentRole) {
       console.error("Access Denied: No role found in database.");
       return <Navigate to="/login" replace />;
    }

    const hasAccess = allowedRoles.map(r => r.toUpperCase()).includes(currentRole);
    
    if (!hasAccess) {
      console.warn(`Access Denied for ${currentRole}. Required: ${allowedRoles}`);
      return <Navigate to="/products" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
