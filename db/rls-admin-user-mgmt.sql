-- PR-02: RLS on "user" table and "UserModule_Rights"
-- ADMIN cannot modify SUPERADMIN records
-- Column names verified against actual DB schema:
--   "user" table PK: id (uuid)
--   "UserModule_Rights" table: userid (varchar), right_id (varchar), right_value (int4)

-- ─────────────────────────────────────────────────────────────
-- PART A: RLS on "user" table
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "user" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read their own row
-- auth.uid() is uuid, id is uuid — direct comparison works
CREATE POLICY "Users can read own profile"
ON "user"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- SUPERADMIN can read ALL user rows
-- Needed by UserManagementPage when logged in as SUPERADMIN
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

-- ADMIN can read all user rows
-- Needed by UserManagementPage when logged in as ADMIN
-- to show the full user list for activation/deactivation
CREATE POLICY "ADMIN can read all users"
ON "user"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type = 'ADMIN'
  )
);

-- ADMIN can UPDATE record_status only on non-SUPERADMIN rows
-- user_type column is TEXT in the actual DB
CREATE POLICY "ADMIN can update non-superadmin users"
ON "user"
FOR UPDATE
TO authenticated
USING (
  -- Target row must NOT be a SUPERADMIN
  user_type != 'SUPERADMIN'
  AND
  -- Logged-in user must be ADMIN or SUPERADMIN
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type IN ('ADMIN', 'SUPERADMIN')
  )
)
WITH CHECK (
  -- Prevent escalating any user to SUPERADMIN via update
  user_type != 'SUPERADMIN'
);

-- ─────────────────────────────────────────────────────────────
-- PART B: RLS on "UserModule_Rights" table
-- Column: userid is VARCHAR — cast auth.uid() to text for comparison
-- ─────────────────────────────────────────────────────────────

ALTER TABLE "UserModule_Rights" ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read their own rights rows
-- userid is varchar so cast auth.uid() to text
CREATE POLICY "Users can read own rights"
ON "UserModule_Rights"
FOR SELECT
TO authenticated
USING (userid = auth.uid()::text);

-- SUPERADMIN can read all rights rows
CREATE POLICY "SUPERADMIN can read all rights"
ON "UserModule_Rights"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type = 'SUPERADMIN'
  )
);

-- ADMIN can read rights of non-SUPERADMIN users only
CREATE POLICY "ADMIN can read non-superadmin rights"
ON "UserModule_Rights"
FOR SELECT
TO authenticated
USING (
  -- The userid on this rights row must NOT belong to a SUPERADMIN
  userid NOT IN (
    SELECT id::text FROM "user" WHERE user_type = 'SUPERADMIN'
  )
  AND
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type = 'ADMIN'
  )
);

-- Block ALL operations (INSERT, UPDATE, DELETE) on rights rows
-- that belong to a SUPERADMIN — applies to everyone including ADMIN
CREATE POLICY "Protect SUPERADMIN rights from modification"
ON "UserModule_Rights"
FOR ALL
TO authenticated
USING (
  userid NOT IN (
    SELECT id::text FROM "user" WHERE user_type = 'SUPERADMIN'
  )
);

-- SUPERADMIN has full access to all rights rows
CREATE POLICY "SUPERADMIN full access to rights"
ON "UserModule_Rights"
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = auth.uid()
    AND u.user_type = 'SUPERADMIN'
  )
);
