
# Estimasi Biaya Bulanan Aplikasi Urgent Studio

Dokumen ini memberikan rincian perkiraan biaya operasional bulanan untuk menjalankan aplikasi Urgent Studio, berdasarkan layanan Firebase dan Google Cloud yang saat ini digunakan.

## TL;DR: Kesimpulan Awal

Untuk aplikasi dengan skala kecil hingga menengah (misalnya, di bawah ~1000 pesanan per bulan dengan traffic wajar), perkiraan biaya bulanan Anda adalah **Rp 0 (Gratis)**.

Anda akan tetap berada dalam *free tier* (tingkat gratis) yang disediakan oleh Firebase dan Google Cloud, yang keduanya sangat murah hati. Biaya baru akan muncul jika aplikasi Anda mengalami pertumbuhan yang sangat signifikan.

---

## Rincian Biaya per Layanan

Berikut adalah pemecahan biaya untuk setiap komponen utama yang kita gunakan.

### 1. Cloud Firestore (Database Utama)

Ini adalah layanan database NoSQL tempat kita menyimpan data pesanan, log, dan pengaturan.

-   **Tingkat Gratis (per bulan):**
    -   Penyimpanan: **1 GiB**
    -   Operasi Baca: **50.000 / hari**
    -   Operasi Tulis: **20.000 / hari**
    -   Operasi Hapus: **20.000 / hari**
-   **Prediksi Biaya:**
    -   Setiap pesanan, pembaruan status, atau pembacaan log adalah satu operasi. Untuk skala awal hingga menengah, Anda akan sangat sulit melebihi batas gratis harian ini.
    -   **Biaya yang Diharapkan: Rp 0**

### 2. Firebase App Hosting (Server Aplikasi Next.js)

Ini adalah layanan yang menjalankan kode Next.js Anda di server.

-   **Tingkat Gratis (per bulan):**
    -   CPU: 0.5 vCPU-jam / hari
    -   Memori: 1 GiB RAM-jam / hari
    -   Lalu Lintas Keluar (Egress): **10 GiB**
-   **Prediksi Biaya:**
    -   Tingkat gratis ini cukup untuk menangani ribuan sesi pengguna bulanan. Biaya hanya akan muncul jika ada lonjakan traffic yang sangat besar dan berkelanjutan.
    -   **Biaya yang Diharapkan: Rp 0**

### 3. Firebase Authentication (Login Admin)

Layanan ini mengelola login untuk panel admin.

-   **Tingkat Gratis (per bulan):**
    -   Pengguna Aktif Bulanan (MAU): **50.000**
-   **Prediksi Biaya:**
    -   Karena pengguna terbatas hanya untuk admin internal (1-5 orang), Anda tidak akan pernah mendekati batas ini.
    -   **Biaya yang Diharapkan: Rp 0**

### 4. Google AI Platform (Model Gemini)

Digunakan oleh Genkit untuk fitur `analyzeDesignBrief` dan `processTelegramMessage`.

-   **Tingkat Gratis (Model Gemini 1.5 Flash/Pro):**
    -   Permintaan per Menit: **2 Juta Token**
    -   Permintaan per Hari: **60 Juta Token**
-   **Prediksi Biaya:**
    -   Setiap analisis brief hanya mengonsumsi beberapa ribu token. Batas gratis ini setara dengan puluhan ribu analisis brief per hari.
    -   **Biaya yang Diharapkan: Rp 0**

### 5. Cloud Storage for Firebase (Penyimpanan File)

Saat ini kita belum menggunakannya (karena aset dari Google Drive), tetapi jika di masa depan kita menambahkan fitur upload file:

-   **Tingkat Gratis (per bulan):**
    -   Penyimpanan: **5 GiB**
    -   Operasi Upload: **20.000**
    -   Operasi Download: **50.000**
    -   Lalu Lintas Keluar (Download): **1 GiB / hari**
-   **Prediksi Biaya:**
    -   Jika diimplementasikan, biaya akan tetap gratis kecuali total file yang disimpan melebihi 5 GiB.
    -   **Biaya yang Diharapkan (jika diaktifkan): Rp 0**

---

## Kapan Biaya Akan Mulai Muncul?

Anda baru perlu memikirkan biaya jika:
1.  **Popularitas Meledak:** Aplikasi Anda digunakan oleh ribuan pengguna setiap hari, menghasilkan ratusan ribu operasi baca/tulis ke database.
2.  **Penyimpanan Besar:** Anda mulai menyimpan data dalam jumlah sangat besar (misalnya, data log selama bertahun-tahun atau ribuan file besar di Cloud Storage) yang melebihi batas GiB gratis.
3.  **Penggunaan AI Intensif:** Anda menambahkan fitur AI yang jauh lebih kompleks dan sering digunakan oleh banyak pengguna secara bersamaan.

Untuk memantau penggunaan, Anda bisa mengunjungi **Firebase Console -> Usage and billing**.
