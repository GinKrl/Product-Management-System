import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSessionGuard = async (currentSession) => {
      // If there's no session at all, clear states and stop loading
      if (!currentSession) {
        setSession(null);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        // Fetch the supplemental user data from our 'user' table
        // We use .maybeSingle() to handle cases where Auth exists but DB row doesn't
        const { data, error } = await supabase
          .from('user')
          .select('user_type, record_status')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (error) throw error;

        // Security Check: Block INACTIVE accounts or missing DB records
        if (!data || data.record_status === 'INACTIVE') {
          console.warn("Access Denied: Account is inactive or not provisioned.");
          await supabase.auth.signOut();
          setSession(null);
          setCurrentUser(null);
          return;
        }

        // Successfully verified: Set the session and the enhanced user object
        setSession(currentSession);
        setCurrentUser({
          ...currentSession.user,
          user_type: data.user_type,
        });

      } catch (err) {
        console.error("Auth Guard Error:", err.message);
        // On critical error, sign out to prevent stale sessions
        await supabase.auth.signOut();
        setSession(null);
        setCurrentUser(null);
      } finally {
        // Stop the loading spinner (ProtectedRoute will now allow children to render)
        setLoading(false);
      }
    };

    // 1. Initial Check: Run once when the app/provider mounts
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSessionGuard(session);
    });

    // 2. Event Listener: Listen for login, logout, and token refreshes
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
      {/* Only render the app once the initial loading check is finished.
         This prevents the "Flash of Unauthenticated Content" 
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}