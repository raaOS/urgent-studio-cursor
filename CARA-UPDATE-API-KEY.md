# 🤖 Cara Update API Key Forge

Ketika jatah free API key Anda habis, ikuti langkah mudah ini:

## 📝 Langkah-langkah:

1. **Buka file `.env`** di root project ini
2. **Ganti value FORGE_KEY** dengan API key baru Anda
3. **Simpan file** (Ctrl+S atau Cmd+S)
4. **Jalankan seperti biasa**: `npm run myai`

## 📂 Contoh isi file `.env`:
```
FORGE_KEY=sk-fg-v1-your_new_api_key_here
```

## ✅ Keuntungan sistem ini:
- ❌ **Tidak perlu** install ulang Forge
- ❌ **Tidak perlu** kasih brief tentang website berulang kali
- ✅ **Cukup** ganti API key di file `.env`
- ✅ **Langsung** bisa pakai `npm run myai`

## 🔒 Keamanan:
File `.env` sudah ditambahkan ke `.gitignore` jadi API key tidak akan ter-commit ke Git.

## 🆘 Troubleshooting:
- Jika error "File .env tidak ditemukan", pastikan file `.env` ada di folder root
- Jika error "FORGE_KEY tidak ditemukan", pastikan format di file `.env` benar
- Pastikan tidak ada spasi di sekitar tanda `=`