# 🔧 ESLint Best Practices & Rules

## 📋 **MEMORY: Error ESLint yang Sudah Diperbaiki**

### ✅ **Import Order Rules**
```typescript
// ❌ SALAH - Urutan import tidak sesuai
import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

// ✅ BENAR - Urutan import yang tepat
import { Search } from 'lucide-react';        // 1. External libraries
import Link from 'next/link';                 // 2. Next.js modules
import { useState } from 'react';             // 3. React modules
import { Header } from '@/components/Header'; // 4. Internal components
```

**Urutan Import yang Benar:**
1. External libraries (lucide-react, @hookform/resolvers/zod)
2. Next.js modules (next/link, next/image)
3. React modules (react, react-dom)
4. Internal components (@/components/*)
5. Internal utilities (@/lib/*, @/utils/*)

### ✅ **Unused Variables**
```typescript
// ❌ SALAH - Import yang tidak digunakan
import { useState, useEffect } from 'react'; // useEffect tidak dipakai

// ✅ BENAR - Hanya import yang digunakan
import { useState } from 'react';
```

### ✅ **HTML Entities**
```typescript
// ❌ SALAH - Tanda kutip langsung
content: "Desainnya bagus banget"

// ✅ BENAR - Gunakan HTML entities
content: "&ldquo;Desainnya bagus banget&rdquo;"
```

### ✅ **Function Return Types**
```typescript
// ❌ SALAH - Tipe return tidak konsisten
export default function HomePage(): React.JSX.Element {

// ✅ BENAR - Gunakan JSX.Element
export default function HomePage(): JSX.Element {
```

### ✅ **Boolean Expressions**
```typescript
// ❌ SALAH - Boolean expression tidak strict
if (brief) {

// ✅ BENAR - Explicit null/undefined check
if (brief !== null && brief !== undefined) {
```

### ✅ **No Floating Promises**
```typescript
// ❌ SALAH - Promise tidak di-handle
window.location.href = "/track";

// ✅ BENAR - Gunakan void operator
void (window.location.href = "/track");
```

## 🚨 **CHECKLIST SEBELUM COMMIT**

### 1. **Import Order Check**
- [ ] External libraries di atas
- [ ] Next.js modules
- [ ] React modules
- [ ] Internal components
- [ ] No unused imports

### 2. **TypeScript Types**
- [ ] Semua function punya return type
- [ ] No `any` types
- [ ] Gunakan `JSX.Element` bukan `React.JSX.Element`
- [ ] Interface/type definitions lengkap

### 3. **Code Quality**
- [ ] No unused variables
- [ ] Explicit boolean checks
- [ ] Handle promises dengan `void` jika perlu
- [ ] HTML entities untuk special characters

### 4. **Testing Commands**
```bash
# Selalu jalankan sebelum commit
npm run lint
npm run type-check  # jika ada
npm run build       # untuk memastikan build sukses
```

## 🔍 **ANALISIS FITUR BARU - TEMPLATE**

Sebelum implement fitur baru, selalu check:

### **1. Import Analysis**
- Apakah library baru butuh import?
- Dimana posisi import yang benar?
- Apakah ada conflict dengan existing imports?

### **2. TypeScript Safety**
- Apakah ada data dari API yang butuh interface?
- Apakah function baru butuh explicit types?
- Apakah ada `any` yang bisa dihindari?

### **3. Component Structure**
- Apakah component baru follow naming convention?
- Apakah return type sudah benar?
- Apakah props interface sudah defined?

### **4. State Management**
- Apakah useState/useEffect digunakan dengan benar?
- Apakah ada dependency yang unused?
- Apakah cleanup function diperlukan?

## 🛡️ **PREVENTION STRATEGIES**

### **1. Pre-commit Hooks**
```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run type-check
```

### **2. VSCode Settings**
```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### **3. ESLint Config Monitoring**
- Selalu update ESLint rules sesuai project growth
- Monitor new rules yang bisa improve code quality
- Regular review ESLint config

## 📝 **NOTES UNTUK AI ASSISTANT**

Ketika user request fitur baru:

1. **Analisa Impact ESLint**
   - Check import requirements
   - Predict potential type issues
   - Identify possible unused variables

2. **Suggest Alternatives**
   - Jika fitur bisa cause ESLint error
   - Berikan alternative approach
   - Explain trade-offs

3. **Proactive Prevention**
   - Implement dengan ESLint-compliant code
   - Add proper types from start
   - Follow established patterns

---

**Last Updated:** $(date)
**Status:** ✅ All ESLint errors resolved
**Next Review:** Setiap ada fitur baru atau library update