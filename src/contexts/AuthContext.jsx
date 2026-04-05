import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [permissions, setPermissions] = useState([]); // Prepared for future Role-Based Access
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. New async function to handle the Login Guard check
    const handleSessionGuard = async (currentSession) => {
      if (!currentSession) {
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Query the 'user' table to check the record_status
        const { data, error } = await supabase
          .from('user')
          .select('record_status')
          .eq('id', currentSession.user.id)
          .single();

        if (error) throw error;

        // 2. The Login Guard: Boot the user if they are INACTIVE
        if (data?.record_status === 'INACTIVE') {
          await supabase.auth.signOut();
          alert("Login Failed: Your account is pending approval by an administrator.");
          // State gets cleared automatically by the subsequent SIGNED_OUT event
          return; 
        }

        // 3. If ACTIVE (or SUPERADMIN), allow them in
        setSession(currentSession);
        setCurrentUser(currentSession.user);
      } catch (err) {
        console.error("Error during login guard check:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial session check on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    // Listen for Auth changes (Sign In / Sign Out)
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

  const value = { 
    currentUser, 
    session, 
    permissions, 
    setPermissions, 
    loading 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}