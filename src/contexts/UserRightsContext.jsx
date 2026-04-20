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
      if (!currentUser?.id) {
        setRights({});
        setLoadingRights(false);
        return;
      }

      setLoadingRights(true);
      try {
        const { data, error } = await supabase
          .from("UserModule_Rights")
          .select("module_code, can_access")
          .eq("user_id", currentUser.id);

        if (error) throw error;

        // Convert array to map: { PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0, ... }
        const rightsMap = {};
        (data || []).forEach(({ module_code, can_access }) => {
          rightsMap[module_code] = can_access ? 1 : 0;
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
  return useContext(UserRightsContext);
}