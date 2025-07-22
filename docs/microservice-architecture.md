# Arsitektur Microservice Urgent Studio

## 1. Arsitektur Saat Ini

### 1.1 Struktur Monorepo

Urgent Studio saat ini menggunakan struktur monorepo dengan komponen utama:

- **Frontend**: Next.js 14 dengan TypeScript dan Tailwind CSS
- **Backend**: Go dengan framework Gin
- **Database**: Belum diimplementasikan (masih menggunakan data dummy)

```
urgent-studio-monorepo/
├── frontend/           # Aplikasi Next.js
│   ├── src/
│   │   ├── app/        # Halaman aplikasi
│   │   ├── components/ # Komponen UI
│   │   ├── services/   # Layanan komunikasi dengan backend
│   │   └── ...
├── backend/            # Backend Go dengan Gin
│   ├── main.go         # Entry point dan definisi API
│   ├── admin.go        # Handler admin panel
│   └── ...
└── package.json        # Konfigurasi monorepo
```

### 1.2 Komunikasi Antar Layanan

- **Frontend → Backend**: Komunikasi melalui HTTP REST API menggunakan Axios
- **Backend → Database**: Belum diimplementasikan (masih menggunakan data in-memory)

### 1.3 Endpoint API

Backend menyediakan beberapa endpoint API:

- `GET /api/ping`: Untuk memeriksa koneksi
- `GET /api/orders`: Mendapatkan semua pesanan
- `GET /api/orders/:id`: Mendapatkan pesanan berdasarkan ID
- `POST /api/orders`: Membuat pesanan baru
- `PUT /api/orders/:id/status`: Memperbarui status pesanan

## 2. Rencana Pengembangan Microservice

### 2.1 Pemisahan Layanan

Untuk mendukung ekspansi bisnis dengan 4 jasa desain berbeda, arsitektur akan dikembangkan menjadi:

```
urgent-studio/
├── frontend-service/       # Next.js frontend (UI terpadu)
├── auth-service/           # Layanan autentikasi & manajemen pengguna
├── design-service-1/       # Microservice untuk jasa desain 1
├── design-service-2/       # Microservice untuk jasa desain 2
├── design-service-3/       # Microservice untuk jasa desain 3
├── design-service-4/       # Microservice untuk jasa desain 4
├── payment-service/        # Layanan pembayaran
├── notification-service/   # Layanan notifikasi
└── api-gateway/           # API Gateway untuk routing
```

### 2.2 Strategi Database

Setiap microservice akan memiliki database terpisah:

- **Auth Service**: Database pengguna dan role
- **Design Service 1-4**: Database khusus untuk setiap jasa desain
- **Payment Service**: Database transaksi pembayaran
- **Notification Service**: Database notifikasi dan template

### 2.3 Komunikasi Antar Layanan

- **Synchronous**: REST API untuk komunikasi langsung
- **Asynchronous**: Message Queue (RabbitMQ/Kafka) untuk komunikasi tidak langsung

## 3. Aturan Pengembangan

### 3.1 Standar Kode

#### Frontend
- Gunakan TypeScript untuk semua kode
- Ikuti pola komponen fungsional React
- Gunakan layanan terpisah untuk komunikasi API
- Implementasikan validasi form dengan Zod
- Gunakan React Hook Form untuk manajemen form

#### Backend
- Ikuti prinsip Clean Architecture
- Pisahkan kode menjadi layer (handler, service, repository)
- Gunakan dependency injection
- Implementasikan logging yang konsisten
- Gunakan middleware untuk validasi dan autentikasi

### 3.2 Aturan Dokumentasi

- **Komentar Kode**: Setiap fungsi dan komponen harus memiliki komentar penjelasan
- **API Documentation**: Gunakan Swagger/OpenAPI untuk dokumentasi API
- **README**: Setiap microservice harus memiliki README yang jelas

### 3.3 Aturan Deployment

- Gunakan Docker untuk containerization
- Implementasikan CI/CD pipeline
- Gunakan environment variables untuk konfigurasi
- Implementasikan health check untuk setiap service

## 4. Rencana Implementasi

### 4.1 Fase 1: Refaktor Backend

- Implementasi Clean Architecture di backend Go
- Integrasi database PostgreSQL
- Implementasi autentikasi dan otorisasi

### 4.2 Fase 2: Pemisahan Auth Service

- Implementasi Auth Service terpisah
- Migrasi manajemen pengguna ke Auth Service
- Implementasi JWT untuk autentikasi

### 4.3 Fase 3: Pemisahan Design Service

- Implementasi Design Service 1 untuk jasa desain pertama
- Migrasi data dan logika bisnis terkait

### 4.4 Fase 4: Implementasi Service Tambahan

- Implementasi Design Service 2-4
- Implementasi Payment Service
- Implementasi Notification Service

### 4.5 Fase 5: Implementasi API Gateway

- Implementasi API Gateway dengan Nginx/Traefik
- Konfigurasi routing dan load balancing

## 5. Pertimbangan Infrastruktur

### 5.1 Hosting

- VPS DigitalOcean 2GB RAM untuk awal (Rp 77,500/bulan)
- Skalabilitas horizontal dengan penambahan node sesuai kebutuhan

### 5.2 Monitoring

- Implementasi Prometheus untuk monitoring
- Implementasi Grafana untuk visualisasi
- Implementasi ELK Stack untuk log management

### 5.3 Backup

- Automated backup untuk semua database
- Implementasi disaster recovery plan

## 6. Kesimpulan

Arsitektur microservice yang direncanakan akan mendukung ekspansi bisnis Urgent Studio dengan 4 jasa desain berbeda. Implementasi bertahap akan memastikan transisi yang mulus dari arsitektur monolith saat ini ke arsitektur microservice yang lebih skalabel dan maintainable.