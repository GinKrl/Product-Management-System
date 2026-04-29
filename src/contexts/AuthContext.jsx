// src/contexts/AuthContext.jsx
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
        // FIX: column is 'id' not 'userid' in the user table
        const { data, error } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error) throw error;

        // Block INACTIVE accounts
        if (data?.record_status === 'INACTIVE') {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        // Block users with no DB row (not yet provisioned)
        if (!data) {
          await supabase.auth.signOut();
          setCurrentUser(null);
          setSession(null);
          setLoading(false);
          return;
        }

        setSession(currentSession);
        setCurrentUser({
          ...currentSession.user,
          user_type: data.user_type,
        });

      } catch (err) {
        // On error, sign out to be safe
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    // Listen for auth state changes
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