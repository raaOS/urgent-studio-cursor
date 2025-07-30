# 🤖 FORGE AI CONTEXT & MEMORY SYSTEM

## 📋 **INFORMASI PROYEK URGENT STUDIO 2025**

### **Stack Teknologi:**
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI
- **Backend**: Go (Gin framework)  
- **Database**: PostgreSQL
- **Deployment**: Docker, GitHub Actions CI/CD
- **Monitoring**: Prometheus + Grafana, ELK Stack

### **Struktur Proyek:**
```
urgent-studio-2025/
├── frontend/           # Next.js app (port 9005)
├── backend/           # Go API (port 8080) 
├── database/          # PostgreSQL schemas & migrations
├── docs/              # Dokumentasi lengkap
├── monitoring/        # Prometheus + Grafana
└── logging/           # ELK Stack
```

---

## 🧠 **MEMORY: RULES & STANDARDS**

### **1. ESLint & Code Quality Rules:**
- **Import Order**: External libraries → Internal imports → Relative imports
- **TypeScript**: Explicit return types, no `any`, proper interfaces
- **React**: Functional components, proper hooks usage
- **Go**: Proper error handling, structured logging, clean architecture

### **2. Komentar Kode WAJIB:**
Setiap kode harus memiliki komentar kontekstual:

```typescript
/**
 * @component OrderForm
 * @description Form untuk membuat pesanan desain
 * @context Mengikuti business expansion plan (docs/business-expansion-plan.md)
 * @architecture Microservice ready (docs/microservice-architecture.md)
 */
```

### **3. API Design Standards:**
- RESTful endpoints: `/api/v1/orders`
- Consistent response format
- Proper HTTP status codes
- JWT authentication + RBAC

---

## 🎯 **BUSINESS CONTEXT**

### **Urgent Studio adalah:**
- Platform desain grafis dengan multiple services
- Target ekspansi ke microservices architecture
- Focus pada UX/UI yang premium
- Sistem pesanan yang kompleks dengan workflow approval

### **Fitur Utama:**
- Order management system
- User authentication & authorization
- Design portfolio showcase
- Admin panel untuk management
- Payment integration
- Real-time notifications

---

## 🔍 **ANALISIS PROTOCOL**

Ketika user request fitur baru, saya akan SELALU:

### **STEP 1: Context Analysis**
```
🔍 ANALISIS KONTEKS:
- Fitur: [nama fitur]
- Impact pada arsitektur: [microservice ready?]
- Business alignment: [sesuai expansion plan?]
- Tech stack compatibility: [Next.js + Go + PostgreSQL]
```

### **STEP 2: ESLint Risk Assessment**
```
⚠️ ESLINT RISK ANALYSIS:
- Import conflicts: [potential issues]
- TypeScript violations: [type safety check]
- Code standards: [compliance with guidelines]
- Alternative approach: [if needed]
```

### **STEP 3: Implementation Strategy**
```
✅ IMPLEMENTATION PLAN:
- Frontend approach: [Next.js specific]
- Backend approach: [Go/Gin specific]
- Database changes: [PostgreSQL schema]
- Testing strategy: [unit + integration]
```

---

## 🛡️ **PREVENTION SYSTEM**

### **Rule 1: Architecture First**
Sebelum coding:
1. Check microservice architecture compliance
2. Verify business expansion alignment  
3. Ensure scalability considerations

### **Rule 2: Quality Gates**
Setiap implementasi:
1. ESLint compliance check
2. TypeScript strict mode
3. Go vet + gofmt validation
4. Test coverage requirements

### **Rule 3: Documentation Update**
Setelah implementasi:
1. Update relevant docs/ files
2. Add contextual comments
3. Update API documentation

---

## 📚 **KNOWLEDGE BASE REFERENCES**

### **Arsitektur & Business:**
- `docs/microservice-architecture.md` - Rencana microservice
- `docs/business-expansion-plan.md` - Strategi bisnis
- `docs/decision-making-process.md` - Proses keputusan

### **Standards & Guidelines:**
- `docs/code-guidelines.md` - Standar coding
- `docs/code-comments-guidelines.md` - Format komentar
- `docs/ai-assistant-eslint-memory.md` - ESLint rules

### **Technical Docs:**
- `docs/ai-memory-integration.md` - Memory system
- `frontend/TYPESCRIPT_STRUCTURE.md` - Frontend structure
- `database/docs/ERD.md` - Database schema

---

## 🚨 **WARNING TRIGGERS**

Saya akan memberikan warning jika:
- Fitur tidak align dengan microservice architecture
- Potential ESLint violations detected
- Breaking changes pada API
- Security implications
- Performance impact concerns

---

## 💾 **SESSION MEMORY PROTOCOL**

### **Setiap Session Baru:**
1. Load project context dari file ini
2. Scan docs/ untuk updates terbaru
3. Check current git status
4. Verify development environment

### **Selama Development:**
1. Maintain conversation context
2. Reference dokumentasi yang relevan
3. Update memory dengan keputusan baru
4. Track code changes dan reasoning

### **End Session:**
1. Summarize changes made
2. Update dokumentasi jika perlu
3. Note any architectural decisions
4. Prepare context for next session

---

## 🔄 **CONTEXT REFRESH COMMAND**

Ketika user ketik: `refresh context` atau `load memory`
Saya akan:
1. Re-read semua docs/ files
2. Scan project structure
3. Check for new files/changes
4. Provide updated project status

---

**🎯 FORGE AI COMMITMENT:**
- Selalu maintain project context dan business rules
- Prioritize code quality dan architecture compliance  
- Provide warnings untuk potential issues
- Keep documentation updated dan relevant
- Ensure consistency dengan established patterns