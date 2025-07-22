# Panduan Ekstensi VSCode untuk Urgent Studio 2025

Dokumen ini menjelaskan ekstensi VSCode yang direkomendasikan untuk pengembangan Urgent Studio 2025 dan cara menggunakannya secara efektif.

## Ekstensi untuk Frontend (Next.js)

### 1. ESLint

**ID Ekstensi**: `dbaeumer.vscode-eslint`

**Deskripsi**: ESLint adalah alat linting untuk JavaScript dan TypeScript yang membantu mengidentifikasi dan memperbaiki masalah dalam kode.

**Cara Penggunaan**:
- Linting otomatis saat menyimpan file (sudah dikonfigurasi di `.vscode/settings.json`)
- Lihat masalah di panel Problems (Ctrl+Shift+M / Cmd+Shift+M)
- Quick Fix dengan (Ctrl+. / Cmd+.)

**Konfigurasi Proyek**: Konfigurasi ESLint tersedia di file `.eslintrc.js` di folder frontend.

### 2. Prettier

**ID Ekstensi**: `esbenp.prettier-vscode`

**Deskripsi**: Prettier adalah formatter kode yang memastikan gaya kode yang konsisten di seluruh proyek.

**Cara Penggunaan**:
- Format otomatis saat menyimpan file (sudah dikonfigurasi)
- Format manual dengan (Shift+Alt+F / Shift+Option+F)
- Format seleksi dengan (Ctrl+K Ctrl+F / Cmd+K Cmd+F)

**Konfigurasi Proyek**: Konfigurasi Prettier tersedia di file `.prettierrc` di folder frontend.

### 3. Tailwind CSS IntelliSense

**ID Ekstensi**: `bradlc.vscode-tailwindcss`

**Deskripsi**: Menyediakan autocomplete, linting, dan hover preview untuk class Tailwind CSS.

**Cara Penggunaan**:
- Autocomplete class Tailwind saat mengetik
- Hover pada class untuk melihat CSS yang dihasilkan
- Linting untuk class yang tidak valid

**Konfigurasi Proyek**: Konfigurasi Tailwind tersedia di file `tailwind.config.ts` di folder frontend.

### 4. ES7+ React/Redux/React-Native snippets

**ID Ekstensi**: `dsznajder.es7-react-js-snippets`

**Deskripsi**: Menyediakan snippet kode untuk React, Redux, dan TypeScript.

**Cara Penggunaan**:
- `rafce` - React Arrow Function Component dengan Export
- `rfc` - React Functional Component
- `usf` - useState Hook
- `uef` - useEffect Hook
- `rrd` - React Router DOM Import

### 5. Import Cost

**ID Ekstensi**: `wix.vscode-import-cost`

**Deskripsi**: Menampilkan ukuran package yang diimport dalam file JavaScript/TypeScript.

**Cara Penggunaan**:
- Ukuran package ditampilkan secara inline di samping statement import
- Warna hijau untuk ukuran kecil, kuning untuk sedang, dan merah untuk besar

### 6. Error Lens

**ID Ekstensi**: `usernamehw.errorlens`

**Deskripsi**: Menyoroti error, warning, dan informasi diagnostik lainnya langsung di editor.

**Cara Penggunaan**:
- Error dan warning ditampilkan inline di editor
- Hover pada error untuk melihat detail lengkap
- Klik pada error untuk melihat quick fix jika tersedia

## Ekstensi untuk Backend (Golang)

### 1. Go

**ID Ekstensi**: `golang.go`

**Deskripsi**: Ekstensi resmi untuk bahasa Go yang menyediakan dukungan lengkap untuk pengembangan Go.

**Cara Penggunaan**:
- IntelliSense dan code completion
- Go to Definition dan Find References
- Format kode otomatis saat menyimpan
- Debugging terintegrasi

**Konfigurasi Proyek**: Konfigurasi Go tersedia di file `go.mod` di folder backend.

### 2. Go Test Explorer

**ID Ekstensi**: `premparihar.gotestexplorer`

**Deskripsi**: Menyediakan antarmuka visual untuk menjalankan dan debug test Go.

**Cara Penggunaan**:
- Lihat semua test di panel Test Explorer
- Jalankan test individual atau semua test
- Debug test dengan breakpoint
- Lihat hasil test dan coverage

### 3. Go Outliner

**ID Ekstensi**: `766b.go-outliner`

**Deskripsi**: Menampilkan struktur kode Go (fungsi, metode, struct) di panel Outline.

**Cara Penggunaan**:
- Buka panel Outline (Ctrl+Shift+O / Cmd+Shift+O)
- Klik pada item untuk navigasi cepat ke definisi
- Filter outline dengan mengetik nama

### 4. Go Doc

**ID Ekstensi**: `msyrus.go-doc`

**Deskripsi**: Menyediakan akses cepat ke dokumentasi Go langsung dari editor.

**Cara Penggunaan**:
- Hover pada identifier untuk melihat dokumentasi
- Gunakan command `Go: Show Documentation` untuk melihat dokumentasi lengkap

### 5. Go Coverage

**ID Ekstensi**: `premparihar.gotestexplorer`

**Deskripsi**: Visualisasi code coverage untuk test Go.

**Cara Penggunaan**:
- Jalankan test dengan coverage dari Test Explorer
- Lihat highlight kode yang tercakup/tidak tercakup oleh test
- Lihat persentase coverage di status bar

## Ekstensi untuk Database

### 1. PostgreSQL

**ID Ekstensi**: `ckolkman.vscode-postgres`

**Deskripsi**: Menyediakan dukungan untuk PostgreSQL, termasuk explorer dan query editor.

**Cara Penggunaan**:
- Tambahkan koneksi database di panel PostgreSQL
- Browse tabel, view, dan fungsi
- Jalankan query dan lihat hasil
- Export hasil query ke CSV

### 2. SQLTools

**ID Ekstensi**: `mtxr.sqltools`

**Deskripsi**: Query editor dan explorer untuk berbagai database, termasuk PostgreSQL.

**Cara Penggunaan**:
- Tambahkan koneksi database di panel SQLTools
- Buat dan simpan query
- Format SQL dengan formatter bawaan
- Lihat riwayat query

### 3. Database Client

**ID Ekstensi**: `cweijan.vscode-database-client2`

**Deskripsi**: Klien database lengkap yang mendukung PostgreSQL, MySQL, dan database lainnya.

**Cara Penggunaan**:
- Tambahkan koneksi database di panel Database
- Edit data dengan antarmuka visual
- Generate script SQL dari tabel
- Import/export data

## Ekstensi Umum

### 1. GitLens

**ID Ekstensi**: `eamodio.gitlens`

**Deskripsi**: Memperluas kemampuan Git di VSCode dengan fitur seperti blame, history, dan perbandingan.

**Cara Penggunaan**:
- Lihat blame inline di editor
- Explore riwayat file dan line
- Bandingkan branch, tag, dan commit
- Lihat status perubahan di status bar

### 2. Docker

**ID Ekstensi**: `ms-azuretools.vscode-docker`

**Deskripsi**: Menyediakan dukungan untuk Docker, termasuk explorer, build, dan run container.

**Cara Penggunaan**:
- Lihat container, image, dan volume di panel Docker
- Build dan run container dari Dockerfile
- Lihat logs container
- Exec ke dalam container

### 3. Thunder Client

**ID Ekstensi**: `rangav.vscode-thunder-client`

**Deskripsi**: Klien REST API ringan dan mudah digunakan, alternatif untuk Postman.

**Cara Penggunaan**:
- Buat dan simpan request API
- Organize request dalam koleksi
- Set variabel environment
- Jalankan test otomatis

### 4. REST Client

**ID Ekstensi**: `humao.rest-client`

**Deskripsi**: Memungkinkan mengirim HTTP request dan melihat respons langsung di VSCode.

**Cara Penggunaan**:
- Buat file dengan ekstensi `.http` atau `.rest`
- Tulis request HTTP dalam format sederhana
- Kirim request dengan klik "Send Request"
- Lihat respons di panel terpisah

## Menginstal Semua Ekstensi yang Direkomendasikan

Proyek ini sudah dikonfigurasi dengan file `.vscode/extensions.json` yang berisi daftar ekstensi yang direkomendasikan. Saat membuka proyek di VSCode, Anda akan melihat notifikasi untuk menginstal ekstensi yang direkomendasikan.

Alternatifnya, Anda dapat menginstal semua ekstensi yang direkomendasikan dengan perintah:

```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension wix.vscode-import-cost
code --install-extension usernamehw.errorlens
code --install-extension golang.go
code --install-extension premparihar.gotestexplorer
code --install-extension 766b.go-outliner
code --install-extension msyrus.go-doc
code --install-extension ckolkman.vscode-postgres
code --install-extension mtxr.sqltools
code --install-extension cweijan.vscode-database-client2
code --install-extension eamodio.gitlens
code --install-extension ms-azuretools.vscode-docker
code --install-extension rangav.vscode-thunder-client
code --install-extension humao.rest-client
```

## Konfigurasi Ekstensi

Konfigurasi untuk ekstensi ini sudah diatur di file `.vscode/settings.json`. Konfigurasi ini mencakup:

- Format otomatis saat menyimpan file
- Linting otomatis untuk JavaScript/TypeScript
- Konfigurasi spesifik untuk Go
- Pengaturan untuk Tailwind CSS
- Dan lainnya

Anda dapat menyesuaikan konfigurasi ini sesuai preferensi Anda dengan mengedit file `.vscode/settings.json`.