# 🚀 Urgent Studio - Development Setup (Tanpa Docker)

## 📋 **Persyaratan**

- macOS dengan Homebrew
- Go 1.19+
- Node.js 18+
- PostgreSQL (akan diinstall otomatis)

## ⚡ **Quick Start (3 Perintah)**

```bash
# 1. Install PostgreSQL (sekali saja)
brew install postgresql

# 2. Mulai development
./mulai.sh

# 3. Stop development
./stop.sh
```

## 🔧 **Setup Detail**

### **1. Install Dependencies**
```bash
# Install PostgreSQL
brew install postgresql
brew services start postgresql@14

# Install Go dependencies
cd backend && go mod tidy

# Install Node dependencies
cd frontend && npm install
```

### **2. Database Setup**
```bash
# Buat database
createdb urgent_studio

# Jalankan migrasi
psql -d urgent_studio -f database/migrations/001_initial_schema.sql
psql -d urgent_studio -f database/migrations/002_products_schema.sql
psql -d urgent_studio -f database/migrations/005_add_users_is_active.sql
psql -d urgent_studio -f database/migrations/006_add_updated_at_columns.sql

# Load sample data (opsional)
psql -d urgent_studio -f database/seed/real_products_data_fixed.sql
```

### **3. Environment Variables**
File `.env.local` sudah dikonfigurasi untuk development lokal:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=bitlabsacademy
DB_PASSWORD=
DB_NAME=urgent_studio
DB_SSLMODE=disable
PORT=8080
ENV=development
```

## 🎯 **Perintah Development**

### **Mulai Semua Service**
```bash
./mulai.sh                    # Backend saja
./mulai.sh seed              # Backend + sample data
./mulai.sh seed frontend     # Backend + Frontend + sample data
```

### **Stop Semua Service**
```bash
./stop.sh                    # Stop backend & frontend
./stop.sh all               # Stop semua termasuk PostgreSQL
```

### **Manual Commands**
```bash
# Backend saja
cd backend && source ../.env.local && go run .

# Frontend saja
cd frontend && npm run dev

# Database management
psql -d urgent_studio        # Akses database
```

## 🧪 **Testing**

```bash
# Test API
curl http://localhost:8080/api/health
curl http://localhost:8080/api/users
curl http://localhost:8080/api/products

# Test dengan data
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","fullName":"Test User","password":"password123"}'
```

## 📊 **URLs Development**

- **Backend API**: http://localhost:8080
- **Frontend**: http://localhost:3000
- **Database**: PostgreSQL lokal (port 5432)
- **API Docs**: http://localhost:8080/api/health

## 🔍 **Database Management**

```bash
# Akses database
psql -d urgent_studio

# Lihat tabel
\dt

# Lihat struktur tabel
\d users
\d products

# Query data
SELECT * FROM users;
SELECT * FROM products;
```

## 🚨 **Troubleshooting**

### **PostgreSQL tidak bisa start**
```bash
brew services restart postgresql@14
brew services list | grep postgres
```

### **Database tidak ada**
```bash
createdb urgent_studio
psql -l | grep urgent_studio
```

### **Backend error "column not exist"**
```bash
# Jalankan ulang migrasi
psql -d urgent_studio -f database/migrations/005_add_users_is_active.sql
psql -d urgent_studio -f database/migrations/006_add_updated_at_columns.sql
```

### **Port sudah digunakan**
```bash
# Cek proses yang menggunakan port
lsof -i :8080
lsof -i :3000

# Kill proses
./stop.sh
```

## 🎉 **Keuntungan Tanpa Docker**

✅ **Lebih Cepat**: Startup 3-5 detik vs 30-60 detik  
✅ **Lebih Stabil**: Tidak ada masalah container crash  
✅ **Lebih Ringan**: RAM usage 50% lebih rendah  
✅ **Debugging Mudah**: Direct access ke database  
✅ **Hot Reload**: Instant code changes  

## 📝 **Development Workflow**

1. **Mulai hari**: `./mulai.sh`
2. **Coding**: Edit files, auto-reload aktif
3. **Test API**: Gunakan curl atau Postman
4. **Database**: Akses langsung dengan `psql -d urgent_studio`
5. **Selesai**: `./stop.sh`

---

**🎯 Sekarang development jadi lebih simple dan reliable!**