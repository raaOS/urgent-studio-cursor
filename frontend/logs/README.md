# Logs Directory

Direktori ini digunakan untuk menyimpan log files dari aplikasi frontend.

## Structure
```
logs/
├── app.log          # General application logs
├── error.log        # Error logs
├── access.log       # Access logs
└── debug.log        # Debug logs (development only)
```

## Log Rotation
- Logs akan di-rotate setiap hari
- Maximum 30 hari history
- Compressed untuk menghemat space

## Production Notes
- Di production, logs akan dikirim ke external service
- Local logs hanya untuk backup dan debugging
- Sensitive data tidak boleh masuk ke logs