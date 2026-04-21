-- 1. INSERT Policy: only if PRD_ADD right = 1
CREATE POLICY "Enable insert for users with PRD_ADD"
ON product
FOR INSERT
TO authenticated
WITH CHECK (
EXISTS (
SELECT 1 FROM usermodule_rights umr
JOIN rights r ON umr.right_id = r.id
WHERE umr.user_id = auth.uid() AND r.right_name = 'PRD_ADD'
)
);

-- 2. UPDATE Policy (General Edit): only if PRD_EDIT right = 1
CREATE POLICY "Enable update for users with PRD_EDIT"
ON product
FOR UPDATE
TO authenticated
USING (
EXISTS (
SELECT 1 FROM usermodule_rights umr
JOIN rights r ON umr.right_id = r.id
WHERE umr.user_id = auth.uid() AND r.right_name = 'PRD_EDIT'
)
);

-- 3. UPDATE Policy (Soft Delete): record_status to INACTIVE if PRD_DEL right = 1
CREATE POLICY "Enable soft delete for users with PRD_DEL"
ON product
FOR UPDATE
TO authenticated
USING (
EXISTS (
SELECT 1 FROM usermodule_rights umr
JOIN rights r ON umr.right_id = r.id
WHERE umr.user_id = auth.uid() AND r.right_name = 'PRD_DEL'
)
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
EXISTS (
SELECT 1 FROM "user"
WHERE id = auth.uid() AND user_type IN ('ADMIN', 'SUPERADMIN')
)
)
WITH CHECK (
record_status = 'ACTIVE'
);