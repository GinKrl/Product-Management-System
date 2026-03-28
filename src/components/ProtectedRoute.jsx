import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: curSession } } = await supabase.auth.getSession();
        
        if (curSession) {
          setSession(curSession);
        } else {
          setSession(null);
        }
      } catch (e) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  if (loading) return <div className="p-10">Checking security...</div>;
  if (!session) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;