package main

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

var logger *logrus.Logger

func NewLogger() *logrus.Logger {
	log := logrus.New()

	// Set format to JSON for structured logging
	log.SetFormatter(&logrus.JSONFormatter{
		TimestampFormat: time.RFC3339,
		PrettyPrint:     gin.Mode() != gin.ReleaseMode,
	})

	// Set level based on environment
	if gin.Mode() == gin.ReleaseMode {
		log.SetLevel(logrus.InfoLevel)
	} else {
		log.SetLevel(logrus.DebugLevel)
	}

	// Create logs directory if it doesn't exist
	if _, err := os.Stat("logs"); os.IsNotExist(err) {
		if err := os.Mkdir("logs", 0755); err != nil {
			log.WithError(err).Warn("Failed to create logs directory")
		}
	}

	// Output to file in production
	if gin.Mode() == gin.ReleaseMode {
		file, err := os.OpenFile("logs/app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err == nil {
			log.SetOutput(file)
		} else {
			log.WithError(err).Warn("Failed to open log file, using stdout")
		}
	}

	return log
}

// GinLogger returns a gin.HandlerFunc for logging HTTP requests
func GinLogger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		if logger != nil {
			logger.WithFields(logrus.Fields{
				"status_code": param.StatusCode,
				"latency":     param.Latency,
				"client_ip":   param.ClientIP,
				"method":      param.Method,
				"path":        param.Path,
				"user_agent":  param.Request.UserAgent(),
				"error":       param.ErrorMessage,
			}).Info("HTTP Request")
		}
		return ""
	})
}

// GinRecovery returns a gin.HandlerFunc for recovering from panics
func GinRecovery() gin.HandlerFunc {
	return gin.RecoveryWithWriter(os.Stdout, func(c *gin.Context, recovered interface{}) {
		if logger != nil {
			logger.WithFields(logrus.Fields{
				"panic":     recovered,
				"method":    c.Request.Method,
				"path":      c.Request.URL.Path,
				"client_ip": c.ClientIP(),
			}).Error("Panic recovered")
		}
	})
}

// InitLogger initializes the global logger instance
func InitLogger() {
	logger = NewLogger()
	logger.Info("Logger initialized successfully")
}

// Helper functions for easy logging
func LogInfo(message string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Info(message)
	}
}

func LogError(message string, fields logrus.Fields, err error) {
	if logger != nil {
		entry := logger.WithFields(fields)
		if err != nil {
			entry = entry.WithError(err)
		}
		entry.Error(message)
	}
}

func LogWarn(message string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Warn(message)
	}
}

func LogDebug(message string, fields logrus.Fields) {
	if logger != nil {
		logger.WithFields(fields).Debug(message)
	}
}

// GenerateRequestID generates a unique request ID
func GenerateRequestID() string {
	return fmt.Sprintf("%d_%s", time.Now().UnixNano(), randomString(8))
}

func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}