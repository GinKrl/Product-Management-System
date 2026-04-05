import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [permissions, setPermissions] = useState([]); // Prepared for future Role-Based Access
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Async function to handle the Login Guard check
    const handleSessionGuard = async (currentSession) => {
      if (!currentSession) {
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Query the 'user' table (singular) to check the record_status
        const { data, error } = await supabase
          .from('user')
          .select('record_status')
          .eq('id', currentSession.user.id)
          .single();

        // If there's an error (like the user row doesn't exist yet), block access
        if (error) throw error;

        // 2. The Login Guard: Check if the user is INACTIVE
        if (data?.record_status === 'INACTIVE') {
          // Sign them out of Supabase Auth immediately
          await supabase.auth.signOut();
          
          // Show a professional message regarding the approval process
          alert("Welcome! Your account has been created. For security, an administrator must approve your access before you can enter the dashboard.");
          
          // Redirect back to login so they don't stay stuck on the loading screen
          window.location.href = "/login";
          return; 
        }

        // 3. If ACTIVE, allow them into the session
        setSession(currentSession);
        setCurrentUser(currentSession.user);
      } catch (err) {
        console.error("Error during login guard check:", err);
        // If there's a database error, play it safe and sign them out
        await supabase.auth.signOut();
        window.location.href = "/login";
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