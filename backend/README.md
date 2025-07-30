# Urgent Studio - Backend Service

## Deskripsi

Backend untuk Urgent Studio yang menangani alur jasa satuan. Dibangun dengan Go dan menggunakan database PostgreSQL.

## Fitur

- CRUD operasi untuk jasa satuan (Service Items)
- Pencarian jasa berdasarkan kategori
- RESTful API dengan Gin framework
- Koneksi database PostgreSQL

## Endpoint API

### Jasa Satuan (Service Items)

- `GET /api/services` - Mendapatkan semua jasa satuan
- `GET /api/services/:id` - Mendapatkan jasa satuan berdasarkan ID
- `GET /api/services/category/:category` - Mendapatkan jasa satuan berdasarkan kategori
- `POST /api/services` - Membuat jasa satuan baru
- `PUT /api/services/:id` - Memperbarui jasa satuan
- `DELETE /api/services/:id` - Menghapus jasa satuan

### Lainnya

- `GET /api/health` - Endpoint pemeriksaan kesehatan

## Struktur Data

### Service Item

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "string",
  "duration": "number",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Menjalankan Server

```bash
go run simple_server.go
```

Server akan berjalan pada port 8080.

## Konfigurasi Database

Server menggunakan PostgreSQL dengan konfigurasi default:

```
Host: localhost
Port: 5432
User: postgres
Password: postgres
Database: urgent_studio
```

Pastikan database PostgreSQL sudah berjalan sebelum menjalankan server.

### Migrasi Database

Untuk menjalankan migrasi database, gunakan script berikut:

```bash
cd migrations
./run_migrations.sh
```

Script ini akan membuat database jika belum ada dan menjalankan semua file migrasi secara berurutan.