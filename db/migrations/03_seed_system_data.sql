-- 1. Seed the Master Right (Full Access)
INSERT INTO RIGHTS (ID, RIGHT_NAME, DESCRIPTION) 
VALUES (1, 'FULL_ACCESS', 'Can view, edit, and delete across all modules');

-- 2. Seed the Superadmin User 
-- (Note: Ensure the USERS table from PR-01 exists first)
INSERT INTO USERS (EMAIL, USER_TYPE, RECORD_STATUS) 
VALUES ('jcesperanza@neu.edu.ph', 'SUPERADMIN', 'active');

-- 3. Seed the Dashboard Modules
INSERT INTO MODULE (MODULE_NAME, DESCRIPTION) VALUES 
('Inventory', 'Manage products and stock'),
('User Management', 'Manage system users'),
('Reports', 'View price history and analytics');

-- 4. Map the Superadmin to all Modules with Full Access
INSERT INTO USERMODULE_RIGHTS (USER_ID, MODULE_ID, RIGHT_ID)
SELECT U.ID, M.ID, 1 
FROM USERS U, MODULE M
WHERE U.EMAIL = 'jcesperanza@neu.edu.ph';
