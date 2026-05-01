-- PR-02: RLS on "user" table and "UserModule_Rights"
-- ADMIN cannot modify SUPERADMIN records

-- ─────────────────────────────────────────────
-- PART A: RLS on "user" table
-- ─────────────────────────────────────────────

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
CREATE POLICY "Users can read own profile"
ON "user"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- SUPERADMIN can read all users
CREATE POLICY "SUPERADMIN can read all users"
ON "user"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type = 'SUPERADMIN'
  )
);

-- ADMIN can UPDATE record_status only on non-SUPERADMIN rows
CREATE POLICY "ADMIN can update non-superadmin users"
ON "user"
FOR UPDATE
TO authenticated
USING (
  user_type != 'SUPERADMIN'
  AND
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u