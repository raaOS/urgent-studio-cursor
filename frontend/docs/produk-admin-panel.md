# Dokumentasi Pengembangan Panel Admin: Manajemen Produk & Kategori

## 1. Struktur Data Produk
Setiap produk memiliki struktur berikut:
```ts
interface Product {
  id: string;
  name: string;
  category: string; // Contoh: 'Konten Sosial Media', 'Identitas Bisnis', dst
  budgetKakiLima: number;
  budgetUMKM: number;
  budgetECommerce: number;
  description?: string;
  imageUrl?: string;
  isBestSeller?: boolean; // true jika produk ingin ditandai "Paling Laris"
  isHighMargin?: boolean; // true jika margin tinggi
  isPromo?: boolean;      // true jika sedang promo
}
```

## 2. Fitur Panel Admin yang Direkomendasikan
### a. Manajemen Kategori
- Tambah/edit/hapus kategori produk.
- Assign produk ke kategori.
- Urutkan kategori (opsional).

### b. Manajemen Produk
- Tambah/edit/hapus produk.
- Set harga per tier (Kaki Lima, UMKM, E-Commerce/Corporate).
- Upload gambar produk.
- Set flag:
  - `isBestSeller` (Paling Laris)
  - `isHighMargin` (Menguntungkan)
  - `isPromo` (Promo)
- Edit deskripsi produk.

### c. Manajemen Filter/Sortir
- Atur urutan default produk (misal: promo dulu, baru laris, dst).
- Atur produk mana yang ingin diprioritaskan di filter tertentu.
- Preview hasil filter/sortir di panel admin.

### d. Preview Mobile/Desktop
- Admin bisa preview tampilan grid (desktop) dan carousel (mobile/tablet) langsung dari panel admin.

## 3. Tips Pengembangan
- Simpan data produk dan kategori di database (bisa NoSQL/SQL).
- Buat API endpoint untuk CRUD produk & kategori.
- Gunakan form validasi untuk input harga, nama, dan flag.
- Untuk flag (bestseller, promo, high margin), gunakan checkbox di form admin.
- Untuk upload gambar, gunakan storage terpisah (misal: S3, Cloud Storage) dan simpan URL-nya di field `imageUrl`.
- Pastikan admin bisa drag & drop urutan kategori/produk jika ingin custom order.

## 4. Contoh API Endpoint
- `GET /api/products` — ambil semua produk
- `POST /api/products` — tambah produk
- `PUT /api/products/:id` — edit produk
- `DELETE /api/products/:id` — hapus produk
- `GET /api/categories` — ambil semua kategori
- `POST /api/categories` — tambah kategori
- dst.

## 5. Pengembangan Lanjutan
- Tambahkan fitur analytics: produk terlaris, produk dengan margin tertinggi, dsb.
- Tambahkan fitur bulk edit (edit banyak produk sekaligus).
- Integrasi dengan sistem order/checkout untuk tracking performa produk.

---

**Catatan:**
- Semua flag dan kategori bisa diubah tanpa perlu deploy ulang frontend.
- Struktur ini scalable untuk kebutuhan bisnis ke depan. 