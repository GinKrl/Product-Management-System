-- 1. Enable RLS on pricehist
ALTER TABLE pricehist ENABLE ROW LEVEL SECURITY;

-- 2. Policy for pricehist: SELECT and INSERT for authenticated users
CREATE POLICY "Authenticated users can select and insert prices"
ON pricehist
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Create the SQL View: current_product_price
-- This uses DISTINCT ON to get only the latest entry per prodcode based on effdate
CREATE OR REPLACE VIEW current_product_price AS
SELECT DISTINCT ON (prodcode)
    prodcode,
    unitprice,
    effdate,
    record_status,
    stamp
FROM pricehist
ORDER BY prodcode, effdate DESC;

-- 4. Grant access to the view
GRANT SELECT ON current_product_price TO authenticated;
