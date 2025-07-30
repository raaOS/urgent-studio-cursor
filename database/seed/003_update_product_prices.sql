-- Update product prices to use UMKM tier prices

-- Update kaki-lima products to use UMKM tier prices
UPDATE products
SET price = 25000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' AND category = 'jasa-satuan'; -- Desain Konten Feed (Single Post)

UPDATE products
SET price = 35000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12' AND category = 'jasa-satuan'; -- Desain Konten Carousel (3 Slide)

UPDATE products
SET price = 25000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13' AND category = 'jasa-satuan'; -- Desain Konten Story (Vertikal)

UPDATE products
SET price = 20000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14' AND category = 'jasa-satuan'; -- Desain Kop Surat (Letterhead)

UPDATE products
SET price = 20000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15' AND category = 'jasa-satuan'; -- Desain Kartu Nama

UPDATE products
SET price = 20000
WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16' AND category = 'jasa-satuan'; -- Desain Frame Foto Profil (Twibbon)

-- ecommerce products already have their prices set, just update the category
-- No price changes needed for UMKM products as they already have the correct prices