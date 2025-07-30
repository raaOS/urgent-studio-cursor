# 📝 **LOGGING IMPLEMENTATION PLAN**

## 🎯 **OVERVIEW**

Implementasi sistem logging yang komprehensif untuk Urgent Studio dengan fokus pada debugging, monitoring, dan troubleshooting.

---

## 🔧 **BACKEND LOGGING (Go/Gin)**

### 1. **Structured Logging Setup**

```go
// File: backend/logger.go
package main

import (
    "os"
    "time"
    
    "github.com/sirupsen/logrus"
    "github.com/gin-gonic/gin"
)

type Logger struct {
    *logrus.Logger
}

func NewLogger() *Logger {
    log := logrus.New()
    
    // Set format
    log.SetFormatter(&logrus.JSONFormatter{
        TimestampFormat: time.RFC3339,
    })
    
    // Set level based on environment
    if gin.Mode() == gin.ReleaseMode {
        log.SetLevel(logrus.InfoLevel)
    } else {
        log.SetLevel(logrus.DebugLevel)
    }
    
    // Output to file in production
    if gin.Mode() == gin.ReleaseMode {
        file, err := os.OpenFile("logs/app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
        if err == nil {
            log.SetOutput(file)
        }
    }
    
    return &Logger{log}
}

// Middleware untuk request logging
func (l *Logger) GinLogger() gin.HandlerFunc {
    return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        l.WithFields(logrus.Fields{
            "status_code":  param.StatusCode,
            "latency":      param.Latency,
            "client_ip":    param.ClientIP,
            "method":       param.Method,
            "path":         param.Path,
            "user_agent":   param.Request.UserAgent(),
            "error":        param.ErrorMessage,
        }).Info("HTTP Request")
        
        return ""
    })
}
```

### 2. **Database Logging**

```go
// File: backend/database.go - Enhanced version
func (r *ProductRepository) GetAllProducts() ([]Product, error) {
    start := time.Now()
    
    query := `SELECT id, name, description, price, category, image_url, 
              features, delivery_time, revisions, popular, created_at, updated_at 
              FROM products ORDER BY name ASC`
    
    logger.WithFields(logrus.Fields{
        "operation": "GetAllProducts",
        "query":     query,
    }).Debug("Executing database query")
    
    rows, err := r.db.Query(query)
    if err != nil {
        logger.WithFields(logrus.Fields{
            "operation": "GetAllProducts",
            "error":     err.Error(),
            "duration":  time.Since(start),
        }).Error("Database query failed")
        return nil, err
    }
    defer rows.Close()
    
    var products []Product
    for rows.Next() {
        var p Product
        var features []byte
        
        scanErr := rows.Scan(
            &p.ID, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
            &features, &p.DeliveryTime, &p.Revisions, &p.Popular, &p.CreatedAt, &p.UpdatedAt,
        )
        if scanErr != nil {
            logger.WithFields(logrus.Fields{
                "operation": "GetAllProducts",
                "error":     scanErr.Error(),
                "product_id": p.ID,
            }).Error("Row scan failed")
            return nil, scanErr
        }
        
        p.Features = features
        products = append(products, p)
    }
    
    logger.WithFields(logrus.Fields{
        "operation":     "GetAllProducts",
        "products_count": len(products),
        "duration":      time.Since(start),
    }).Info("Products retrieved successfully")
    
    return products, nil
}
```

### 3. **Error Logging**

```go
// File: backend/product_handler.go - Enhanced version
func (h *ProductHandler) GetAllProducts(c *gin.Context) {
    requestID := c.GetHeader("X-Request-ID")
    if requestID == "" {
        requestID = generateRequestID()
    }
    
    logger := logger.WithFields(logrus.Fields{
        "request_id": requestID,
        "handler":    "GetAllProducts",
        "user_ip":    c.ClientIP(),
    })
    
    logger.Info("Processing get all products request")
    
    products, err := h.repo.GetAllProducts()
    if err != nil {
        logger.WithError(err).Error("Failed to get products from database")
        c.JSON(http.StatusInternalServerError, gin.H{
            "error":      "Internal server error",
            "request_id": requestID,
        })
        return
    }
    
    logger.WithField("products_count", len(products)).Info("Products retrieved successfully")
    c.JSON(http.StatusOK, products)
}
```

---

## 🎨 **FRONTEND LOGGING (Next.js/TypeScript)**

### 1. **Logger Service Setup**

```typescript
// File: frontend/src/services/logger.ts
interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private sessionId: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
      sessionId: this.sessionId,
      userId: this.getCurrentUserId(),
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get from auth context or localStorage
    return localStorage.getItem('userId') || undefined;
  }

  private async sendToServer(logEntry: LogEntry): Promise<void> {
    if (!this.isDevelopment) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logEntry),
        });
      } catch (error) {
        console.error('Failed to send log to server:', error);
      }
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    const logEntry = this.createLogEntry('ERROR', message, context, error);
    console.error(message, { context, error });
    this.sendToServer(logEntry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('WARN', message, context);
    console.warn(message, context);
    this.sendToServer(logEntry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('INFO', message, context);
    if (this.isDevelopment) {
      console.info(message, context);
    }
    this.sendToServer(logEntry);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry('DEBUG', message, context);
    if (this.isDevelopment) {
      console.debug(message, context);
    }
    this.sendToServer(logEntry);
  }
}

export const logger = new Logger();
```

### 2. **API Call Logging**

```typescript
// File: frontend/src/services/httpClient.ts - Enhanced version
export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();
    
    logger.info('API Request Started', {
      requestId,
      method: options.method || 'GET',
      url,
      headers: options.headers,
    });

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        logger.error('API Request Failed', {
          requestId,
          status: response.status,
          statusText: response.statusText,
          duration,
          url,
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      logger.info('API Request Successful', {
        requestId,
        status: response.status,
        duration,
        url,
        responseSize: JSON.stringify(data).length,
      });
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('API Request Error', {
        requestId,
        duration,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      }, error instanceof Error ? error : undefined);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### 3. **Component Error Logging**

```typescript
// File: frontend/src/components/ErrorBoundary.tsx
'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from '@/services/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React Component Error', {
      component: 'ErrorBoundary',
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: errorInfo.errorBoundary,
      },
    }, error);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. **User Action Logging**

```typescript
// File: frontend/src/hooks/useActionLogger.ts
import { useCallback } from 'react';
import { logger } from '@/services/logger';

interface UserAction {
  action: string;
  component: string;
  data?: Record<string, unknown>;
}

export function useActionLogger(component: string) {
  const logAction = useCallback((action: string, data?: Record<string, unknown>) => {
    logger.info('User Action', {
      component,
      action,
      data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  }, [component]);

  return { logAction };
}

// Usage example:
// const { logAction } = useActionLogger('ProductForm');
// logAction('submit_form', { productId: '123' });
```

---

## 📊 **LOG AGGREGATION & MONITORING**

### 1. **Log Collection API**

```typescript
// File: frontend/src/app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    
    // Validate log entry
    if (!logEntry.level || !logEntry.message) {
      return NextResponse.json(
        { error: 'Invalid log entry' },
        { status: 400 }
      );
    }
    
    // In production, send to log aggregation service
    // For now, just log to console
    console.log('Frontend Log:', JSON.stringify(logEntry, null, 2));
    
    // Could send to external services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom log server
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log API error:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
```

### 2. **Health Check with Logging**

```typescript
// File: frontend/src/app/api/health/route.ts - Enhanced version
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const dbStatus = await checkDatabase();
    
    // Test external services
    const servicesStatus = await checkExternalServices();
    
    const duration = Date.now() - startTime;
    
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      responseTime: duration,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      services: servicesStatus,
    };
    
    logger.info('Health Check Completed', {
      duration,
      status: 'healthy',
      checks: Object.keys(healthData).length,
    });
    
    return NextResponse.json(healthData);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Health Check Failed', {
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## 🔧 **IMPLEMENTATION STEPS**

### Phase 1: Backend Logging (Hari 1)
1. Install logrus: `go get github.com/sirupsen/logrus`
2. Create logger.go file
3. Add logging to main.go
4. Add logging to database operations
5. Add logging to API handlers

### Phase 2: Frontend Logging (Hari 2)
1. Create logger service
2. Add to httpClient
3. Create ErrorBoundary
4. Add user action logging
5. Create log collection API

### Phase 3: Monitoring Setup (Hari 3)
1. Setup log rotation
2. Create log analysis scripts
3. Add alerting for critical errors
4. Create logging dashboard
5. Document logging standards

---

## 📈 **LOG ANALYSIS & ALERTS**

### Critical Alerts:
- Database connection failures
- Authentication failures
- API response time > 5 seconds
- Error rate > 5% in 5 minutes
- Memory usage > 80%

### Daily Reports:
- API usage statistics
- Error summary
- Performance metrics
- User activity patterns

---

*Logging implementation akan memberikan visibility penuh terhadap sistem dan membantu debugging yang lebih efektif.*