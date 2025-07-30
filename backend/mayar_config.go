package main

import (
	"fmt"
	"os"
	"time"
)

// Official Mayar.id API URLs
const (
	MayarProductionURL = "https://api.mayar.id/hl/v1"
	MayarSandboxURL    = "https://api.mayar.club/hl/v1"
)

// MayarConfig holds all Mayar.id related configuration
type MayarConfig struct {
	APIKey        string
	WebhookSecret string
	BaseURL       string
	WebhookToken  string
	Environment   string
	SandboxURL    string
	RateLimit     RateLimitConfig
}

// RateLimitConfig holds rate limiting configuration
type RateLimitConfig struct {
	RequestsPerMinute int
	WindowMs          time.Duration
}

// GetMayarConfig loads Mayar configuration from environment variables
func GetMayarConfig() (*MayarConfig, error) {
	config := &MayarConfig{
		APIKey:        os.Getenv("MAYAR_API_KEY"),
		WebhookSecret: os.Getenv("MAYAR_WEBHOOK_SECRET"),
		BaseURL:       getEnvWithDefault("MAYAR_BASE_URL", MayarProductionURL),
		WebhookToken:  os.Getenv("MAYAR_WEBHOOK_TOKEN"),
		Environment:   getEnvWithDefault("MAYAR_ENVIRONMENT", "sandbox"),
		SandboxURL:    getEnvWithDefault("MAYAR_SANDBOX_URL", MayarSandboxURL),
		RateLimit: RateLimitConfig{
			RequestsPerMinute: 60,
			WindowMs:          60000,
		},
	}

	// Validate required fields
	if config.APIKey == "" {
		return nil, fmt.Errorf("MAYAR_API_KEY is required")
	}
	if config.WebhookSecret == "" {
		return nil, fmt.Errorf("MAYAR_WEBHOOK_SECRET is required")
	}

	return config, nil
}

// GetBaseURL returns the appropriate base URL based on environment
func (c *MayarConfig) GetBaseURL() string {
	if c.Environment == "sandbox" && c.SandboxURL != "" {
		return c.SandboxURL
	}
	return c.BaseURL
}

// GetAPIHeaders returns the headers needed for API requests
func (c *MayarConfig) GetAPIHeaders() map[string]string {
	return map[string]string{
		"Authorization": "Bearer " + c.APIKey,
		"Content-Type":  "application/json",
		"Accept":        "application/json",
	}
}

// GetMayarBaseURL returns the appropriate base URL based on environment
func (c *MayarConfig) GetMayarBaseURL() string {
	if c.Environment == "production" {
		return c.BaseURL
	}
	return c.SandboxURL
}

// GetMayarHeaders returns common headers for Mayar API requests
func (c *MayarConfig) GetMayarHeaders() map[string]string {
	return map[string]string{
		"Authorization": fmt.Sprintf("Bearer %s", c.APIKey),
		"Content-Type":  "application/json",
		"Accept":        "application/json",
	}
}

// IsProduction returns true if running in production environment
func (c *MayarConfig) IsProduction() bool {
	return c.Environment == "production"
}

// IsSandbox returns true if running in sandbox environment
func (c *MayarConfig) IsSandbox() bool {
	return c.Environment == "sandbox"
}

// getEnvWithDefault returns environment variable value or default if not set
func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// MayarEndpoints contains all Mayar API endpoints
type MayarEndpoints struct {
	// Product endpoints
	GetAllProducts    string
	GetProductsByType string
	SearchProducts    string
	GetProductDetail  string
	CloseProduct      string
	ReopenProduct     string

	// Invoice endpoints
	CreateInvoice string
	GetInvoice    string
	UpdateInvoice string
	DeleteInvoice string

	// Payment Request endpoints
	CreatePaymentRequest string
	GetPaymentRequest    string

	// Customer endpoints
	CreateCustomer string
	GetCustomer    string
	UpdateCustomer string

	// Transaction endpoints
	GetTransactions    string
	GetTransactionById string

	// Webhook endpoints
	GetWebhookHistory string
	RegisterWebhook   string
	TestWebhook       string
	RetryWebhook      string

	// License endpoints
	VerifyLicense    string
	ActivateLicense  string
	DeactivateLicense string
}

// GetMayarEndpoints returns all Mayar API endpoints with the base URL
func (c *MayarConfig) GetMayarEndpoints() *MayarEndpoints {
	baseURL := c.GetMayarBaseURL()
	
	return &MayarEndpoints{
		// Product endpoints
		GetAllProducts:    fmt.Sprintf("%s/product", baseURL),
		GetProductsByType: fmt.Sprintf("%s/product/type", baseURL),
		SearchProducts:    fmt.Sprintf("%s/product", baseURL),
		GetProductDetail:  fmt.Sprintf("%s/product", baseURL),
		CloseProduct:      fmt.Sprintf("%s/product/close", baseURL),
		ReopenProduct:     fmt.Sprintf("%s/product/open", baseURL),

		// Invoice endpoints
		CreateInvoice: fmt.Sprintf("%s/invoice", baseURL),
		GetInvoice:    fmt.Sprintf("%s/invoice", baseURL),
		UpdateInvoice: fmt.Sprintf("%s/invoice", baseURL),
		DeleteInvoice: fmt.Sprintf("%s/invoice", baseURL),

		// Payment Request endpoints
		CreatePaymentRequest: fmt.Sprintf("%s/request-payment", baseURL),
		GetPaymentRequest:    fmt.Sprintf("%s/request-payment", baseURL),

		// Customer endpoints
		CreateCustomer: fmt.Sprintf("%s/customer", baseURL),
		GetCustomer:    fmt.Sprintf("%s/customer", baseURL),
		UpdateCustomer: fmt.Sprintf("%s/customer", baseURL),

		// Transaction endpoints
		GetTransactions:    fmt.Sprintf("%s/transactions", baseURL),
		GetTransactionById: fmt.Sprintf("%s/transactions", baseURL),

		// Webhook endpoints
		GetWebhookHistory: fmt.Sprintf("%s/webhook/history", baseURL),
		RegisterWebhook:   fmt.Sprintf("%s/webhook/register", baseURL),
		TestWebhook:       fmt.Sprintf("%s/webhook/test", baseURL),
		RetryWebhook:      fmt.Sprintf("%s/webhook/retry", baseURL),

		// License endpoints
		VerifyLicense:     fmt.Sprintf("%s/license/verify", baseURL),
		ActivateLicense:   fmt.Sprintf("%s/license/activate", baseURL),
		DeactivateLicense: fmt.Sprintf("%s/license/deactivate", baseURL),
	}
}