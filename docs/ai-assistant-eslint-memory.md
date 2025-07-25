# 🤖 AI Assistant Memory & Rules

## 🧠 **MEMORY: ESLint Error Patterns**

Sebagai AI Assistant, saya harus mengingat pattern error ESLint yang sering terjadi:

### **1. Import Order Violations**
- `lucide-react` harus sebelum `next/link`
- `@hookform/resolvers/zod` harus sebelum `react`
- External libraries selalu di atas internal imports

### **2. TypeScript Issues**
- `React.JSX.Element` → `JSX.Element`
- Missing return types pada functions
- Implicit `any` types

### **3. Unused Code**
- Import statements yang tidak digunakan
- Variables yang di-declare tapi tidak dipakai
- useEffect dependencies yang redundant

## 🔍 **ANALISIS FITUR BARU - PROTOCOL**

Ketika user request fitur baru, saya akan:

### **STEP 1: Pre-Analysis**
```
🔍 ANALISIS IMPACT ESLINT:
- Import requirements: [list libraries needed]
- Type definitions: [interfaces/types needed]
- Potential conflicts: [existing code that might conflict]
- ESLint risk level: LOW/MEDIUM/HIGH
```

### **STEP 2: Risk Assessment**
```
⚠️ POTENSI MASALAH ESLINT:
- Import order issues: [yes/no + explanation]
- TypeScript violations: [yes/no + explanation]  
- Unused code risk: [yes/no + explanation]
- Alternative approach: [if high risk]
```

### **STEP 3: Implementation Strategy**
```
✅ STRATEGI IMPLEMENTASI:
- Safe approach: [ESLint-compliant method]
- Code structure: [how to organize]
- Testing plan: [npm run lint + build]
```

## 🛡️ **PREVENTION RULES**

### **Rule 1: Always Check Import Order**
Sebelum menambah import baru:
1. Cek existing imports di file
2. Tentukan posisi yang benar sesuai hierarchy
3. Test dengan `npm run lint`

### **Rule 2: TypeScript First**
Sebelum implement logic:
1. Define interfaces/types dulu
2. Set explicit return types
3. Avoid `any` dengan cara apapun

### **Rule 3: Clean Code**
Setelah implement:
1. Remove unused imports/variables
2. Check boolean expressions
3. Handle promises properly

## 🚨 **WARNING SYSTEM**

Ketika detect potential ESLint issue:

```
🚨 PERINGATAN ESLINT!

Fitur yang Anda minta berpotensi menyebabkan error ESLint:
- [specific issue]
- [impact explanation]

ALTERNATIF YANG AMAN:
- [safe approach 1]
- [safe approach 2]

Apakah Anda ingin melanjutkan dengan alternatif yang aman?
```

## 📋 **CHECKLIST TEMPLATE**

Untuk setiap fitur baru:

```
□ Import analysis completed
□ TypeScript types defined
□ ESLint compliance verified
□ Alternative approaches considered
□ User informed about risks
□ Implementation strategy clear
□ Testing plan ready
```

## 🎯 **RESPONSE TEMPLATE**

```markdown
## 🔍 **ANALISIS FITUR: [Nama Fitur]**

### **ESLint Impact Assessment:**
- Risk Level: [LOW/MEDIUM/HIGH]
- Potential Issues: [list]
- Required Libraries: [list]

### **Recommended Approach:**
[Safe implementation strategy]

### **Alternative Options:**
1. [Option 1 - pros/cons]
2. [Option 2 - pros/cons]

### **Implementation Plan:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Apakah Anda setuju dengan pendekatan ini?**
```

---

**AI Assistant Commitment:**
- Selalu analisa ESLint impact sebelum implement
- Berikan warning jika ada potensi error
- Suggest safe alternatives
- Prioritize code quality over speed