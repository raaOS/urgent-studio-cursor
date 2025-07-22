# Rencana Ekspansi Bisnis Urgent Studio

## 1. Situasi Saat Ini

### 1.1 Model Bisnis

Urgent Studio saat ini menawarkan jasa desain dengan tiga tier harga:

- **Budget Kaki Lima**: Rp 25.000
  - Untuk kebutuhan desain cepat
  - 1 konsep awal, 2x revisi ringan
  - File JPG, PNG (siap pakai)

- **Budget UMKM**: Rp 50.000
  - Pilihan paling populer untuk bisnis yang sudah mulai marketing
  - 2 konsep awal, 3x revisi ringan
  - File JPG, PNG, PDF, file mentah (AI, PSD)
  - Fleksibilitas edit sendiri
  - Sesi G-Meet (jika diperlukan)

- **Budget E-commerce**: Rp 100.000
  - Untuk proyek strategis branding atau kebutuhan UKM kompleks
  - 2 konsep awal, 3x revisi (1x besar + 2x ringan)
  - File JPG, PNG, PDF, file mentah (AI, PSD)
  - Fleksibilitas edit sendiri
  - Sesi G-Meet untuk 1x revisi Besar

### 1.2 Layanan Saat Ini

Layanan desain yang ditawarkan meliputi:

- Logo Design
- Business Card
- Letterhead
- Envelope Design
- Sticker Design
- Poster Design
- Flyer Design
- Brochure Design
- Banner Design
- Social Media Post
- Instagram Story Template
- Facebook Cover
- YouTube Thumbnail
- Website Mockup
- App Icon
- Packaging Design
- T-shirt Design
- Presentation Template
- Invoice Template

### 1.3 Teknologi Saat Ini

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Go dengan Gin framework
- **Database**: Belum diimplementasikan (masih menggunakan data dummy)
- **Deployment**: Belum diimplementasikan untuk production

## 2. Rencana Ekspansi Bisnis

### 2.1 Empat Jasa Desain Berbeda

#### 2.1.1 Jasa Desain 1: Desain Grafis Dasar

- **Target Pasar**: UMKM, startup, content creator
- **Layanan**:
  - Logo dan identitas visual
  - Desain media sosial
  - Desain marketing material (flyer, brosur, poster)
  - Desain merchandise
- **Fitur Khusus**:
  - Template gallery
  - AI-assisted design suggestion
  - Revisi cepat

#### 2.1.2 Jasa Desain 2: Desain UI/UX

- **Target Pasar**: Startup teknologi, developer, agensi digital
- **Layanan**:
  - Wireframing
  - Prototyping
  - UI design untuk web dan mobile
  - Design system
- **Fitur Khusus**:
  - Kolaborasi dengan developer
  - Handoff tools
  - Component library
  - Usability testing

#### 2.1.3 Jasa Desain 3: Desain Packaging & Branding

- **Target Pasar**: UMKM F&B, produsen produk fisik, brand baru
- **Layanan**:
  - Desain kemasan
  - Brand identity
  - Label produk
  - Merchandise branding
- **Fitur Khusus**:
  - 3D mockup
  - Print-ready files
  - Material recommendation
  - Compliance check

#### 2.1.4 Jasa Desain 4: Desain Marketing & Advertising

- **Target Pasar**: Marketing agency, brand established, campaign manager
- **Layanan**:
  - Campaign visual
  - Advertising material
  - Social media campaign
  - Marketing collateral
- **Fitur Khusus**:
  - A/B testing visual
  - Multi-platform adaptation
  - Analytics integration
  - Campaign performance tracking

### 2.2 Pemisahan Database

Setiap jasa desain akan memiliki database terpisah untuk:

- **Isolasi Data**: Memastikan data setiap jasa tidak saling mempengaruhi
- **Skalabilitas**: Memungkinkan setiap jasa untuk berkembang secara independen
- **Keamanan**: Membatasi akses data hanya untuk tim yang relevan
- **Performa**: Mengoptimalkan query dan operasi database sesuai kebutuhan spesifik

### 2.3 Pemisahan Role

Implementasi Role-Based Access Control (RBAC) dengan role:

- **Admin**: Akses penuh ke semua jasa dan data
- **Service Manager**: Mengelola satu jasa desain spesifik
- **Designer**: Akses ke proyek yang ditugaskan
- **Customer**: Akses ke proyek dan pesanan sendiri

## 3. Strategi Implementasi Microservice

### 3.1 Arsitektur Target

```
urgent-studio/
├── api-gateway/                # Nginx/Traefik untuk routing
├── frontend-service/           # Next.js frontend (UI terpadu)
├── auth-service/               # Autentikasi & manajemen pengguna
│
├── design-service-1/           # Microservice Desain Grafis Dasar
│   ├── api/                    # API endpoints
│   ├── service/                # Business logic
│   ├── repository/             # Data access
│   └── database/               # Database khusus
│
├── design-service-2/           # Microservice Desain UI/UX
│   ├── api/                    # API endpoints
│   ├── service/                # Business logic
│   ├── repository/             # Data access
│   └── database/               # Database khusus
│
├── design-service-3/           # Microservice Desain Packaging & Branding
│   ├── api/                    # API endpoints
│   ├── service/                # Business logic
│   ├── repository/             # Data access
│   └── database/               # Database khusus
│
├── design-service-4/           # Microservice Desain Marketing & Advertising
│   ├── api/                    # API endpoints
│   ├── service/                # Business logic
│   ├── repository/             # Data access
│   └── database/               # Database khusus
│
├── payment-service/            # Layanan pembayaran
├── notification-service/       # Layanan notifikasi
└── file-storage-service/       # Layanan penyimpanan file
```

### 3.2 Implementasi Bertahap

#### Fase 1: Refaktor Backend & Implementasi Database (2-3 bulan)

- Refaktor backend Go dengan Clean Architecture
- Implementasi PostgreSQL untuk database
- Implementasi autentikasi dan otorisasi dasar
- Migrasi data dummy ke database

#### Fase 2: Implementasi Auth Service & Jasa Desain 1 (2-3 bulan)

- Implementasi Auth Service terpisah
- Implementasi Jasa Desain 1 (Desain Grafis Dasar)
- Migrasi fitur dan data terkait
- Implementasi RBAC

#### Fase 3: Implementasi Jasa Desain 2 & Payment Service (2-3 bulan)

- Implementasi Jasa Desain 2 (Desain UI/UX)
- Implementasi Payment Service
- Integrasi dengan gateway pembayaran
- Implementasi invoice dan receipt

#### Fase 4: Implementasi Jasa Desain 3 & Notification Service (2-3 bulan)

- Implementasi Jasa Desain 3 (Desain Packaging & Branding)
- Implementasi Notification Service
- Integrasi dengan email dan SMS gateway
- Implementasi template notifikasi

#### Fase 5: Implementasi Jasa Desain 4 & File Storage Service (2-3 bulan)

- Implementasi Jasa Desain 4 (Desain Marketing & Advertising)
- Implementasi File Storage Service
- Integrasi dengan cloud storage
- Implementasi versioning dan backup

#### Fase 6: Implementasi API Gateway & Monitoring (1-2 bulan)

- Implementasi API Gateway dengan Nginx/Traefik
- Implementasi monitoring dan logging
- Implementasi CI/CD pipeline
- Implementasi disaster recovery

### 3.3 Teknologi Stack

#### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS, ShadCN UI
- **State Management**: React Context, React Query
- **Form Handling**: React Hook Form, Zod

#### Backend

- **Language**: Go
- **Framework**: Gin, Echo, atau Fiber
- **Database**: PostgreSQL
- **ORM**: GORM atau SQLx
- **Authentication**: JWT, OAuth2
- **API Documentation**: Swagger/OpenAPI

#### Infrastructure

- **Containerization**: Docker
- **Orchestration**: Docker Compose (awal), Kubernetes (future)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack
- **API Gateway**: Nginx/Traefik

## 4. Pertimbangan Biaya dan Sumber Daya

### 4.1 Infrastruktur

#### VPS Requirements

- **Awal (1-2 Jasa)**:
  - DigitalOcean 2GB RAM (Rp 77,500/bulan)
  - 1 CPU, 50GB SSD
  - Cukup untuk traffic awal

- **Menengah (3-4 Jasa)**:
  - DigitalOcean 4GB RAM (Rp 155,000/bulan)
  - 2 CPU, 80GB SSD
  - Load balancer basic (Rp 77,500/bulan)

- **Lanjutan (Skala Besar)**:
  - Multiple VPS 4GB RAM (2-3 instance)
  - Load balancer
  - Managed database (Rp 155,000/bulan)
  - Total: Rp 500,000 - 700,000/bulan

### 4.2 Strategi Optimasi Biaya

- **Autoscaling**: Scale up/down berdasarkan traffic
- **Reserved Instances**: Untuk komponen core yang selalu running
- **Caching**: Implementasi Redis untuk mengurangi beban database
- **CDN**: Untuk static assets dan file
- **Database Optimization**: Indexing, query optimization, connection pooling

### 4.3 Timeline dan Milestone

- **Milestone 1** (Bulan 3): Backend refactored, database implemented
- **Milestone 2** (Bulan 6): Auth Service & Jasa Desain 1 live
- **Milestone 3** (Bulan 9): Jasa Desain 2 & Payment Service live
- **Milestone 4** (Bulan 12): Jasa Desain 3 & Notification Service live
- **Milestone 5** (Bulan 15): Jasa Desain 4 & File Storage Service live
- **Milestone 6** (Bulan 18): Full microservice architecture with monitoring

## 5. Kesimpulan

Rencana ekspansi bisnis Urgent Studio dengan 4 jasa desain berbeda memerlukan transformasi arsitektur dari monolith ke microservice. Implementasi bertahap selama 12-18 bulan akan memastikan transisi yang mulus tanpa mengganggu layanan yang ada. Pemisahan database dan role akan mendukung isolasi data dan manajemen akses yang lebih baik, sementara arsitektur microservice akan memberikan skalabilitas dan fleksibilitas untuk pertumbuhan di masa depan.