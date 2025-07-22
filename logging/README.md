# Logging Stack - Urgent Studio

Folder ini berisi konfigurasi untuk stack logging Urgent Studio menggunakan ELK Stack (Elasticsearch, Logstash, Kibana) dan Filebeat.

## Komponen

- **Elasticsearch**: Database dan mesin pencarian untuk menyimpan log
- **Logstash**: Pemrosesan dan transformasi log
- **Kibana**: Visualisasi dan eksplorasi log
- **Filebeat**: Pengumpul log dari container Docker

## Cara Menggunakan

### Menjalankan Stack Logging

```bash
cd logging
docker-compose up -d
```

### Mengakses Dashboard

- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

### Konfigurasi Kibana

Saat pertama kali mengakses Kibana, Anda perlu mengonfigurasi index pattern:

1. Buka Kibana di http://localhost:5601
2. Buka menu "Stack Management" > "Index Patterns"
3. Buat index pattern baru dengan pola `urgent-studio-logs-*`
4. Pilih `@timestamp` sebagai Time field
5. Klik "Create index pattern"

## Integrasi dengan Aplikasi

### Backend (Go)

Untuk mengintegrasikan logging dari backend Go, gunakan library logging yang kompatibel dengan format JSON:

```go
import (
    "github.com/gin-gonic/gin"
    "github.com/sirupsen/logrus"
    "os"
    "time"
)

func setupLogging() {
    // Konfigurasi logrus untuk output JSON
    logrus.SetFormatter(&logrus.JSONFormatter{
        TimestampFormat: time.RFC3339,
    })
    logrus.SetOutput(os.Stdout)
    
    // Set level berdasarkan environment
    if gin.Mode() == gin.DebugMode {
        logrus.SetLevel(logrus.DebugLevel)
    } else {
        logrus.SetLevel(logrus.InfoLevel)
    }
}

// Middleware untuk logging request
func loggingMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Waktu mulai
        startTime := time.Now()
        
        // Proses request
        c.Next()
        
        // Waktu selesai
        endTime := time.Now()
        
        // Log request
        logrus.WithFields(logrus.Fields{
            "status_code": c.Writer.Status(),
            "method": c.Request.Method,
            "path": c.Request.URL.Path,
            "ip": c.ClientIP(),
            "duration": endTime.Sub(startTime).Milliseconds(),
            "user_agent": c.Request.UserAgent(),
        }).Info("Request processed")
    }
}

func main() {
    setupLogging()
    
    r := gin.New()
    r.Use(loggingMiddleware())
    
    // ... rute lainnya
    
    r.Run()
}
```

### Frontend (Next.js)

Untuk frontend, gunakan library seperti `winston` untuk logging:

```javascript
// logger.js
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console()
  ],
});

export default logger;
```

## Visualisasi dan Dashboard

Kibana memungkinkan Anda membuat visualisasi dan dashboard kustom untuk memantau:

- Tingkat error per layanan
- Performa API
- Pola penggunaan
- Tren error

## Retensi Log

Secara default, Elasticsearch akan menyimpan log tanpa batas waktu. Untuk mengonfigurasi kebijakan retensi, gunakan Index Lifecycle Management (ILM) di Kibana.