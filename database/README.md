# Database Urgent Studio

Folder ini berisi semua file terkait database untuk proyek Urgent Studio, termasuk migrasi, seed data, dan dokumentasi ERD.

## Struktur Folder

- `/migrations` - File SQL untuk migrasi database
- `/seed` - File SQL untuk mengisi data awal
- `/docs` - Dokumentasi database (ERD, skema, dll)

## Cara Menggunakan

### Migrasi Database

File migrasi dijalankan secara otomatis saat container PostgreSQL pertama kali dijalankan melalui docker-compose. File migrasi yang tersedia:

- `001_initial_schema.sql` - Skema awal database
- `002_products_schema.sql` - Tabel produk dan kategori
- `003_update_product_categories.sql` - Update kategori produk
- `004_orders_schema.sql` - Tabel orders/bookings
- `005_add_users_is_active.sql` - Menambah kolom is_active ke tabel users

Untuk menjalankan migrasi secara manual:

```bash
# Masuk ke container PostgreSQL
docker-compose exec postgres psql -U postgres -d urgent_studio

# Atau jalankan file migrasi tertentu
docker-compose exec postgres psql -U postgres -d urgent_studio -f /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
```

### Seed Data

Untuk mengisi database dengan data sampel, gunakan salah satu file berikut:

```bash
# Data produk real (recommended)
docker-compose exec postgres psql -U postgres -d urgent_studio -f /docker-entrypoint-initdb.d/seed/real_products_data_fixed.sql

# Data sampel lengkap untuk testing
docker-compose exec postgres psql -U postgres -d urgent_studio -f /docker-entrypoint-initdb.d/seed/sample_data_working.sql
```

### Menggunakan pgAdmin

PgAdmin disertakan dalam docker-compose untuk memudahkan manajemen database:

1. **Jalankan pgAdmin:**
   ```bash
   docker-compose up pgadmin -d
   ```

2. **Akses pgAdmin di:** http://localhost:5050

3. **Login dengan:**
   - Email: `admin@urgentstudio.com`
   - Password: `admin`

4. **Tambahkan server baru dengan:**
   - **Name:** `Urgent Studio DB`
   - **Host:** `postgres` (nama container)
   - **Port:** `5432`
   - **Database:** `urgent_studio`
   - **Username:** `postgres`
   - **Password:** `postgres`

## Skema Database

Database terdiri dari tabel-tabel berikut:

- **`users`** - Informasi pengguna (admin, designer, client)
  - Kolom: id, email, password_hash, full_name, role, is_active, created_at, updated_at
- **`products`** - Produk/layanan yang ditawarkan
  - Kolom: id, name, description, price, category, image_url, is_active, created_at, updated_at
- **`services`** - Layanan tambahan
- **`projects`** - Proyek desain yang sedang berjalan
- **`bookings`** - Pemesanan layanan dari client

## Status Database

✅ **Container Status:**
- PostgreSQL: Running on port 5432
- pgAdmin: Available on port 5050

✅ **Migrasi:** Semua migrasi telah dijalankan
✅ **Data:** Database berisi data produk dan user sample

Lihat file migrasi individual untuk detail lengkap struktur tabel.
