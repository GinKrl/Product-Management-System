CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
    p.prodcode, 
    p.description, 
    SUM(sd.quantity) as total_sold
FROM public.product p
JOIN public.salesdetail sd ON p.prodcode = sd.prodcode
GROUP BY p.prodcode, p.description
ORDER BY total_sold DESC;