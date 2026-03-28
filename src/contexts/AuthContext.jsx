import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [permissions, setPermissions] = useState([]); // Prepared for future Role-Based Access
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = (session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      // Logic for fetching specific DB permissions can be injected here later
      setLoading(false);
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => setData(session));

    // Listen for Auth changes (Sign In / Sign Out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setData(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // We include permissions in the value so the whole app can check user rights
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