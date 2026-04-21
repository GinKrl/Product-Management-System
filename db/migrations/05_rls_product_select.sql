-- Enable RLS on the product table
ALTER TABLE product ENABLE ROW LEVEL SECURITY;

-- Drop existing to avoid conflicts
DROP POLICY IF EXISTS "Select products based on status and role" ON product;

-- Policy: USER sees ACTIVE only; ADMIN/SUPERADMIN see all
CREATE POLICY "Select products based on status and role" 
ON product
FOR SELECT 
TO authenticated
USING (
  -- Check your custom user table instead of the JWT
  (EXISTS (
    SELECT 1 FROM "user" 
    WHERE id = auth.uid() AND user_type IN ('ADMIN', 'SUPERADMIN')
  )) 
  OR 
  (record_status = 'ACTIVE')
);
