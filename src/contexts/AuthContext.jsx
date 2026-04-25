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
        const { data, error } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('id', currentSession.user.id) 
          .maybeSingle();

        if (error) throw error;

        if (data?.record_status === 'INACTIVE') {
          await supabase.auth.signOut();
          alert("Your account is pending administrator approval.");
          window.location.replace("/login");
          return;
        }

        setSession(currentSession);
        
        // Fixed: Use user_type to match the schema and component checks
        setCurrentUser({
          ...currentSession.user,
          user_type: data?.user_type || 'USER' 
        });

      } catch (err) {
        console.error("Auth Guard Error:", err);
        setSession(currentSession);
        setCurrentUser({ ...currentSession.user, user_type: 'USER' });
      } finally {
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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