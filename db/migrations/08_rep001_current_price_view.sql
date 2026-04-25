CREATE OR REPLACE VIEW current_product_prices AS
SELECT 
    p.prodcode, 
    p.description, 
    p.unit, 
    ph.unitprice
FROM public.product p
LEFT JOIN public.pricehist ph ON p.prodcode = ph.prodcode
WHERE ph.record_status = 'ACTIVE';