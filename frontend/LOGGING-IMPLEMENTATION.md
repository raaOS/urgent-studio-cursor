# 📊 Implementasi Logging Frontend - Urgent Studio

## 🎯 Overview

Implementasi logging frontend yang komprehensif untuk monitoring, debugging, dan analytics aplikasi Urgent Studio. Sistem ini menggunakan TypeScript yang aman dan terintegrasi dengan backend logging.

## 🏗️ Arsitektur Logging

### 1. Core Logger Service (`/src/services/logger.ts`)
- **Logger Class**: Singleton pattern untuk konsistensi
- **Type Safety**: Semua tipe didefinisikan dengan interface TypeScript
- **Multi-destination**: Console logging (development) + Remote logging (production)
- **Queue System**: Batch logging untuk efisiensi network

### 2. HTTP Client Integration (`/src/services/httpClient.ts`)
- **Automatic API Logging**: Semua HTTP request/response dicatat
- **Performance Metrics**: Durasi request, status code, error handling
- **Request Context**: Method, URL, data size, headers

### 3. React Hooks (`/src/hooks/useActionLogger.ts`)
- **useActionLogger**: Logging user actions (click, form submit, navigation)
- **useComponentLifecycle**: Tracking component mount/unmount
- **useApiLogger**: Specialized API call logging

### 4. Error Boundary (`/src/components/ErrorBoundary.tsx`)
- **Global Error Catching**: Menangkap semua React errors
- **User-friendly UI**: Error display dengan retry functionality
- **Automatic Logging**: Error details dikirim ke logging system

### 5. Provider System (`/src/providers/LoggerProvider.tsx`)
- **Global Configuration**: Setup logger untuk seluruh aplikasi
- **Environment-based**: Different settings untuk dev/prod
- **Context Management**: User ID, session tracking

## 🚀 Cara Penggunaan

### 1. Basic Logging
```typescript
import logger from '@/services/logger';

// Log levels
logger.debug('Debug message', { context: 'development' });
logger.info('Info message', { userId: '123' });
logger.warn('Warning message', { component: 'PaymentForm' });
logger.error('Error occurred', { action: 'submit' }, error);

// Specialized logging
logger.apiCall('POST', '/api/orders', 201, 150); // method, url, status, duration
logger.userAction('click', 'HomePage', { element: 'buy-button' });
logger.pageView('/products', 'Product Catalog');
logger.performance('page-load', 1200, 'ms');
```

### 2. Component Integration
```typescript
import { useActionLogger, useComponentLifecycle } from '@/hooks/useActionLogger';

function MyComponent() {
  const { logClick, logFormSubmit } = useActionLogger('MyComponent');
  useComponentLifecycle('MyComponent');

  const handleClick = () => {
    logClick('submit-button', {
      metadata: { formValid: true, userType: 'premium' }
    });
  };

  const handleSubmit = (formData) => {
    logFormSubmit('contact-form', {
      metadata: { fields: Object.keys(formData).length }
    });
  };

  return (
    <button onClick={handleClick}>Submit</button>
  );
}
```

### 3. API Logging (Automatic)
```typescript
// HTTP client sudah terintegrasi, semua request otomatis di-log
import { httpClient } from '@/services/httpClient';

// Ini akan otomatis log: request start, duration, status, errors
const response = await httpClient.post('/api/orders', orderData);
```

## 📋 Log Structure

### LogEntry Interface
```typescript
interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}
```

### Log Levels
- **DEBUG**: Development debugging, verbose information
- **INFO**: General information, user actions, API calls
- **WARN**: Warning conditions, non-critical issues
- **ERROR**: Error conditions, exceptions, failures

## 🔧 Konfigurasi

### Environment Variables
```env
# Development
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING=true
NEXT_PUBLIC_ENABLE_REMOTE_LOGGING=false

# Production
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_CONSOLE_LOGGING=false
NEXT_PUBLIC_ENABLE_REMOTE_LOGGING=true
NEXT_PUBLIC_LOG_ENDPOINT=/api/logs
```

### Logger Configuration
```typescript
const config: LoggerConfig = {
  level: 'info',
  enableConsole: process.env.NODE_ENV === 'development',
  enableRemote: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs',
  batchSize: 10,
  flushInterval: 5000
};
```

## 📊 Monitoring & Analytics

### 1. User Behavior Tracking
- **Page Views**: Halaman yang dikunjungi, durasi
- **User Actions**: Click, form submit, navigation
- **User Journey**: Flow pengguna melalui aplikasi

### 2. Performance Monitoring
- **Page Load Times**: Waktu loading halaman
- **API Response Times**: Durasi API calls
- **Component Lifecycle**: Mount/unmount performance

### 3. Error Tracking
- **JavaScript Errors**: Runtime errors, component errors
- **API Errors**: Failed requests, network issues
- **User-reported Issues**: Error boundary catches

## 🧪 Testing Logging

### 1. Manual Testing
```typescript
// Buka browser console dan jalankan:
window.testLogging(); // Test semua logging functions
window.testRemoteLogging(); // Test remote endpoint
window.testBatchLogging(); // Test batch functionality
```

### 2. Development Tools
- **Browser Console**: Lihat logs real-time
- **Network Tab**: Monitor API calls ke /api/logs
- **React DevTools**: Component lifecycle tracking

## 📈 Production Monitoring

### 1. Log Collection
- **API Endpoint**: `/api/logs` menerima log dari frontend
- **Batch Processing**: Multiple logs dalam satu request
- **Validation**: Zod schema validation untuk data integrity

### 2. Log Storage
- **Console Output**: Development debugging
- **File System**: Production log files
- **External Services**: Integration dengan logging services (future)

### 3. Alerting (Future Enhancement)
- **Error Rate Monitoring**: Alert jika error rate tinggi
- **Performance Degradation**: Alert jika response time lambat
- **User Experience Issues**: Alert untuk UX problems

## 🔒 Security & Privacy

### 1. Data Sanitization
- **Password Masking**: Input password tidak di-log
- **PII Protection**: Personal information di-filter
- **Sensitive Data**: Credit card, phone numbers di-mask

### 2. Log Retention
- **Development**: Logs disimpan sementara
- **Production**: Retention policy sesuai compliance
- **GDPR Compliance**: User data handling sesuai regulasi

## 🚀 Next Steps

### 1. Enhanced Analytics
- [ ] User session replay
- [ ] Heatmap integration
- [ ] A/B testing support

### 2. Advanced Monitoring
- [ ] Real-time dashboards
- [ ] Custom metrics
- [ ] Business intelligence integration

### 3. Performance Optimization
- [ ] Log compression
- [ ] Intelligent sampling
- [ ] Edge logging

## 📞 Support

Untuk pertanyaan atau issues terkait logging system:
1. Check browser console untuk errors
2. Verify environment variables
3. Test dengan `window.testLogging()`
4. Review log output di `/api/logs`

---

**Status**: ✅ Production Ready
**Last Updated**: January 2025
**Version**: 1.0.0