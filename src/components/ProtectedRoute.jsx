import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth();

  // Show a clean loading state while checking the Supabase session
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white font-dm-sans">
        <div className="text-[#b91c1c] font-semibold animate-pulse">
          Checking security...
        </div>
      </div>
    );
  }

  // If no user is found, redirect to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, allow access to the Dashboard
  return children;
};

export default ProtectedRoute;
