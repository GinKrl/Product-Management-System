-- 1. Ensure Right definitions exist in the lookup table
INSERT INTO "Module_Rights" (id, right_name, module_name)
VALUES 
  (5, 'REP_001', 'Report_Mod'),
  (6, 'REP_002', 'Report_Mod'),
  (7, 'ADM_USER', 'Adm_Mod')
ON CONFLICT (id) DO NOTHING;

-- 2. Align with 2.2 Rights Matrix: Grant Product Report (ID 5) to everyone
INSERT INTO "UserModule_Rights" (userid, right_id, right_value, record_status)
SELECT id, 5, 1, 'ACTIVE' FROM "user"
ON CONFLICT (userid, right_id) DO UPDATE SET right_value = 1;

-- 3. Align with 2.2 Rights Matrix: Restrict Top Selling (6) and Admin (7) to Superadmins only
INSERT INTO "UserModule_Rights" (userid, right_id, right_value, record_status)
SELECT u.id, r.rid, 0, 'ACTIVE'
FROM "user" u
CROSS JOIN (SELECT unnest(ARRAY[6, 7]) as rid) r
WHERE u.user_type != 'SUPERADMIN'
ON CONFLICT (userid, right_id) DO UPDATE SET right_value = 0;