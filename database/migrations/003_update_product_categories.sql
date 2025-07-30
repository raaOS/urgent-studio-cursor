-- Migration to update product categories
-- Change all categories to 'jasa-satuan'

-- Update all products to use 'jasa-satuan' category
UPDATE products
SET category = 'jasa-satuan'
WHERE category IN ('kaki-lima', 'umkm', 'ecommerce');