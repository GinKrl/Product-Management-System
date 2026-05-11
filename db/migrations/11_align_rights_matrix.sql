-- 1. Ensure the Right definitions exist in the lookup table first 
-- (Just in case they weren't in migration 03)
INSERT INTO "Module_Rights_Lookup" (id, right_name, module_name)
VALUES 
  (5, 'REP_001', 'Report_Mod'),
  (6, 'REP_002', 'Report_Mod'),
  (7, 'ADM_USER', 'Adm_Mod')
ON CONFLICT (id) DO NOTHING;

-- 2. Now apply the logic from the 2.2 Rights Matrix
-- Enable Product Report Listing for everyone
INSERT INTO "UserModule_Rights" (userid, right_id, right_value, record_status)
SELECT id, 5, 1, 'ACTIVE' FROM "user"
ON CONFLICT (userid, right_id) DO UPDATE SET right_value = 1;

-- Restrict Top Selling and User Management for non-superadmins
INSERT INTO "UserModule_Rights" (userid, right_id, right_value, record_status)
SELECT id, right_id, 0, 'ACTIVE' 
FROM "user" 
CROSS JOIN (SELECT unnest(ARRAY[6, 7]) as right_id) r
WHERE user_type != 'SUPERADMIN'
ON CONFLICT (userid, right_id) DO UPDATE SET right_value = 0;