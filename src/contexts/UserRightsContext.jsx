import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

const UserRightsContext = createContext(null);

export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [loadingRights, setLoadingRights] = useState(true);

  useEffect(() => {
    const fetchRights = async () => {
      // Use currentUser.id or currentUser.uuid depending on your AuthContext structure
      const userId = currentUser?.id; 

      if (!userId) {
        setRights({});
        setLoadingRights(false);
        return;
      }

      setLoadingRights(true);
      try {
        // Query the junction table and JOIN with the rights table
        const { data, error } = await supabase
          .from("usermodule_rights")
          .select(`
            right_id,
            rights (
              right_name
            )
          `)
          .eq("user_id", userId);

        if (error) throw error;

        // Convert the array of joined objects into a flat map
        // Result: { PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 1 }
        const rightsMap = {};
        (data || []).forEach((row) => {
          const name = row.rights?.right_name;
          if (name) {
            rightsMap[name] = 1;
          }
        });

        setRights(rightsMap);
      } catch (err) {
        console.error("Failed to fetch user rights:", err);
        setRights({});
      } finally {
        setLoadingRights(false);
      }
    };

    fetchRights();
  }, [currentUser?.id]);

  return (
    <UserRightsContext.Provider value={{ rights, loadingRights }}>
      {children}
    </UserRightsContext.Provider>
  );
}

export function useRightsContext() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error("useRightsContext must be used within a UserRightsProvider");
  }
  return context;
}
