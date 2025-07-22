# Urgent Studio Official

Ini adalah proyek Next.js untuk Urgent Studio, dibangun dengan Firebase, Genkit, dan ShadCN UI.

## Menjalankan Server Pengembangan

Untuk menjalankan server pengembangan standar, gunakan perintah:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:9005`.

## Alur Kerja Webhook (Telegram)

### Untuk Pengembangan Lokal

Untuk mengembangkan fitur yang berhubungan dengan bot Telegram (seperti menerima pesan), server lokal Anda harus dapat diakses dari internet.

1.  Jalankan aplikasi Anda secara lokal (`npm run dev`).
2.  Di terminal terpisah, gunakan layanan tunnel seperti `ngrok` untuk mengekspos port `9005` Anda ke internet.
    ```bash
    ngrok http 9005
    ```
3.  Salin URL `https://...` yang diberikan oleh ngrok.
4.  Buka panel admin aplikasi Anda di `http://localhost:9005/admin/bot`, tempelkan URL ngrok ke kolom "URL Dasar Webhook", simpan, lalu klik "Atur/Update Webhook".

### Untuk Produksi (Setelah Deploy)

1.  Setelah Anda mem-publish aplikasi ke Firebase, Anda akan mendapatkan URL publik permanen (misalnya, `https://nama-proyek-anda.web.app`).
2.  Buka panel admin aplikasi Anda di URL produksi tersebut.
3.  Masuk ke menu Kontrol Bot.
4.  Tempelkan URL **produksi** Anda ke kolom "URL Dasar Webhook", simpan, lalu klik "Atur/Update Webhook". Ini hanya perlu dilakukan sekali, kecuali Anda mengubah domain aplikasi.
# urgent-studio-2025
