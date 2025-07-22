# Peraturan dan Panduan Proyek URGENT STUDIO

## 1. Tujuan Proyek
- Membangun platform desain interaktif untuk solopreneur.
- Menggunakan Next.js, Firebase, TypeScript, dan Tailwind CSS.
- Memastikan kode dapat dengan mudah dimigrasi dan dideploy di platform lain.

## 2. Struktur Proyek
- Ikuti struktur folder default Next.js.
- Pisahkan frontend, backend (API routes), dan service (interaksi dengan database/layanan eksternal).

## 3. Penamaan dan Kode
- Gunakan camelCase untuk variabel, fungsi, dan nama file.
- Setiap komponen harus memiliki nama yang deskriptif dan konsisten.

## 4. Penggunaan Firebase
- Simpan semua kunci API dan konfigurasi rahasia di environment variables.
- Gunakan Firebase Authentication untuk manajemen pengguna.
- Gunakan Firestore untuk menyimpan data pesanan dan pengguna.

## 5. API dan Integrasi
- Buat API routes di folder app/api.
- Validasi semua input dari pengguna sebelum diproses.
- Batasi ketergantungan pada fitur spesifik Firebase yang sulit dimigrasi.

## 6. Styling dengan Tailwind CSS
- Gunakan utility classes dari Tailwind CSS untuk styling.
- Hindari penggunaan CSS custom kecuali diperlukan.

## 7. Pengelolaan State
- Gunakan state management yang minimal (seperti useState dan useEffect).
- Hindari library pihak ketiga yang bisa membuat migrasi lebih sulit.

## 8. Testing
- Buat test untuk komponen-komponen kritis.
- Gunakan Next.js testing library untuk facilitasi testing.

## 9. Dokumentasi
- Tulis dokumentasi untuk setiap fitur utama.
- Catatan semua keputusan desain dan alasan di baliknya.

## 10. Persiapan Migrasi
- Simpan semua konfigurasi dan script penting di repository GitHub.
- Buat dokumentasi langkah-langkah untuk deploy di platform lain (seperti Vercel atau Netlify).

## 11. Kebijakan Backup
- Commit perubahan ke GitHub secara reguler.
- Label dan uraikan commit messages dengan jelas.

## 12. Keamanan
- Validasi dan sanitasi semua input pengguna.
- Lindungi data sensitif dengan environment variables.

## 13. Performa
- Optimalkan gambar dan aset statis.
- Gunakan lazy loading untuk komponen yang tidak kritis.

## 14. Kolaborasi dengan AI
- **Verifikasi dengan Checklist**: Setelah AI menghasilkan kode, minta AI untuk memverifikasi hasilnya berdasarkan checklist kualitas (misal: penamaan, typing, konsistensi).
- **Debugging dengan Logging**: Minta AI untuk menambahkan `console.log` di titik-titik penting dalam kode untuk memudahkan pelacakan alur data dan state.

## 15. Hindari
Hindari Pengunaan `any` di typescript kecuali benar-benar diperlukan dan ada alasannya.

---
# Kontrak Kerja & Solusi Masalah Umum

Berikut adalah prinsip kerja yang kita sepakati untuk mengatasi tantangan umum dalam kolaborasi AI-manusia.

### 1. Masalah Konsistensi Gaya Coding
**Solusi:** File `aturan.md` ini adalah hukum. AI harus secara aktif merujuk pada aturan ini. Prompt harus mengingatkan AI untuk mematuhi aturan ini, dan setiap penyimpangan harus segera dikoreksi.

### 2. Masalah Pemahaman Kontekstual
**Solusi:** Untuk fitur kompleks, lakukan "Sesi Desain Cepat". Jelaskan alur kerja secara bertahap (langkah 1, 2, 3) sebelum meminta kode. AI harus mengonfirmasi pemahaman sebelum melanjutkan.

### 3. Masalah Optimasi Kode
**Solusi:** Fokus pada fungsionalitas terlebih dahulu. Setelah fitur bekerja, ajukan pertanyaan spesifik tentang optimasi, seperti "Bagaimana cara kita melakukan lazy load pada komponen ini?"

### 4. Masalah Keamanan
**Solusi:** Jadikan keamanan sebagai bagian dari checklist verifikasi. Setelah pembuatan API atau form, selalu tanyakan: "Apakah input sudah divalidasi dan disanitasi di sisi server?"

### 5. Masalah Integrasi Sistem
**Solusi:** Isolasikan setiap layanan pihak ketiga (Firebase, Telegram, dll.) ke dalam file service-nya sendiri di `src/services/`. Bangun satu layanan pada satu waktu.

### 6. Masalah Penanganan Error
**Solusi:** Semua operasi yang bisa gagal (panggilan API, query DB) **wajib** dibungkus dalam `try-catch`. Pastikan blok `catch` memberikan feedback yang jelas kepada pengguna (misalnya, melalui toast).

### 7. Masalah Desain Database & Query
**Solusi:** Rancang struktur data sebelum menulis kode query. Ajukan pertanyaan seperti, "Bagaimana struktur data Firestore yang baik untuk menyimpan pesanan?"

### 8. Masalah Automation dan CI/CD
**Solusi:** Minta AI untuk membuat skrip spesifik di `package.json` sesuai kebutuhan, seperti skrip untuk `typecheck` atau `linting`.

### 9. Masalah Best Practices
**Solusi:** AI akan memprioritaskan pola modern (App Router, Server Components, React Hooks). Jika ragu, tanyakan "Mengapa kamu memilih pendekatan ini?" untuk mendapatkan penjelasan.

### 10. Masalah Komunikasi Antar-sistem
**Solusi:** Gunakan Zod sebagai "sumber kebenaran". Definisikan skema input dan output untuk API/flow terlebih dahulu untuk memastikan sinkronisasi antara frontend dan backend.

### 11. Masalah Kustomisasi & Fleksibilitas
**Solusi:** Pecah kebutuhan kustom yang kompleks menjadi bagian-bagian yang lebih kecil dan standar. Tangani setiap bagian sebagai tugas yang terisolasi.

### 12. Masalah Dokumentasi
**Solusi:** Komentar JSDoc di level fungsi adalah standar. Minta AI untuk menambahkan dokumentasi yang menjelaskan tujuan, parameter, dan nilai kembalian dari fungsi-fungsi penting.

---
# Mode Kolaborasi: Partner Strategis (Arsitek Produk)

Ini adalah mode kerja standar kita. Tujuannya adalah untuk memastikan kita tidak hanya menulis kode, tetapi membangun produk yang hebat.

Dalam mode ini, peran AI bukan hanya sebagai "penulis kode" tetapi sebagai partner berpikir. Prosesnya adalah:

1.  **Mendengarkan Visi Anda:** Memahami *apa* yang ingin Anda capai secara bisnis, bukan hanya menerima perintah teknis secara harfiah.
2.  **Mempertanyakan "Mengapa":** Menggali lebih dalam untuk menemukan tujuan sebenarnya di balik sebuah fitur. Ini membantu kita memastikan kita membangun hal yang benar dan tidak menambah kerumitan yang tidak perlu.
3.  **Menganalisis Konsekuensi:** Memikirkan bagaimana sebuah ide akan mempengaruhi alur pengguna, kompleksitas kode di masa depan, dan skalabilitas sistem.
4.  **Menawarkan Solusi Terbaik:** Memberikan rekomendasi yang memprioritaskan kesederhanaan, pengalaman pengguna yang mulus, dan kemudahan pemeliharaan. Terkadang, ini berarti menyarankan pendekatan yang berbeda dari ide awal.

Tujuan utama dari mode ini adalah membangun produk terbaik dengan cara yang paling efisien. Ego dikesampingkan demi kualitas produk akhir.
