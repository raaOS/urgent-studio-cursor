# Database Urgent Studio

Folder ini berisi semua file terkait database untuk proyek Urgent Studio, termasuk migrasi, seed data, dan dokumentasi ERD.

## Struktur Folder

- `/migrations` - File SQL untuk migrasi database
- `/seed` - File SQL untuk mengisi data awal
- `/docs` - Dokumentasi database (ERD, skema, dll)

## Cara Menggunakan

### Migrasi Database

File migrasi dijalankan secara otomatis saat container PostgreSQL pertama kali dijalankan melalui docker-compose. Untuk menjalankan migrasi secara manual:

```bash
psql -U postgres -d urgent_studio -f migrations/001_initial_schema.sql
```

### Seed Data

Untuk mengisi database dengan data sampel:

```bash
psql -U postgres -d urgent_studio -f seed/001_sample_data.sql
```

### Menggunakan pgAdmin

PgAdmin disertakan dalam docker-compose untuk memudahkan manajemen database:

1. Akses pgAdmin di http://localhost:5050
2. Login dengan:
   - Email: admin@urgentstudio.com
   - Password: admin
3. Tambahkan server baru dengan:
   - Nama: Urgent Studio
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres

## Skema Database

Database terdiri dari tabel-tabel berikut:

- `users` - Informasi pengguna (admin, designer, client)
- `projects` - Proyek desain
- `services` - Layanan yang ditawarkan
- `bookings` - Pemesanan layanan

Lihat file migrasi untuk detail lengkap struktur tabel.
