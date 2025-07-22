# Daftar Tugas & Progres Proyek Urgent Studio

Dokumen ini adalah pusat kendali untuk melacak semua tugas yang sedang dan akan dikerjakan. Setiap tugas akan dipecah menjadi langkah-langkah yang bisa ditindaklanjuti.

- `[ ]`: Tugas belum selesai.
- `[x]`: Tugas sudah selesai.

---
## TUGAS: Membuat Alur Order Jadi Sistem Antrean Cerdas

**Tujuan:** Mengubah alur order dari "selalu terbuka" menjadi sistem antrean terkontrol untuk mengelola beban kerja, sambil memberikan informasi yang jelas kepada pelanggan.

---
### Tahap 1: Fondasi & Kontrol Admin

-   `[x]` **Langkah 1: Siapkan Panel Kontrol Admin**
    -   *Detail:* Membuat halaman `/admin/control` agar admin bisa mengatur batasan kerja.
    -   *Status:* **Selesai**. Halaman sudah ada.

-   `[x]` **Langkah 2: Siapkan Service Pengaturan**
    -   *Detail:* Membuat fungsi di backend untuk menyimpan & mengambil data dari Panel Kontrol Admin.
    -   *Status:* **Selesai**. `settingsService.ts` sudah ada dan berfungsi.

-   `[x]` **Langkah 3: Sempurnakan Panel Kontrol Admin**
    -   `[x]` **3.1:** Ubah label di halaman `/admin/control` agar lebih jelas, yaitu "Batas Produk per Minggu" dan "Target Pendapatan per Bulan".
    -   `[x]` **3.2:** Hapus kolom input "Batas Order per Bulan" karena ini bisa dihitung otomatis dari batasan mingguan. Ini menyederhanakan kontrol bagi admin.

---
### Tahap 2: Logika & Implementasi di Sistem

-   `[ ]` **Langkah 4: Bangun Otak Sistem Antrean**
    -   `[ ]` **4.1:** Buat fungsi `getQueueStatus()` di `orderService.ts`. Fungsi ini akan menjadi pusat logika.
    -   `[ ]` **4.2:** Di dalam fungsi itu, ambil pengaturan dari admin (batas minggu, target pendapatan).
    -   `[ ]` **4.3:** Hitung jumlah **total produk (brief)** yang dipesan dalam seminggu berjalan (Senin-Minggu). Jangan hitung order yang batal.
    -   `[ ]` **4.4:** Hitung total **pendapatan** yang masuk dalam bulan berjalan. Jangan hitung order yang batal.
    -   `[ ]` **4.5:** Fungsi ini harus menghasilkan keputusan: `isOpen: true/false` dan `reason: "Pesan alasan kenapa antrean tutup"`.

-   `[ ]` **Langkah 5: Terapkan Antrean di Halaman Utama**
    -   `[ ]` **5.1:** Panggil fungsi `getQueueStatus()` di `HomePage.tsx`.
    -   `[ ]` **5.2:** Jika antrean `isOpen: false`, nonaktifkan semua tombol "Pilih Produk" dan tampilkan pesan alasan yang didapat dari `getQueueStatus` (misal: "Antrean Penuh! Batas pesanan mingguan telah tercapai. Coba lagi nanti.").

-   `[ ]` **Langkah 6: Tampilkan Info Antrean ke Pelanggan**
    -   `[ ]` **6.1:** Buat fungsi baru di `orderService.ts` untuk menghitung **"jumlah desain dalam antrean"** (yaitu semua brief dari order yang aktif).
    -   `[ ]` **6.2:** Di halaman **Checkout** (`/checkout/summary`), tampilkan estimasi antrean menggunakan fungsi dari 6.1. Contoh: *"Saat ini ada 5 desain dalam antrean pengerjaan."*
    -   `[ ]` **6.3:** Di halaman **Pelacakan** (`/track`), setelah pembayaran terkonfirmasi, tampilkan posisi antrean pasti mereka. Contoh: *"Status: Pesanan Diterima. Posisi antrean Anda: 6 dari 10 desain aktif."*
