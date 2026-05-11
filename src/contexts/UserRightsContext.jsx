// src/contexts/UserRightsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../lib/supabaseClient";

const UserRightsContext = createContext(null);

export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loadingRights, setLoadingRights] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = currentUser?.id;

      if (!userId) {
        setRights({});
        setUserRole(null);
        setLoadingRights(false);
        return;
      }

      setLoadingRights(true);
      try {
        // column is 'id' in the user table — this is correct
        const { data: profile, error: profileError } = await supabase
          .from('user')
          .select("user_type")
          .eq("id", userId)
          .maybeSingle();

        if (profileError) throw profileError;

        const actualRole = profile?.user_type || "USER";
        setUserRole(actualRole);

        // SUPERADMIN gets all rights hardcoded
        if (actualRole === "SUPERADMIN") {
          setRights({
            PRD_ADD:  1,
            PRD_EDIT: 1,
            PRD_DEL:  1,
            REP_001:  1,
            REP_002:  1,
            ADM_USER: 1,
          });
          setLoadingRights(false);
          return;
        }

        // Fetch rights from UserModule_Rights table
        // userid column in UserModule_Rights is varchar, so cast to text
        const { data: rightsData, error: rightsError } = await supabase
  .from("UserModule_Rights")
  .select('right_id, right_value') // Changed from rights_value to right_value
  .eq("userid", userId);

if (!rightsError && rightsData) {
  const rightsMap = {};
  rightsData.forEach((row) => {
    const keyMap = { 2: 'PRD_ADD', 3: 'PRD_EDIT', 4: 'PRD_DEL' };
    const permissionName = keyMap[row.right_id];
    if (permissionName) {
      // Use the singular 'right_value' here too
      rightsMap[permissionName] = Number(row.right_value); 
    }
  });
  setRights(rightsMap);
}

      } catch (err) {
        console.error("Critical error in UserRightsContext:", err);
        setUserRole("USER");
      } finally {
        setLoadingRights(false);
      }
    };

    fetchUserData();
  }, [currentUser?.id]);

  return (
    <UserRightsContext.Provider value={{ rights, userRole, loadingRights }}>
      {children}
    </UserRightsContext.Provider>
  );
}

export function useRightsContext() {
  const context = useContext(UserRightsContext);
  if (!context) throw new Error("useRightsContext must be used within a UserRightsProvider");
  return context;
}