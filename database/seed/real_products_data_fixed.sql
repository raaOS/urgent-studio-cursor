-- Real Products Data for Urgent Studio (Fixed with UUID)
-- This script replaces all fake data with the real 19 products from frontend
-- and cleans up all fake orders

-- Clean up all fake data first
DELETE FROM order_status_history;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM service_items;

-- Insert real 19 products from frontend with UUID and product_code
INSERT INTO products (product_code, name, description, price, category, image_url, features, delivery_time, revisions, popular, created_at, updated_at) VALUES
-- JDS-01 to JDS-06 (Kategori: jasa-satuan-basic)
('JDS-01', 'Desain Konten Feed (Single Post)', 'Desain konten feed untuk media sosial yang menarik dan profesional', 15000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Feed+Post', '["Format JPG/PNG", "Resolusi HD", "1 konsep desain", "2x revisi minor"]', '1-2 hari', 2, true, NOW(), NOW()),

('JDS-02', 'Desain Konten Carousel (3 Slide)', 'Desain carousel 3 slide untuk storytelling yang efektif di media sosial', 30000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Carousel', '["3 slide design", "Format JPG/PNG", "Resolusi HD", "2 konsep awal", "3x revisi"]', '2-3 hari', 3, true, NOW(), NOW()),

('JDS-03', 'Desain Konten Story (Vertikal)', 'Desain story vertikal untuk Instagram dan media sosial lainnya', 15000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Story', '["Format vertikal 9:16", "Format JPG/PNG", "Resolusi HD", "1 konsep desain", "2x revisi"]', '1-2 hari', 2, false, NOW(), NOW()),

('JDS-04', 'Desain Kop Surat (Letterhead)', 'Desain kop surat profesional untuk kebutuhan bisnis formal', 15000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Letterhead', '["Format A4", "File PDF siap cetak", "File editable", "1 konsep desain", "2x revisi"]', '1-2 hari', 2, false, NOW(), NOW()),

('JDS-05', 'Desain Kartu Nama', 'Desain kartu nama profesional dengan layout yang menarik', 18000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Business+Card', '["Ukuran standar 9x5.5cm", "File PDF siap cetak", "2 sisi (depan-belakang)", "2 konsep awal", "3x revisi"]', '1-2 hari', 3, true, NOW(), NOW()),

('JDS-06', 'Desain Frame Foto Profil (Twibbon)', 'Desain frame foto profil untuk event atau kampanye khusus', 18000.00, 'jasa-satuan', 'https://placehold.co/300x300/ff7a2f/white?text=Twibbon', '["Format PNG transparan", "Resolusi HD", "File editable", "2 konsep awal", "3x revisi"]', '1-2 hari', 3, false, NOW(), NOW()),

-- JDS-07 to JDS-14 (Kategori: jasa-satuan-medium)
('JDS-07', 'Desain Sertifikat / Piagam', 'Desain sertifikat atau piagam untuk penghargaan dan event', 20000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Certificate', '["Format A4 landscape", "File PDF siap cetak", "File editable", "2 konsep awal", "3x revisi"]', '2-3 hari', 3, false, NOW(), NOW()),

('JDS-08', 'Desain Lanyard / Tali ID Card', 'Desain lanyard profesional untuk event dan perusahaan', 20000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Lanyard', '["Ukuran standar 2x90cm", "File PDF siap cetak", "2 sisi printing", "2 konsep awal", "3x revisi"]', '2-3 hari', 3, false, NOW(), NOW()),

('JDS-09', 'Desain Poster (Ukuran A4)', 'Desain poster promosi ukuran A4 untuk berbagai kebutuhan', 22000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Poster+A4', '["Format A4 portrait/landscape", "File PDF siap cetak", "Resolusi 300 DPI", "2 konsep awal", "4x revisi"]', '2-3 hari', 4, true, NOW(), NOW()),

('JDS-10', 'Desain Buku Menu', 'Desain buku menu untuk restoran dan cafe yang menarik', 25000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Menu+Book', '["Multi halaman", "File PDF siap cetak", "Layout profesional", "2 konsep awal", "4x revisi"]', '3-4 hari', 4, true, NOW(), NOW()),

('JDS-11', 'Desain Undangan Digital / Cetak', 'Desain undangan untuk event digital maupun cetak', 25000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Invitation', '["Format digital & cetak", "File PDF & JPG", "Desain elegan", "2 konsep awal", "4x revisi"]', '3-4 hari', 4, true, NOW(), NOW()),

('JDS-12', 'Desain Brosur / Pamflet Promosi', 'Desain brosur promosi yang informatif dan menarik', 35000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=Brochure', '["2-3 fold design", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "5x revisi"]', '3-5 hari', 5, true, NOW(), NOW()),

('JDS-13', 'Desain X-Banner', 'Desain X-Banner untuk display event dan promosi', 35000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=X-Banner', '["Ukuran 60x160cm", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "5x revisi"]', '3-5 hari', 5, false, NOW(), NOW()),

('JDS-14', 'Desain Sampul E-book', 'Desain sampul e-book yang profesional dan eye-catching', 35000.00, 'jasa-satuan', 'https://placehold.co/300x300/3b82f6/white?text=E-book+Cover', '["Format digital", "3D mockup", "File PNG/JPG", "3 konsep awal", "5x revisi"]', '3-5 hari', 5, false, NOW(), NOW()),

-- JDS-15 to JDS-19 (Kategori: jasa-satuan-premium)
('JDS-15', 'Desain Spanduk / Banner Outdoor', 'Desain spanduk outdoor untuk promosi skala besar', 40000.00, 'jasa-satuan', 'https://placehold.co/300x300/8b5cf6/white?text=Outdoor+Banner', '["Ukuran custom", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "Unlimited revisi"]', '4-6 hari', -1, false, NOW(), NOW()),

('JDS-16', 'Desain Roll-Up Banner', 'Desain roll-up banner untuk event dan display indoor', 45000.00, 'jasa-satuan', 'https://placehold.co/300x300/8b5cf6/white?text=Roll-Up+Banner', '["Ukuran 85x200cm", "File PDF siap cetak", "Resolusi 300 DPI", "3 konsep awal", "Unlimited revisi"]', '4-6 hari', -1, true, NOW(), NOW()),

('JDS-17', 'Desain Gerbang Acara (Gate)', 'Desain gerbang acara yang megah dan menarik perhatian', 70000.00, 'jasa-satuan', 'https://placehold.co/300x300/8b5cf6/white?text=Event+Gate', '["Ukuran custom", "File PDF siap cetak", "3D visualization", "4 konsep awal", "Unlimited revisi"]', '5-7 hari', -1, false, NOW(), NOW()),

('JDS-18', 'Desain Slide Presentasi (PPT)', 'Desain slide presentasi profesional untuk business pitch', 70000.00, 'jasa-satuan', 'https://placehold.co/300x300/8b5cf6/white?text=PPT+Slides', '["10-15 slide template", "File PPTX editable", "Desain konsisten", "4 konsep awal", "Unlimited revisi"]', '5-7 hari', -1, true, NOW(), NOW()),

('JDS-19', 'Desain Visual Landing Page', 'Desain visual landing page yang conversion-focused', 125000.00, 'jasa-satuan', 'https://placehold.co/300x300/8b5cf6/white?text=Landing+Page', '["Responsive design", "File Figma/PSD", "UI/UX optimized", "5 konsep awal", "Unlimited revisi"]', '7-10 hari', -1, true, NOW(), NOW());

-- Verify the data
SELECT COUNT(*) as total_products FROM products;
SELECT product_code, name, price, popular FROM products ORDER BY product_code;