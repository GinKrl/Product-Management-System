import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [permissions, setPermissions] = useState([]); // <--- NEW: For Db2 Rights
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setData = (session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      // Logic for fetching Db2 permissions will go here in PR-02
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => setData(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setData(session));

    return () => subscription.unsubscribe();
  }, []);

  // Updated value to include permissions
  const value = { currentUser, session, permissions, setPermissions, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
