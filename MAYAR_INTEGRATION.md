# Mayar.id Integration

Dokumentasi lengkap untuk integrasi Mayar.id payment gateway dengan Urgent Studio Official.

## 📋 Overview

Mayar.id adalah payment gateway Indonesia yang menyediakan solusi pembayaran digital untuk bisnis. Integrasi ini memungkinkan Urgent Studio untuk:

- Mengelola produk dan layanan
- Membuat faktur (invoice) otomatis
- Memproses payment request
- Mengelola transaksi pembayaran
- Webhook untuk notifikasi real-time

## 🌐 API URLs

### Official Mayar.id API Endpoints:
- **Production**: `https://api.mayar.id/hl/v1`
- **Sandbox**: `https://api.mayar.club/hl/v1`

### Environment Configuration:
```bash
# Production
MAYAR_ENVIRONMENT=production
MAYAR_BASE_URL=https://api.mayar.id/hl/v1

# Sandbox (Development)
MAYAR_ENVIRONMENT=sandbox
MAYAR_SANDBOX_URL=https://api.mayar.club/hl/v1
```

## 🚀 Features

### ✅ Implemented Features:
1. **Product Management**
   - List all products
   - Filter products by type
   - Search products
   - Product detail view

2. **Invoice Management**
   - Create invoice
   - View invoice details
   - Update invoice status

3. **Payment Request**
   - Create payment request
   - Track payment status

4. **Customer Management**
   - Create customer profile
   - Update customer information

5. **Transaction Tracking**
   - View transaction history
   - Transaction details

6. **Webhook Integration**
   - Real-time payment notifications
   - Secure webhook verification

## 📁 File Structure

### Frontend (`frontend/`)
```
src/
├── components/
│   └── MayarIntegration.tsx      # Main integration component
├── lib/
│   └── mayar-config.ts           # Configuration management
├── services/
│   └── mayar-api.ts              # API client service
├── types/
│   └── mayar.ts                  # TypeScript type definitions
└── app/
    └── mayar-demo/
        └── page.tsx              # Demo page
```

### Backend (`backend/`)
```
├── mayar_config.go               # Configuration management
├── mayar_service.go              # Core service logic
├── mayar_handler.go              # HTTP handlers
├── mayar_routes.go               # Route definitions
└── mayar_types.go                # Go type definitions
```

## ⚙️ Environment Variables

### Required Variables:
```bash
# API Configuration
MAYAR_API_KEY=your_api_key_here
MAYAR_WEBHOOK_SECRET=your_webhook_secret
MAYAR_WEBHOOK_TOKEN=your_webhook_token

# Environment Settings
MAYAR_ENVIRONMENT=sandbox          # or 'production'
MAYAR_BASE_URL=https://api.mayar.id/hl/v1
MAYAR_SANDBOX_URL=https://api.mayar.club/hl/v1

# Frontend Public Variables
NEXT_PUBLIC_MAYAR_ENVIRONMENT=sandbox
NEXT_PUBLIC_MAYAR_BASE_URL=https://api.mayar.id/hl/v1
```

Integrasi lengkap dengan API Mayar.id untuk sistem pembayaran dan manajemen produk.

## 🚀 Fitur

- ✅ **Manajemen Produk**: Browse, filter, dan kelola produk
- ✅ **Invoice System**: Buat dan kelola invoice
- ✅ **Payment Requests**: Generate permintaan pembayaran
- ✅ **Customer Management**: Kelola data pelanggan
- ✅ **Transaction Tracking**: Pantau status transaksi
- ✅ **Webhook Support**: Notifikasi real-time
- ✅ **License Management**: Verifikasi dan aktivasi lisensi
- ✅ **Coupon System**: Kelola diskon dan kupon

## 📁 Struktur File

### Frontend (TypeScript/React)
```
frontend/src/
├── types/mayar.ts              # Definisi tipe TypeScript
├── lib/mayar-config.ts         # Konfigurasi environment
├── services/mayar-api.ts       # API client service
├── components/MayarIntegration.tsx  # Komponen UI utama
└── app/mayar-demo/page.tsx     # Halaman demo
```

### Backend (Go)
```
backend/
├── mayar_config.go             # Konfigurasi environment
├── mayar_types.go              # Definisi struct Go
├── mayar_service.go            # Service layer
├── mayar_handler.go            # HTTP handlers
└── mayar_routes.go             # Route definitions
```

## ⚙️ Konfigurasi Environment

### File .env
```env
# Mayar.id API Configuration
MAYAR_API_KEY=your_api_key_here
MAYAR_WEBHOOK_SECRET=your_webhook_secret
MAYAR_BASE_URL=https://api.mayar.id/hl/v1
MAYAR_WEBHOOK_TOKEN=your_webhook_token
MAYAR_ENVIRONMENT=sandbox
MAYAR_SANDBOX_URL=https://sandbox.mayar.id/hl/v1

# Public Environment Variables (Next.js)
NEXT_PUBLIC_MAYAR_ENVIRONMENT=sandbox
NEXT_PUBLIC_MAYAR_BASE_URL=https://api.mayar.id/hl/v1
```

### Variabel Environment

| Variabel | Deskripsi | Required |
|----------|-----------|----------|
| `MAYAR_API_KEY` | API key dari Mayar.id | ✅ |
| `MAYAR_WEBHOOK_SECRET` | Secret untuk verifikasi webhook | ✅ |
| `MAYAR_BASE_URL` | Base URL API Mayar.id | ✅ |
| `MAYAR_WEBHOOK_TOKEN` | Token untuk webhook authentication | ✅ |
| `MAYAR_ENVIRONMENT` | Environment (sandbox/production) | ✅ |
| `MAYAR_SANDBOX_URL` | URL sandbox untuk testing | ❌ |

## 🔧 Setup dan Instalasi

### 1. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Mayar.id Anda

# Run development server
npm run dev
```

### 2. Backend Setup

```bash
# Install dependencies
cd backend
go mod tidy

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Mayar.id Anda

# Run server
go run main.go
```

### 3. Akses Demo

Buka browser dan kunjungi:
```
http://localhost:3000/mayar-demo
```

## 📚 Penggunaan API

### Frontend (TypeScript)

```typescript
import { MayarApiClient } from '@/services/mayar-api';

const client = new MayarApiClient();

// Get products
const products = await client.getProducts();

// Create invoice
const invoice = await client.createInvoice({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  items: [{
    name: 'Product Name',
    price: 100000,
    quantity: 1
  }]
});

// Create payment request
const paymentRequest = await client.createPaymentRequest({
  amount: 100000,
  description: 'Payment for product',
  customerName: 'John Doe',
  customerEmail: 'john@example.com'
});
```

### Backend (Go)

```go
import "your-project/backend"

// Initialize service
service, err := NewMayarService()
if err != nil {
    log.Fatal(err)
}

// Get products
products, err := service.GetProducts()
if err != nil {
    log.Printf("Error: %v", err)
}

// Create invoice
invoice, err := service.CreateInvoice(CreateInvoiceRequest{
    CustomerName:  "John Doe",
    CustomerEmail: "john@example.com",
    Items: []InvoiceItem{{
        Name:     "Product Name",
        Price:    100000,
        Quantity: 1,
    }},
})
```

## 🎯 Endpoint API

### Products
- `GET /api/mayar/products` - Get all products
- `GET /api/mayar/products/type/:type` - Get products by type
- `GET /api/mayar/products/:id` - Get product by ID
- `POST /api/mayar/products/:id/close` - Close product
- `POST /api/mayar/products/:id/reopen` - Reopen product

### Invoices
- `POST /api/mayar/invoices` - Create invoice
- `GET /api/mayar/invoices/:id` - Get invoice
- `PUT /api/mayar/invoices/:id` - Update invoice
- `DELETE /api/mayar/invoices/:id` - Delete invoice

### Payment Requests
- `POST /api/mayar/payment-requests` - Create payment request
- `GET /api/mayar/payment-requests/:id` - Get payment request

### Customers
- `POST /api/mayar/customers` - Create customer
- `GET /api/mayar/customers/:id` - Get customer
- `PUT /api/mayar/customers/:id` - Update customer

### Transactions
- `GET /api/mayar/transactions` - Get transactions
- `GET /api/mayar/transactions/:id` - Get transaction

### Webhooks
- `POST /api/mayar/webhooks/register` - Register webhook
- `GET /api/mayar/webhooks/history` - Get webhook history
- `POST /api/mayar/webhooks/test` - Test webhook
- `POST /api/mayar/webhooks/retry/:id` - Retry webhook
- `POST /api/mayar/webhooks/handle` - Handle webhook
- `POST /api/mayar/webhooks/verify` - Verify webhook signature

### Licenses
- `POST /api/mayar/licenses/verify` - Verify license
- `POST /api/mayar/licenses/activate` - Activate license
- `POST /api/mayar/licenses/deactivate` - Deactivate license

### Coupons
- `POST /api/mayar/coupons` - Create coupon
- `POST /api/mayar/coupons/apply` - Apply coupon
- `GET /api/mayar/coupons/:code` - Get coupon

## 🔒 Security

### API Key Management
- API key disimpan di environment variables
- Tidak pernah expose API key di frontend
- Gunakan HTTPS untuk semua komunikasi

### Webhook Security
- Verifikasi signature webhook
- Validasi payload webhook
- Rate limiting untuk webhook endpoints

### CORS Configuration
```go
// Backend CORS setup
func SetupMayarMiddleware(r *gin.Engine) {
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
}
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Testing
```bash
cd backend
go test ./...
go test -cover ./...
```

### Manual Testing
1. Buka halaman demo: `http://localhost:3000/mayar-demo`
2. Test semua fitur:
   - Browse products
   - Create invoice
   - Create payment request
   - Check API responses

## 📊 Monitoring

### Logging
- Semua API calls di-log dengan detail
- Error handling dengan informasi lengkap
- Request/response tracking

### Rate Limiting
- Implementasi rate limiting untuk API calls
- Configurable limits per endpoint
- Graceful handling saat limit tercapai

## 🚨 Error Handling

### Frontend
```typescript
try {
  const response = await client.getProducts();
  if (response.data) {
    setProducts(response.data);
  } else {
    setError(response.messages || 'Failed to fetch products');
  }
} catch (error) {
  setError(error instanceof Error ? error.message : 'An error occurred');
}
```

### Backend
```go
func (h *MayarHandler) GetProducts(c *gin.Context) {
    products, err := h.service.GetProducts()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "error": "Failed to fetch products",
            "details": err.Error(),
        })
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "data": products,
        "success": true,
    })
}
```

## 📖 Dokumentasi API Mayar.id

Untuk dokumentasi lengkap API Mayar.id, silakan kunjungi:
- [Mayar.id API Documentation](https://docs.mayar.id)
- [Mayar.id Developer Portal](https://developer.mayar.id)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.

## 📞 Support

Untuk bantuan dan support:
- Email: support@mayar.id
- Documentation: https://docs.mayar.id
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

---

**Note**: Pastikan untuk menggunakan environment sandbox untuk testing dan development. Jangan gunakan API key production di environment development.