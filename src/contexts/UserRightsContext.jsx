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
        // 1. Fetch the user's role
        const { data: profile, error: profileError } = await supabase
          .from('user')
          .select("user_type")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        
        // 2. Lock in the role IMMEDIATELY
        const actualRole = profile?.user_type || "USER";
        setUserRole(actualRole);

        // 🚨 SUPERADMIN BYPASS 🚨
        // Superadmins don't need to be checked against the database rows. Give them everything.
        if (actualRole === "SUPERADMIN") {
          setRights({
            PRD_ADD: 1, 
            PRD_EDIT: 1, 
            PRD_DEL: 1,
            REP_001: 1, 
            REP_002: 1, 
            ADM_USER: 1
          });
          setLoadingRights(false);
          return; // Stop here!
        }

        // 3. Try to fetch module rights (For regular USERs or standard ADMINs)
        const { data: rightsData, error: rightsError } = await supabase
          .from("usermodule_rights")
          .select('right_id, rights(right_name)') 
          .eq("user_id", userId);

        if (rightsError) {
          console.warn("Could not fetch module rights, but keeping your role.", rightsError);
        } else {
          const rightsMap = {};
          
          (rightsData || []).forEach((row) => {
            // Hard-map IDs to guarantee UI works even if RLS blocks the join
            if (row.right_id === 2) rightsMap['PRD_ADD'] = 1;
            if (row.right_id === 3) rightsMap['PRD_EDIT'] = 1;
            if (row.right_id === 4) rightsMap['PRD_DEL'] = 1;
            if (row.right_id === 5) rightsMap['REP_001'] = 1;
            if (row.right_id === 6) rightsMap['REP_002'] = 1;
            if (row.right_id === 7) rightsMap['ADM_USER'] = 1;

            // Keep the dynamic join just in case it works later
            const name = row.rights?.right_name;
            if (name) rightsMap[name] = 1;
          });
          
          setRights(rightsMap);
        }

      } catch (err) {
        console.error("Failed to fetch user profile:", err);
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