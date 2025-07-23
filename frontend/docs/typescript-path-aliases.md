# Panduan Penggunaan Path Alias TypeScript

## Tujuan

Dokumen ini memberikan panduan untuk menggunakan path alias TypeScript secara konsisten di proyek Urgent Studio Official. Penggunaan path alias yang konsisten membantu meningkatkan keterbacaan kode, mengurangi kompleksitas impor, dan memudahkan refactoring.

## Konfigurasi Path Alias

Proyek ini menggunakan konfigurasi path alias berikut di `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Ini memungkinkan kita untuk mengimpor file dari direktori `src` menggunakan awalan `@/` alih-alih jalur relatif.

## Aturan Penggunaan

### 1. Selalu Gunakan Path Alias untuk Impor dari Direktori `src`

**Benar:**

```typescript
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
```

**Salah:**

```typescript
import { Button } from '../../components/ui/button';
import { useToast } from '../../../hooks/use-toast';
import { api } from 'src/lib/api';
```

### 2. Gunakan Path Alias untuk Impor Lintas Modul

Ketika mengimpor dari modul yang berbeda (misalnya, dari `components` ke `hooks`), selalu gunakan path alias.

**Benar:**

```typescript
// Di dalam file di src/components/form/login-form.tsx
import { useAuth } from '@/hooks/use-auth';
```

**Salah:**

```typescript
// Di dalam file di src/components/form/login-form.tsx
import { useAuth } from '../../../hooks/use-auth';
```

### 3. Gunakan Jalur Relatif untuk Impor dalam Modul yang Sama

Untuk impor dalam modul yang sama atau subdirektori, gunakan jalur relatif.

**Benar:**

```typescript
// Di dalam file di src/components/form/login-form.tsx
import { FormField } from './form-field';
import { SubmitButton } from '../button/submit-button';
```

**Salah:**

```typescript
// Di dalam file di src/components/form/login-form.tsx
import { FormField } from '@/components/form/form-field';
import { SubmitButton } from '@/components/button/submit-button';
```

### 4. Hindari Jalur Relatif yang Terlalu Dalam

Jika jalur relatif memerlukan lebih dari dua level (`../../`), pertimbangkan untuk menggunakan path alias.

**Benar:**

```typescript
import { logger } from '@/lib/logger';
```

**Hindari:**

```typescript
import { logger } from '../../../lib/logger';
```

### 5. Konsistensi dalam Barrel Exports

Jika menggunakan barrel exports (file `index.ts` yang mengekspor ulang dari file lain), pastikan konsisten dalam penggunaan path alias.

**Benar:**

```typescript
// src/components/index.ts
export * from './ui/button';
export * from './form/input';
export * from './layout/container';

// Penggunaan
import { Button, Input, Container } from '@/components';
```

## Struktur Folder yang Direkomendasikan

Untuk memaksimalkan manfaat dari path alias, ikuti struktur folder ini:

```
src/
├── app/           # Halaman Next.js App Router
├── components/    # Komponen React
│   ├── ui/        # Komponen UI dasar
│   ├── form/      # Komponen form
│   └── layout/    # Komponen layout
├── hooks/         # Custom React hooks
├── lib/           # Utilitas dan fungsi helper
├── services/      # Layanan API dan logika bisnis
├── styles/        # File CSS global dan utilitas
└── types/         # Definisi tipe TypeScript
```

## Alat dan Konfigurasi

### ESLint

Konfigurasi ESLint berikut dapat membantu menegakkan penggunaan path alias yang konsisten:

```json
{
  "rules": {
    "import/no-relative-parent-imports": "error",
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  }
}
```

### VS Code

Untuk VS Code, pastikan pengaturan berikut ditambahkan ke `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

Ini akan membuat VS Code secara otomatis menggunakan path alias saat mengimpor modul.

## Manfaat

- **Keterbacaan yang lebih baik**: Path alias membuat kode lebih mudah dibaca dan dipahami.
- **Refactoring yang lebih mudah**: Memindahkan file tidak akan merusak impor jika path alias digunakan.
- **Mengurangi kesalahan**: Mengurangi kesalahan yang terkait dengan jalur relatif yang kompleks.
- **Konsistensi**: Memastikan gaya pengkodean yang konsisten di seluruh proyek.

## Contoh Kasus Penggunaan

### Komponen UI

```typescript
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';

// Implementasi komponen
```

### Halaman

```typescript
// src/app/dashboard/page.tsx
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/services/api';

// Implementasi halaman
```

### Hook

```typescript
// src/hooks/use-auth.ts
import { useState } from 'react';
import { api } from '@/services/api';
import { User } from '@/types/user';

// Implementasi hook
```

## Kesimpulan

Penggunaan path alias TypeScript yang konsisten adalah praktik terbaik yang harus diikuti oleh semua anggota tim. Ini meningkatkan keterbacaan, pemeliharaan, dan konsistensi kode di seluruh proyek.