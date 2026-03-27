-- Seed the Superadmin User
INSERT INTO users (email, user_type, record_status) 
VALUES ('jcesperanza@neu.edu.ph', 'SUPERADMIN', 'active');

-- Seed basic Modules (Adjust names based on your project requirements)
INSERT INTO Module (module_name, description) VALUES 
('Inventory', 'Manage products and stock'),
('User Management', 'Manage system users'),
('Reports', 'View price history and analytics');

-- Assign all rights to the Superadmin
INSERT INTO UserModule_Rights (user_id, module_id, right_id)
SELECT u.id, m.id, 1 
FROM users u, Module m
WHERE u.email = 'jcesperanza@neu.edu.ph';