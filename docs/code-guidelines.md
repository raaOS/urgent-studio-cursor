# Pedoman Pengembangan Kode Urgent Studio

## 1. Prinsip Umum

### 1.1 Kualitas Kode

- **Readability First**: Kode harus mudah dibaca dan dipahami oleh programmer lain
- **KISS (Keep It Simple, Stupid)**: Hindari kompleksitas yang tidak perlu
- **DRY (Don't Repeat Yourself)**: Hindari duplikasi kode
- **SOLID Principles**: Ikuti prinsip SOLID dalam pengembangan

### 1.2 Komentar Kode

Setiap kode yang dibuat harus memiliki komentar penjelas (explanatory/contextual comment) untuk memudahkan pemahaman. Contoh format komentar:

#### Frontend (TypeScript/JavaScript)

```typescript
/**
 * @component OrderForm
 * @description Komponen form untuk membuat atau mengedit pesanan
 * @param {Order} initialData - Data awal untuk form (opsional)
 * @param {Function} onSubmit - Callback yang dipanggil saat form disubmit
 * @param {boolean} isLoading - Status loading untuk menampilkan indikator
 */
export function OrderForm({ initialData, onSubmit, isLoading }: OrderFormProps) {
  // Kode komponen
}

// Komentar kontekstual untuk menjelaskan logika kompleks
// Contoh: Validasi form dengan kondisi khusus
const validateForm = () => {
  // Validasi dasar untuk semua field
  if (!formData.name) return false;
  
  // Validasi khusus untuk jenis desain logo
  // Memerlukan minimal 3 referensi dan deskripsi detail
  if (formData.designType === 'logo' && 
      (!formData.references || formData.references.length < 3 || 
       !formData.detailedDescription)) {
    return false;
  }
  
  return true;
};
```

#### Backend (Go)

```go
// OrderHandler menangani endpoint terkait pesanan
// Menyediakan fungsi untuk membuat, mengambil, dan memperbarui pesanan
type OrderHandler struct {
	orderService OrderService
}

// NewOrderHandler membuat instance baru OrderHandler
// dengan dependency injection orderService
func NewOrderHandler(orderService OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
	}
}

// GetOrderByID menangani request GET untuk mengambil pesanan berdasarkan ID
// Route: GET /api/orders/:id
// Response: 200 OK dengan data pesanan atau 404 Not Found
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	// Ekstrak ID dari parameter URL
	id := c.Param("id")
	
	// Panggil service untuk mendapatkan pesanan
	// Komentar kontekstual: Kita perlu validasi ID sebelum query ke database
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
		return
	}
	
	order, err := h.orderService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}
	
	c.JSON(http.StatusOK, order)
}
```

## 2. Standar Kode Frontend

### 2.1 Struktur Folder

```
src/
├── app/                # Halaman aplikasi (Next.js App Router)
├── components/         # Komponen UI reusable
│   ├── ui/             # Komponen UI dasar (button, input, dll)
│   └── [feature]/      # Komponen spesifik fitur
├── hooks/              # Custom React hooks
├── lib/                # Utilitas dan helper functions
├── services/           # Layanan komunikasi dengan API
└── types/              # Type definitions
```

### 2.2 Penamaan

- **Files**: Gunakan kebab-case untuk file komponen (`order-form.tsx`)
- **Components**: Gunakan PascalCase (`OrderForm`)
- **Functions**: Gunakan camelCase (`getOrderById`)
- **Variables**: Gunakan camelCase (`orderData`)
- **Constants**: Gunakan UPPER_SNAKE_CASE (`API_URL`)
- **Types/Interfaces**: Gunakan PascalCase (`OrderFormProps`)

### 2.3 Styling

- Gunakan Tailwind CSS untuk styling
- Gunakan ShadCN UI untuk komponen dasar
- Ikuti design system yang telah ditentukan
- Gunakan CSS Modules untuk styling khusus

### 2.4 State Management

- Gunakan React Context untuk state global sederhana
- Gunakan React Query untuk state server
- Hindari prop drilling dengan custom hooks

## 3. Standar Kode Backend

### 3.1 Struktur Folder

```
backend/
├── cmd/                # Entry points aplikasi
│   └── server/         # Server HTTP
├── internal/           # Kode internal yang tidak di-export
│   ├── api/            # API handlers
│   ├── service/        # Business logic
│   ├── repository/     # Data access
│   └── model/          # Domain models
├── pkg/                # Kode yang bisa di-reuse
│   ├── auth/           # Authentication utilities
│   ├── logger/         # Logging utilities
│   └── validator/      # Validation utilities
└── config/             # Konfigurasi aplikasi
```

### 3.2 Penamaan

- **Files**: Gunakan snake_case untuk file Go (`order_handler.go`)
- **Functions**: Gunakan PascalCase untuk exported functions (`GetOrderByID`)
- **Variables**: Gunakan camelCase untuk local variables (`orderID`)
- **Interfaces**: Gunakan PascalCase dengan suffix -er (`OrderRepository`)
- **Structs**: Gunakan PascalCase (`Order`)

### 3.3 Error Handling

- Selalu periksa error dan tangani dengan tepat
- Gunakan custom error types untuk error domain-specific
- Log error dengan level yang sesuai
- Jangan expose internal error ke response API

### 3.4 Database

- Gunakan prepared statements untuk query database
- Implementasikan transaction untuk operasi yang membutuhkan atomicity
- Gunakan index untuk query yang sering digunakan
- Implementasikan pagination untuk data yang besar

## 4. API Design

### 4.1 RESTful API

- Gunakan noun untuk resource (`/orders` bukan `/getOrders`)
- Gunakan HTTP methods dengan benar (GET, POST, PUT, DELETE)
- Gunakan HTTP status codes dengan benar
- Implementasikan versioning API (`/api/v1/orders`)

### 4.2 Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "error": null
}
```

### 4.3 Error Response

```json
{
  "success": false,
  "data": null,
  "message": "Operation failed",
  "error": "Invalid input data",
  "details": { ... }
}
```

## 5. Testing

### 5.1 Frontend Testing

- Implementasikan unit tests untuk komponen dengan Jest dan React Testing Library
- Implementasikan integration tests untuk halaman
- Implementasikan E2E tests dengan Cypress untuk flow utama

### 5.2 Backend Testing

- Implementasikan unit tests untuk setiap package
- Implementasikan integration tests untuk API endpoints
- Gunakan mocking untuk dependencies

## 6. Security

### 6.1 Authentication & Authorization

- Implementasikan JWT untuk autentikasi
- Implementasikan RBAC (Role-Based Access Control)
- Validasi semua input user

### 6.2 Data Protection

- Enkripsi data sensitif
- Implementasikan HTTPS
- Hindari menyimpan credentials di kode

## 7. Performance

### 7.1 Frontend Performance

- Implementasikan lazy loading untuk komponen besar
- Optimasi bundle size dengan code splitting
- Implementasikan caching untuk data yang jarang berubah

### 7.2 Backend Performance

- Implementasikan caching untuk query database yang sering digunakan
- Optimasi query database
- Implementasikan rate limiting untuk API endpoints

## 8. Deployment

### 8.1 CI/CD

- Implementasikan automated testing di CI pipeline
- Implementasikan automated deployment
- Implementasikan rollback mechanism

### 8.2 Environment

- Gunakan environment variables untuk konfigurasi
- Pisahkan konfigurasi untuk development, staging, dan production
- Implementasikan logging yang sesuai untuk setiap environment

## 9. Monitoring

### 9.1 Logging

- Log semua error dengan level yang sesuai
- Implementasikan structured logging
- Implementasikan log rotation

### 9.2 Metrics

- Monitor response time untuk API endpoints
- Monitor resource usage (CPU, memory, disk)
- Implementasikan alerting untuk metrics yang kritis