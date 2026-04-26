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
        // 1. Log the ID we are looking for so you can compare it to your database
        console.log("Checking DB for UID:", currentSession.user.id);
        
        const { data, error } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('id', currentSession.user.id) 
          .maybeSingle();

        // 2. Log what the database actually returned
        console.log("DB Result:", data, "Error:", error);

        if (error) throw error;

        // 3. Only kick the user out if the DB explicitly says they are INACTIVE
        if (data?.record_status === 'INACTIVE') {
          console.warn("Account is inactive. Signing out.");
          await supabase.auth.signOut();
          setCurrentUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        // 4. If !data, RLS might be blocking the read, but we will let you in to debug
        if (!data) {
          console.warn("No user row found! RLS might be blocking the read, or the ID is wrong.");
        }

        setSession(currentSession);
        setCurrentUser({
          ...currentSession.user,
          user_type: data?.user_type || 'USER' 
        });

      } catch (err) {
        console.error("Auth Guard Error:", err);
        // Fallback: don't loop, just let them in as a basic user so the app doesn't break
        setSession(currentSession);
        setCurrentUser({ ...currentSession.user, user_type: 'USER' });
      } finally {
        setLoading(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    // Listen for login/logout events
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