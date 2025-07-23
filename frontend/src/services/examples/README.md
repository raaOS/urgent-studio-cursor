# Contoh Layanan TypeScript

Direktori ini berisi contoh implementasi layanan TypeScript yang mengikuti praktik terbaik dan aturan TypeScript yang ketat. Semua kode dalam direktori ini:

1. Tidak menggunakan `any` - sebagai gantinya menggunakan `unknown`, `Record<string, unknown>`, atau interface/type yang aman.
2. Semua fungsi memiliki tipe parameter dan return yang eksplisit.
3. Menggunakan `interface`, `type`, `generics`, atau `union types` sesuai konteks data.
4. Tidak menggunakan `@ts-ignore`, `as any`, atau trik yang menonaktifkan pengecekan TypeScript.

## File yang Tersedia

- `backendService.ts` - Layanan untuk berkomunikasi dengan backend API
- `errorHandler.ts` - Utilitas untuk menangani error
- `httpClient.ts` - Klien HTTP menggunakan axios
- `logService.ts` - Layanan untuk logging
- `orderService.ts` - Contoh layanan bisnis sederhana
- `serviceTestUtils.ts` - Utilitas untuk pengujian layanan
- `settingsService.ts` - Layanan untuk mengelola pengaturan aplikasi
- `validationSchemas.ts` - Skema validasi menggunakan yup

## Penggunaan

Untuk menggunakan layanan-layanan ini, Anda dapat mengimpor dari file `index.ts`:

```typescript
import { fetchData, handleError, httpClient, logInfo } from './services/examples';
```

Atau mengimpor langsung dari file spesifik:

```typescript
import { fetchData } from './services/examples/backendService';
```