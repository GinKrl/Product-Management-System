-- 1. Enable RLS on priceHist
ALTER TABLE priceHist ENABLE ROW LEVEL SECURITY;

-- 2. Policy for priceHist: SELECT and INSERT for authenticated users
CREATE POLICY "Authenticated users can select and insert prices"
ON priceHist
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Create the SQL View: current_product_price
-- This uses DISTINCT ON to get only the latest entry per prodCode
CREATE OR REPLACE VIEW current_product_price AS
SELECT DISTINCT ON (prodCode)
    prodCode,
    unitPrice,
    created_at
FROM priceHist
ORDER BY prodCode, created_at DESC;

-- 4. Grant access to the view
GRANT SELECT ON current_product_price TO authenticated;
