# 🚀 Mayar.id API Setup Guide

## ⚡ Quick Start

### 1. Environment Variables Setup

**Copy file `.env.example` ke `.env`:**
```bash
cp .env.example .env
```

**Update konfigurasi Mayar di `.env`:**

```bash
# Mayar.id Payment Gateway (Production)
MAYAR_API_KEY=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiMTJmMTEyYS0zMTM5LTRjZjktYjVkNC1iMWJhYzVjOTRiMjgiLCJhY2NvdW50SWQiOiI1ZmFhNjU1NC0yZjQwLTRmYWMtOWQ5Ni1iMjAxY2MzM2E0NjgiLCJjcmVhdGVkQXQiOiIxNzUzNzcwNzQwOTE5Iiwicm9sZSI6ImRldmVsb3BlciIsInN1YiI6InJhLjkyMDcxMEBnbWFpbC5jb20iLCJuYW1lIjoidXJnZW50IHN0dWRpbyIsImxpbmsiOiJ1cmdlbnQtc3R1ZGlvIiwiaXNTZWxmRG9tYWluIjpudWxsLCJpYXQiOjE3NTM3NzA3NDB9.ZLGUM-JQCYH2SRb693bdtcKUGpG9kCSHVYlz9cWs0miEf0QCX3W9btTkSLoP0chIiyteOIcxP2vpfTJ0I6Qhsm0jYO99Ap0rB4GpaISg6YOt3nriKqDAGvhfBbD5-wkmlS6BHrZB0zn9Svijay_nxy9eJQYsPCD_DxguBYaBQD395PumsZ5luB-YrDgjTF7zD_MjvXr5KGTf0H1MjMDRYbMP9_xKeY_q1bKn1tB-H5N_qKHGTvyT5wXGZXjaiJqExPbYqpmd8IewGeA33RZ4lwEsUrmpuiZvEWSiCAAfXP5hA64iCgHLsQ1EKv4G1kwHGQ7VYq8nfbLVdwTmHZExTg
MAYAR_WEBHOOK_SECRET=urgent2025
MAYAR_WEBHOOK_TOKEN=de9874f578f4579e60d06ca0699770d261094ddf5a1f1dd2541b5f008a4c1d9235a141b9cc3abe9ac8ec45d7d5aa370944c0b96378c77d64149a1bfd467c4126
MAYAR_BASE_URL=https://api.mayar.id/hl/v1
MAYAR_ENVIRONMENT=production
MAYAR_SANDBOX_URL=https://api.mayar.club/hl/v1
```

### 2. Switch ke Sandbox Environment

**Untuk testing, ubah ke sandbox:**
```bash
MAYAR_ENVIRONMENT=sandbox
MAYAR_BASE_URL=https://api.mayar.club/hl/v1
MAYAR_API_KEY=<your-sandbox-api-key>
```

## 🔍 Testing API

### Test Connection
```bash
curl -H "Authorization: Bearer $MAYAR_API_KEY" \
     "$MAYAR_BASE_URL/transactions?page=1&pageSize=5"
```

### Test dengan Backend
```bash
# Jalankan backend
cd backend && go run .

# Test endpoint
curl "http://localhost:8080/api/mayar/transactions?page=1&pageSize=5"
```

## 📁 File Konfigurasi

| File | Lokasi | Keterangan |
|------|--------|------------|
| `.env` | Root project | Environment aktif |
| `.env.example` | Root project | Template konfigurasi |
| `mayar_config.go` | `backend/` | Konfigurasi Go |
| `mayar_service.go` | `backend/` | Logic API Mayar |

## 🚨 Troubleshooting

### Error 401 Unauthorized
- Periksa `MAYAR_API_KEY` di `.env`
- Pastikan menggunakan API key yang benar (production/sandbox)
- Cek expiration date token

### Error 404 Not Found
- Pastikan `MAYAR_BASE_URL` benar:
  - Production: `https://api.mayar.id/hl/v1`
  - Sandbox: `https://api.mayar.club/hl/v1`

### Error 500 Internal Server Error
- Cek log backend: `backend/logs/`
- Pastikan semua environment variables ter-set
- Restart backend setelah update `.env`

## 🔄 Update API Key

1. Dapatkan API key baru dari Mayar.id dashboard
2. Update `MAYAR_API_KEY` di `.env`
3. Restart backend: `cd backend && go run .`
4. Test kembali

## 📖 Dokumentasi Lengkap

- [Mayar Integration Guide](docs/mayar-id-integration.md)
- [API Documentation](https://docs.mayar.id/)
- [Webhook Setup](MAYAR_INTEGRATION.md)

## 💡 Tips

- **Development**: Gunakan sandbox untuk testing
- **Production**: Pastikan menggunakan production API key
- **Backup**: Simpan API key di password manager
- **Monitoring**: Monitor response time dan error rate

## 🎯 Quick Commands

```bash
# Restart services
./mulai.sh

# Test API
curl -H "Authorization: Bearer $MAYAR_API_KEY" $MAYAR_BASE_URL/ping

# Check logs
tail -f backend/logs/app.log
```