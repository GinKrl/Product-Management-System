-- 1. INSERT Policy: only if PRD_ADD right = 1
CREATE POLICY "Enable insert for users with PRD_ADD" 
ON product
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'PRD_ADD')::int = 1
);

-- 2. UPDATE Policy (General Edit): only if PRD_EDIT right = 1
CREATE POLICY "Enable update for users with PRD_EDIT" 
ON product
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'PRD_EDIT')::int = 1
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'PRD_EDIT')::int = 1
);

-- 3. UPDATE Policy (Soft Delete): record_status to INACTIVE if PRD_DEL right = 1
CREATE POLICY "Enable soft delete for users with PRD_DEL" 
ON product
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'PRD_DEL')::int = 1
)
WITH CHECK (
  record_status = 'INACTIVE'
);

-- 4. UPDATE Policy (Recovery): record_status to ACTIVE if ADMIN or SUPERADMIN
CREATE POLICY "Enable recovery for high-level roles" 
ON product
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('ADMIN', 'SUPERADMIN')
)
WITH CHECK (
  record_status = 'ACTIVE'
);