-- Script untuk membersihkan data palsu dari database
-- Jalankan script ini untuk menghapus semua data dummy/testing

-- Hapus data dummy dari tabel orders
DELETE FROM orders WHERE customer_name IN ('John Doe', 'Jane Smith') OR customer_email IN ('john@example.com', 'jane@example.com');

-- Hapus data dummy dari tabel products dengan ID yang menggunakan pattern JDS-XX
DELETE FROM products WHERE id LIKE 'JDS-%';

-- Hapus data dummy dari tabel service_items dengan UUID yang jelas dummy
DELETE FROM service_items WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- Hapus data dummy dari tabel users (jika ada)
DELETE FROM users WHERE email IN ('admin@urgentstudio.com', 'designer@urgentstudio.com', 'client@example.com');

-- Hapus data dummy dari tabel services (jika ada)
DELETE FROM services WHERE name IN ('Logo Design', 'Website Design', 'UI/UX Design', 'Brand Identity');

-- Hapus data dummy dari tabel projects (jika ada)
DELETE FROM projects WHERE title IN ('E-commerce Website Redesign', 'Corporate Brand Identity');

-- Hapus data dummy dari tabel bookings (jika ada)
DELETE FROM bookings WHERE notes LIKE '%Client prefers minimalist design approach%';

-- Reset auto-increment sequences jika diperlukan
-- ALTER SEQUENCE orders_id_seq RESTART WITH 1;
-- ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- Tampilkan jumlah data yang tersisa
SELECT 'orders' as table_name, COUNT(*) as remaining_records FROM orders
UNION ALL
SELECT 'products' as table_name, COUNT(*) as remaining_records FROM products
UNION ALL
SELECT 'service_items' as table_name, COUNT(*) as remaining_records FROM service_items
UNION ALL
SELECT 'users' as table_name, COUNT(*) as remaining_records FROM users;

-- Log cleanup completion
INSERT INTO system_logs (level, message, created_at) 
VALUES ('INFO', 'Database cleanup completed - fake data removed', CURRENT_TIMESTAMP);