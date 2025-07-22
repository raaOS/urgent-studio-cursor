# Urgent Studio 2025

Ini adalah proyek Urgent Studio 2025, dibangun dengan Next.js, Go (Gin), dan PostgreSQL.

## Stack Teknologi

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Go (Gin framework)
- **Database**: PostgreSQL

## Setup Development Environment

### Prasyarat

- Node.js 20.x
- Go 1.24.x
- Docker dan Docker Compose
- VSCode dengan ekstensi yang direkomendasikan

### Ekstensi VSCode yang Direkomendasikan

Proyek ini sudah dikonfigurasi dengan rekomendasi ekstensi VSCode. Saat membuka proyek di VSCode, Anda akan melihat notifikasi untuk menginstal ekstensi yang direkomendasikan. Ekstensi ini meliputi:

- ESLint, Prettier, Tailwind CSS IntelliSense (Frontend)
- Go, Go Test Explorer (Backend)
- PostgreSQL, SQLTools (Database)
- GitLens, Docker, Thunder Client (Umum)

### Menjalankan dengan Docker

Cara termudah untuk menjalankan seluruh stack adalah menggunakan Docker Compose:

```bash
# Clone repository
git clone https://github.com/username/urgent-studio-2025.git
cd urgent-studio-2025

# Copy file .env.example ke .env
cp .env.example .env

# Jalankan dengan Docker Compose
docker-compose up -d
```

Ini akan menjalankan:
- Frontend di http://localhost:9005
- Backend di http://localhost:8080
- PostgreSQL di port 5432
- pgAdmin di http://localhost:5050

### Menjalankan Secara Terpisah

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:9005`.

#### Backend

```bash
cd backend
go mod download
go run .
```

Backend akan berjalan di `http://localhost:8080`.

## Monitoring dan Logging

Proyek ini dilengkapi dengan stack monitoring dan logging:

### Monitoring (Prometheus + Grafana)

```bash
cd monitoring
docker-compose up -d
```

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (login: admin/admin)

### Logging (ELK Stack)

```bash
cd logging
docker-compose up -d
```

- Kibana: http://localhost:5601

## CI/CD Pipeline

Proyek ini menggunakan GitHub Actions untuk CI/CD. Pipeline akan menjalankan:

1. Linting dan type checking untuk frontend
2. Build dan test untuk backend
3. Build dan push Docker image (hanya untuk branch main)

## Dokumentasi

Dokumentasi lebih lanjut tersedia di folder `docs/`:

- Arsitektur Microservice
- Pedoman Kode
- Proses Pengambilan Keputusan
- Integrasi Memori AI

## MCP (Memory Control Program) yang Direkomendasikan

- **Docker MCP**: Untuk mengelola container development dan production
- **Hyperbrowser MCP**: Untuk testing UI secara otomatis
- **Fetch MCP**: Untuk akses ke API eksternal selama pengembangan
- **Memory MCP**: Untuk mendukung integrasi memori AI