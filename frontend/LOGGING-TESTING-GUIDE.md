# Panduan Testing Logging System

## 🚀 Quick Start Testing

### 1. Jalankan Script Otomatis
```bash
cd frontend
./test-logging.sh
```

### 2. Testing di Browser

#### A. Buka Developer Tools
1. Buka http://localhost:9005
2. Tekan F12 untuk membuka Developer Tools
3. Pilih tab Console

#### B. Test Logging Functions
```javascript
// Test semua fungsi logging
window.testLogging()

// Test remote logging ke API
window.testRemoteLogging()

// Test batch logging
window.testBatchLogging()
```

#### C. Test Interaksi UI
1. **Homepage Testing:**
   - Klik tombol dropdown fitur
   - Klik tombol "Lihat Semua Produk"
   - Submit form pelacakan pesanan

2. **Admin Login Testing:**
   - Buka http://localhost:9005/admin/login
   - Ketik di input username/password
   - Klik tombol login

### 3. Monitoring Logs

#### A. Browser Console
- Lihat log real-time di Console tab
- Periksa Network tab untuk API calls ke `/api/logs`

#### B. Server Terminal
- Log akan muncul di terminal frontend server
- Format JSON dengan metadata lengkap

## 📊 Log Structure

### Single Log Entry
```typescript
interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: string;
  sessionId?: string;
}
```

### Enriched Server Log
```json
{
  "level": "info",
  "message": "User clicked button",
  "timestamp": "2025-07-28T08:01:34.940Z",
  "context": {
    "buttonText": "Login",
    "componentName": "AdminLoginPage"
  },
  "serverTimestamp": "2025-07-28T08:01:34.940Z",
  "clientIP": "::1",
  "userAgent": "Mozilla/5.0...",
  "source": "frontend"
}
```

## 🔍 Testing Scenarios

### 1. Component Lifecycle Logging
```typescript
// Otomatis tercatat saat komponen mount/unmount
useComponentLifecycle('MyComponent');
```

### 2. User Action Logging
```typescript
const { logClick, logFormSubmit, logInputChange } = useActionLogger('PageName');

// Button click
logClick('Login Button', { disabled: false });

// Form submission
logFormSubmit('Login Form', { hasUsername: true, hasPassword: true });

// Input change
logInputChange('username', 'john_doe');
```

### 3. API Call Logging
```typescript
logger.apiCall('POST', '/api/auth/login', 200, 1250);
```

### 4. Performance Logging
```typescript
logger.performance('page_load', 2500, { route: '/admin/login' });
```

### 5. Error Logging
```typescript
logger.error('Login failed', new Error('Invalid credentials'), {
  username: 'john_doe',
  attemptCount: 3
});
```

## 🛠️ Development Tools

### Logger Configuration
```typescript
// Di LoggerProvider
<LoggerProvider
  config={{
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    logLevel: 'debug',
    batchSize: 10,
    flushInterval: 5000
  }}
>
```

### Environment Variables
```env
NODE_ENV=development  # Enables console logging
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📈 Production Considerations

### 1. Log Levels
- **Development:** `debug` level
- **Production:** `info` level atau higher

### 2. Remote Logging
- Aktifkan `enableRemoteLogging: true` di production
- Integrasikan dengan service seperti:
  - Sentry untuk error tracking
  - LogRocket untuk session replay
  - DataDog untuk monitoring

### 3. Performance
- Batch logging untuk mengurangi network calls
- Debounce input change logging
- Async processing untuk tidak block UI

### 4. Privacy
- Jangan log sensitive data (passwords, tokens)
- Hash atau mask PII data
- Implement data retention policies

## 🔧 Troubleshooting

### Common Issues

1. **API 400 Error:**
   - Periksa format timestamp
   - Pastikan required fields ada
   - Validasi schema dengan Zod

2. **Logs Tidak Muncul:**
   - Periksa LoggerProvider di root layout
   - Cek konfigurasi environment
   - Verify server running

3. **Performance Issues:**
   - Kurangi log level di production
   - Increase batch size
   - Implement log sampling

### Debug Commands
```bash
# Check server status
curl http://localhost:9005/api/logs

# Test single log
curl -X POST http://localhost:9005/api/logs \
  -H "Content-Type: application/json" \
  -d '{"level":"info","message":"test","timestamp":"2025-07-28T08:01:34.940Z"}'
```

## 📝 Next Steps

1. **Integrate External Services:**
   - Sentry for error tracking
   - Analytics for user behavior
   - APM for performance monitoring

2. **Enhanced Features:**
   - Log search and filtering
   - Real-time dashboards
   - Alerting system

3. **Security:**
   - Log encryption
   - Access controls
   - Audit trails

4. **Compliance:**
   - GDPR compliance
   - Data retention policies
   - Privacy controls