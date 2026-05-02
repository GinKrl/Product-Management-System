-- PR-01: top_selling_products view
-- JOIN salesdetail + product, GROUP BY prodcode, ORDER BY total_qty DESC

-- FIX 1: DROP VIEW first — existing view has column 'total_sold' which cannot
--        be renamed via CREATE OR REPLACE VIEW (PostgreSQL error 42P16)
-- FIX 2: Added WHERE p.record_status = 'ACTIVE' per guide Section 10.2
--        Soft-deleted (INACTIVE) products must not appear in any report
-- FIX 3: Removed p.record_status from SELECT and GROUP BY
--        Not in the spec (guide Section 10.2) and unnecessary

DROP VIEW IF EXISTS top_selling_products;

CREATE VIEW top_selling_products AS
SELECT
  sd.prodcode,
  p.description,
  p.unit,
  SUM(sd.quantity) AS total_qty
FROM salesdetail sd
JOIN product p ON sd.prodcode = p.prodcode
WHERE p.record_status = 'ACTIVE'
GROUP BY
  sd.prodcode,
  p.description,
  p.unit
ORDER BY total_qty DESC;
