# Pedoman Komentar Kode Urgent Studio

## 1. Tujuan

Dokumen ini menjelaskan standar dan praktik terbaik untuk menulis komentar kode di proyek Urgent Studio. Tujuan utama dari pedoman ini adalah untuk memastikan bahwa:

- Kode mudah dipahami oleh programmer lain
- Dokumentasi kode konsisten di seluruh proyek
- Komentar memberikan konteks yang berguna, bukan hanya mengulangi kode
- Keputusan desain dan algoritma kompleks terdokumentasi dengan baik

## 2. Prinsip Dasar

### 2.1 Komentar yang Baik

- **Jelaskan Mengapa, Bukan Apa**: Kode sudah menjelaskan apa yang dilakukan, komentar harus menjelaskan mengapa
- **Kontekstual**: Berikan konteks yang tidak jelas dari kode itu sendiri
- **Ringkas**: Hindari komentar yang terlalu panjang atau bertele-tele
- **Up-to-date**: Komentar harus diperbarui saat kode berubah

### 2.2 Kapan Menulis Komentar

Selalu tambahkan komentar untuk:

- Fungsi dan metode publik
- Komponen UI
- Algoritma kompleks
- Workaround atau solusi sementara
- Keputusan desain yang tidak intuitif
- Kode yang melanggar pola umum
- Optimasi performa

### 2.3 Kapan Tidak Menulis Komentar

Hindari komentar yang:

- Hanya mengulangi kode
- Sudah jelas dari nama variabel/fungsi
- Menjadi usang dan tidak diperbarui
- Berisi informasi yang tidak relevan

## 3. Format Komentar

### 3.1 Komentar Dokumentasi (Frontend - TypeScript/JavaScript)

#### Komponen React

```typescript
/**
 * @component ComponentName
 * @description Deskripsi singkat tentang komponen dan fungsinya
 *
 * @param {Type} paramName - Deskripsi parameter
 * @param {Type} paramName - Deskripsi parameter
 * @returns {JSX.Element} Deskripsi singkat tentang apa yang dirender
 *
 * @example
 * <ComponentName param1="value" param2={value} />
 */
export function ComponentName({ param1, param2 }: ComponentProps) {
  // Implementasi komponen
}
```

#### Hooks

```typescript
/**
 * @hook useHookName
 * @description Deskripsi singkat tentang hook dan fungsinya
 *
 * @param {Type} paramName - Deskripsi parameter
 * @returns {ReturnType} Deskripsi return value
 *
 * @example
 * const result = useHookName(param);
 */
export function useHookName(param: ParamType): ReturnType {
  // Implementasi hook
}
```

#### Fungsi Utilitas

```typescript
/**
 * @function functionName
 * @description Deskripsi singkat tentang fungsi dan tujuannya
 *
 * @param {Type} paramName - Deskripsi parameter
 * @returns {ReturnType} Deskripsi return value
 *
 * @example
 * const result = functionName(param);
 */
export function functionName(param: ParamType): ReturnType {
  // Implementasi fungsi
}
```

### 3.2 Komentar Dokumentasi (Backend - Go)

#### Fungsi dan Metode

```go
// FunctionName melakukan X untuk Y dengan Z.
// Ini menangani kasus A, B, dan C.
// Jika terjadi error, akan mengembalikan ErrorType.
//
// Parameter:
//   - param1: deskripsi parameter 1
//   - param2: deskripsi parameter 2
//
// Return:
//   - ReturnType: deskripsi return value
//   - error: deskripsi kemungkinan error
//
// Example:
//   result, err := FunctionName(param1, param2)
//   if err != nil {
//     // handle error
//   }
//   // use result
func FunctionName(param1 Type1, param2 Type2) (ReturnType, error) {
    // Implementasi fungsi
}
```

#### Struct

```go
// StructName merepresentasikan X dengan properti Y.
// Digunakan untuk Z dalam konteks A.
//
// Fields:
//   - Field1: deskripsi field 1
//   - Field2: deskripsi field 2
type StructName struct {
    Field1 Type1 // Komentar singkat jika diperlukan
    Field2 Type2 // Komentar singkat jika diperlukan
}
```

#### Interface

```go
// InterfaceName mendefinisikan kontrak untuk X.
// Implementasi harus menyediakan Y dan menangani Z.
//
// Methods:
//   - Method1: deskripsi method 1
//   - Method2: deskripsi method 2
type InterfaceName interface {
    Method1(param Type) (ReturnType, error)
    Method2() error
}
```

### 3.3 Komentar Inline

#### Frontend (TypeScript/JavaScript)

```typescript
// Komentar kontekstual: Menjelaskan mengapa kode ditulis dengan cara tertentu
const value = complexCalculation(a, b); // Komentar inline singkat jika diperlukan

// Komentar untuk blok kode yang kompleks
// Menjelaskan algoritma atau logika bisnis yang tidak jelas
if (condition) {
  // Langkah 1: Lakukan X untuk alasan Y
  doSomething();
  
  // Langkah 2: Transformasi data untuk persiapan Z
  // Kita perlu melakukan ini karena alasan A dan B
  const transformed = transform(data);
  
  // Langkah 3: Validasi hasil untuk memastikan C
  if (!isValid(transformed)) {
    // Handle kasus error dengan cara D karena alasan E
    handleError();
  }
}
```

#### Backend (Go)

```go
// Komentar kontekstual: Menjelaskan mengapa kode ditulis dengan cara tertentu
value := complexCalculation(a, b) // Komentar inline singkat jika diperlukan

// Komentar untuk blok kode yang kompleks
// Menjelaskan algoritma atau logika bisnis yang tidak jelas
if condition {
    // Langkah 1: Lakukan X untuk alasan Y
    doSomething()
    
    // Langkah 2: Transformasi data untuk persiapan Z
    // Kita perlu melakukan ini karena alasan A dan B
    transformed := transform(data)
    
    // Langkah 3: Validasi hasil untuk memastikan C
    if !isValid(transformed) {
        // Handle kasus error dengan cara D karena alasan E
        handleError()
    }
}
```

## 4. Komentar Khusus

### 4.1 TODO, FIXME, dan NOTE

Gunakan tag khusus untuk menandai pekerjaan yang perlu dilakukan:

```typescript
// TODO: Deskripsi apa yang perlu dilakukan dan mengapa
// FIXME: Deskripsi masalah yang perlu diperbaiki dan bagaimana
// NOTE: Informasi penting yang perlu diperhatikan oleh developer lain
```

### 4.2 Komentar Deprecation

#### Frontend (TypeScript/JavaScript)

```typescript
/**
 * @deprecated Gunakan NewFunction() sebagai gantinya.
 * Fungsi ini akan dihapus pada versi 2.0.0.
 */
export function oldFunction() {
  // Implementasi
}
```

#### Backend (Go)

```go
// Deprecated: Gunakan NewFunction() sebagai gantinya.
// Fungsi ini akan dihapus pada versi 2.0.0.
func OldFunction() {
    // Implementasi
}
```

## 5. Contoh Implementasi

### 5.1 Contoh Komponen React

```typescript
/**
 * @component OrderStatusBadge
 * @description Menampilkan badge status pesanan dengan warna yang sesuai.
 * Badge akan menampilkan status dalam bahasa Indonesia dan warna yang
 * mengindikasikan progress (kuning untuk pending, hijau untuk completed, dll).
 *
 * @param {string} status - Status pesanan (pending, processing, completed, cancelled)
 * @param {boolean} large - Jika true, badge akan ditampilkan dalam ukuran besar
 * @returns {JSX.Element} Badge dengan warna dan teks yang sesuai
 *
 * @example
 * <OrderStatusBadge status="pending" large={false} />
 */
export function OrderStatusBadge({ status, large = false }: OrderStatusBadgeProps) {
  // Mapping status ke label bahasa Indonesia
  // Kita menggunakan mapping statis untuk konsistensi dan kemudahan maintenance
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };
  
  // Mapping status ke warna badge
  // Warna dipilih berdasarkan konvensi umum UI dan brand guidelines
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  // Fallback untuk status yang tidak dikenal
  const label = statusLabels[status] || 'Tidak Diketahui';
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
  
  // Ukuran badge berdasarkan prop large
  const sizeClass = large ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  
  return (
    <span className={`rounded ${colorClass} ${sizeClass} font-medium`}>
      {label}
    </span>
  );
}
```

### 5.2 Contoh Handler Go

```go
// OrderHandler menangani HTTP request terkait pesanan.
// Menyediakan endpoint untuk membuat, mengambil, dan memperbarui pesanan.
type OrderHandler struct {
    orderService OrderService
    logger       Logger
}

// NewOrderHandler membuat instance baru OrderHandler dengan dependency injection.
//
// Parameter:
//   - orderService: service yang menangani logika bisnis pesanan
//   - logger: logger untuk mencatat aktivitas dan error
//
// Return:
//   - *OrderHandler: handler yang siap digunakan
func NewOrderHandler(orderService OrderService, logger Logger) *OrderHandler {
    return &OrderHandler{
        orderService: orderService,
        logger:       logger,
    }
}

// GetOrderByID menangani request GET untuk mengambil pesanan berdasarkan ID.
// Route: GET /api/orders/:id
//
// Parameter:
//   - c: Gin context yang berisi request dan response
//
// Response:
//   - 200 OK dengan data pesanan jika ditemukan
//   - 400 Bad Request jika ID tidak valid
//   - 404 Not Found jika pesanan tidak ditemukan
//   - 500 Internal Server Error jika terjadi error server
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
    // Ekstrak ID dari parameter URL
    id := c.Param("id")
    
    // Validasi ID
    // Komentar kontekstual: Kita perlu validasi ID sebelum query ke database
    // untuk mencegah SQL injection dan error yang tidak perlu
    if id == "" {
        h.logger.Warn("Empty order ID provided")
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID is required"})
        return
    }
    
    // Panggil service untuk mendapatkan pesanan
    order, err := h.orderService.GetByID(id)
    if err != nil {
        // Cek jika error adalah "not found"
        // Komentar kontekstual: Kita perlu membedakan antara error "not found"
        // dan error server lainnya untuk memberikan response yang sesuai
        if errors.Is(err, ErrOrderNotFound) {
            h.logger.Info("Order not found", "id", id)
            c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
            return
        }
        
        // Log error server dan kirim response 500
        h.logger.Error("Failed to get order", "id", id, "error", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
        return
    }
    
    // Kirim response sukses dengan data pesanan
    c.JSON(http.StatusOK, order)
}
```

## 6. Checklist Komentar

Gunakan checklist ini untuk memastikan komentar kode memenuhi standar:

- [ ] Apakah komentar menjelaskan **mengapa**, bukan hanya **apa**?
- [ ] Apakah komentar memberikan konteks yang tidak jelas dari kode?
- [ ] Apakah komentar ringkas dan to-the-point?
- [ ] Apakah komentar up-to-date dengan kode terbaru?
- [ ] Apakah semua fungsi/metode publik memiliki komentar dokumentasi?
- [ ] Apakah semua komponen UI memiliki komentar dokumentasi?
- [ ] Apakah algoritma kompleks memiliki komentar yang cukup?
- [ ] Apakah komentar mengikuti format yang konsisten?
- [ ] Apakah komentar bebas dari informasi yang tidak relevan?
- [ ] Apakah komentar menggunakan bahasa yang jelas dan profesional?

## 7. Kesimpulan

Komentar kode yang baik adalah investasi untuk maintainability jangka panjang. Dengan mengikuti pedoman ini, kita memastikan bahwa kode Urgent Studio tetap mudah dipahami dan dikelola oleh semua anggota tim, baik sekarang maupun di masa depan. Ingat bahwa tujuan utama komentar adalah untuk menjelaskan aspek-aspek kode yang tidak jelas dari kode itu sendiri, bukan untuk mengulangi apa yang sudah jelas.