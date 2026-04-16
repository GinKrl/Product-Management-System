import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionGuard = async (currentSession) => {
      if (!currentSession) {
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Updated to use 'user_type' based on your SQL schema
        const { data, error } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error) throw error;

        // Security check: Block users explicitly set to INACTIVE
        if (data?.record_status === 'INACTIVE') {
          await supabase.auth.signOut();
          alert("Your account is pending administrator approval.");
          window.location.replace("/login");
          return;
        }

        setSession(currentSession);
        
        // Map the database 'user_type' to the 'role' property
        // This ensures DeletedItemsPage recognizes ADMIN/SUPERADMIN roles
        setCurrentUser({
          ...currentSession.user,
          role: data?.user_type || 'USER' 
        });

      } catch (err) {
        console.error("Auth Guard Error:", err);
        // Fallback to basic session info on network error to prevent lockouts
        setSession(currentSession);
        setCurrentUser(currentSession.user);
      } finally {
        setLoading(false);
      }
    };

    // Initialize session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        handleSessionGuard(session);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, session, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}