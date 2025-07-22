# Monitoring Stack - Urgent Studio

Folder ini berisi konfigurasi untuk stack monitoring Urgent Studio menggunakan Prometheus dan Grafana.

## Komponen

- **Prometheus**: Sistem monitoring dan alerting
- **Grafana**: Platform visualisasi dan dashboard
- **Node Exporter**: Mengumpulkan metrik sistem host
- **cAdvisor**: Mengumpulkan metrik container

## Cara Menggunakan

### Menjalankan Stack Monitoring

```bash
cd monitoring
docker-compose up -d
```

### Mengakses Dashboard

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (login: admin/admin)

### Konfigurasi Grafana

Grafana sudah dikonfigurasi dengan dashboard default untuk memantau:

- HTTP Request Rate
- HTTP Request Duration
- Memory Usage
- CPU Usage

## Integrasi dengan Aplikasi

### Backend (Go)

Untuk mengekspos metrik dari backend Go, tambahkan middleware Prometheus di `main.go`:

```go
import (
    "github.com/gin-gonic/gin"
    "github.com/prometheus/client_golang/prometheus"
    "github.com/prometheus/client_golang/prometheus/promhttp"
)

// Inisialisasi metrik
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"handler", "method", "status"},
    )
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
            Buckets: prometheus.DefBuckets,
        },
        []string{"handler", "method"},
    )
)

func init() {
    // Register metrics
    prometheus.MustRegister(httpRequestsTotal)
    prometheus.MustRegister(httpRequestDuration)
}

// Middleware untuk mencatat metrik
func prometheusMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.FullPath()
        method := c.Request.Method

        c.Next()

        status := strconv.Itoa(c.Writer.Status())
        elapsed := time.Since(start).Seconds()

        httpRequestsTotal.WithLabelValues(path, method, status).Inc()
        httpRequestDuration.WithLabelValues(path, method).Observe(elapsed)
    }
}

func main() {
    r := gin.Default()
    
    // Gunakan middleware Prometheus
    r.Use(prometheusMiddleware())
    
    // Endpoint untuk metrik Prometheus
    r.GET("/metrics", gin.WrapH(promhttp.Handler()))
    
    // ... rute lainnya
    
    r.Run()
}
```

## Alerting

Untuk mengonfigurasi alerting, tambahkan aturan di `prometheus.yml` dan konfigurasikan channel notifikasi di Grafana.

## Ekspor dan Impor Dashboard

Dashboard Grafana dapat diekspor dan diimpor melalui UI Grafana atau dengan menyimpan file JSON di folder `grafana/dashboards`.