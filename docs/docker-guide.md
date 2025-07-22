# Panduan Docker untuk Urgent Studio 2025

Dokumen ini menjelaskan cara menggunakan Docker dan Docker Compose untuk pengembangan Urgent Studio 2025.

## Prasyarat

- Docker Desktop terinstal (untuk Windows/Mac) atau Docker Engine (untuk Linux)
- Docker Compose terinstal (biasanya sudah termasuk dalam Docker Desktop)
- Akses ke repository Urgent Studio 2025

## Struktur Docker

Urgent Studio 2025 menggunakan pendekatan multi-container dengan Docker Compose. Berikut adalah layanan utama yang didefinisikan:

1. **Frontend** - Aplikasi Next.js
2. **Backend** - API Go dengan Gin framework
3. **Database** - PostgreSQL
4. **pgAdmin** - (Opsional) Antarmuka web untuk PostgreSQL

## Menjalankan Lingkungan Pengembangan

### Langkah 1: Clone Repository

```bash
git clone https://github.com/username/urgent-studio-2025.git
cd urgent-studio-2025
```

### Langkah 2: Setup Environment Variables

Salin file `.env.example` ke `.env` dan sesuaikan jika diperlukan:

```bash
cp .env.example .env
```

Variabel lingkungan yang penting:

```
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FRONTEND_URL=http://localhost:9005

# Backend
GIN_MODE=debug
DB_HOST=postgres
DB_PORT=5432
DB_USER=urgent
DB_PASSWORD=studio2025
DB_NAME=urgent_studio
JWT_SECRET=your-secret-key

# Database
POSTGRES_USER=urgent
POSTGRES_PASSWORD=studio2025
POSTGRES_DB=urgent_studio
```

### Langkah 3: Jalankan dengan Docker Compose

```bash
docker-compose up -d
```

Perintah ini akan:
1. Build image untuk frontend dan backend (jika belum ada)
2. Menjalankan semua layanan dalam mode detached
3. Membuat volume untuk data PostgreSQL
4. Mengatur jaringan antar container

### Langkah 4: Verifikasi Layanan Berjalan

```bash
docker-compose ps
```

Anda seharusnya melihat semua layanan dalam status "Up".

### Langkah 5: Akses Aplikasi

- Frontend: http://localhost:9005
- Backend API: http://localhost:8080
- pgAdmin (jika diaktifkan): http://localhost:5050
  - Login: admin@urgentstu.dio
  - Password: admin

## Perintah Docker Compose Umum

### Melihat Log

```bash
# Semua layanan
docker-compose logs -f

# Layanan spesifik
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f postgres
```

### Menghentikan Layanan

```bash
docker-compose stop
```

### Menghentikan dan Menghapus Container

```bash
docker-compose down
```

### Menghentikan, Menghapus Container, dan Volume

```bash
docker-compose down -v
```

**Catatan**: Perintah ini akan menghapus semua data dalam database. Gunakan dengan hati-hati.

### Membangun Ulang Image

```bash
docker-compose build
```

### Membangun Ulang dan Menjalankan

```bash
docker-compose up -d --build
```

## Mengakses Container

### Shell ke Container

```bash
# Frontend
docker-compose exec frontend sh

# Backend
docker-compose exec backend sh

# Database
docker-compose exec postgres bash
```

### Menjalankan Perintah dalam Container

```bash
# Menjalankan migrasi database
docker-compose exec backend go run migrations/migrate.go

# Menjalankan test backend
docker-compose exec backend go test ./...

# Menjalankan npm command di frontend
docker-compose exec frontend npm run lint
```

## Struktur Dockerfile

### Frontend Dockerfile

Frontend menggunakan pendekatan multi-stage build untuk optimasi:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 9005
CMD ["npm", "start"]
```

### Backend Dockerfile

Backend menggunakan image Go Alpine untuk build yang ringan:

```dockerfile
FROM golang:1.24-alpine
WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
```

## Penggunaan Volume

Docker Compose menggunakan volume untuk menyimpan data persisten:

- `postgres_data`: Menyimpan data PostgreSQL
- `node_modules`: (Opsional) Untuk caching node_modules frontend

## Jaringan Docker

Semua container terhubung ke jaringan yang sama, memungkinkan komunikasi antar layanan menggunakan nama layanan sebagai hostname:

- Backend dapat terhubung ke database dengan hostname `postgres`
- Frontend dapat terhubung ke backend dengan hostname `backend`

## Penggunaan dalam CI/CD

Docker Compose juga digunakan dalam pipeline CI/CD:

```yaml
# Contoh langkah dalam GitHub Actions
- name: Build and test with Docker Compose
  run: |
    docker-compose -f docker-compose.ci.yml up -d
    docker-compose -f docker-compose.ci.yml exec -T backend go test ./...
    docker-compose -f docker-compose.ci.yml exec -T frontend npm run test
```

## Monitoring dan Logging

Untuk monitoring dan logging, Urgent Studio 2025 menggunakan stack terpisah:

### Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

Ini akan menjalankan:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000
- Node Exporter
- cAdvisor

### Logging Stack

```bash
cd logging
docker-compose up -d
```

Ini akan menjalankan:
- Elasticsearch
- Logstash
- Kibana: http://localhost:5601
- Filebeat

## Troubleshooting

### Masalah Umum

1. **Port Conflicts**
   
   Jika port sudah digunakan, ubah mapping port di `docker-compose.yml`:
   ```yaml
   ports:
     - "9006:9005"  # Ubah 9005 ke 9006 di host
   ```

2. **Database Connection Issues**
   
   Pastikan variabel lingkungan database dikonfigurasi dengan benar di `.env`.

3. **Container Tidak Berjalan**
   
   Periksa log untuk error:
   ```bash
   docker-compose logs -f [service_name]
   ```

4. **Volume Permission Issues**
   
   Jika mengalami masalah izin dengan volume:
   ```bash
   sudo chown -R $USER:$USER ./postgres_data
   ```

## Praktik Terbaik

1. **Jangan Menyimpan Kredensial di Image**
   
   Selalu gunakan variabel lingkungan atau secrets untuk kredensial.

2. **Gunakan .dockerignore**
   
   Tambahkan file yang tidak perlu ke `.dockerignore` untuk mempercepat build.

3. **Optimasi Image Size**
   
   Gunakan multi-stage builds dan alpine images untuk mengurangi ukuran image.

4. **Backup Volume Data**
   
   Backup data PostgreSQL secara teratur:
   ```bash
   docker-compose exec postgres pg_dump -U urgent urgent_studio > backup.sql
   ```

5. **Monitoring Resource**
   
   Pantau penggunaan resource container:
   ```bash
   docker stats
   ```

## Referensi

- [Dokumentasi Docker](https://docs.docker.com/)
- [Dokumentasi Docker Compose](https://docs.docker.com/compose/)
- [Dokumentasi PostgreSQL](https://www.postgresql.org/docs/)
- [Dokumentasi Next.js](https://nextjs.org/docs)
- [Dokumentasi Go](https://golang.org/doc/)