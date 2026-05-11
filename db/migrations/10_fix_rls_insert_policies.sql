-- Allow authenticated users to insert into the product table
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.product;
CREATE POLICY "Enable insert for authenticated users only" 
ON public.product FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to insert into price history
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.pricehist;
CREATE POLICY "Enable insert for authenticated users only" 
ON public.pricehist FOR INSERT 
TO authenticated 
WITH CHECK (true);