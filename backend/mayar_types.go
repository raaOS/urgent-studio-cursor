package main

import "time"

// =============================================================================
// COMMON TYPES
// =============================================================================

// MayarErrorResponse represents error response from Mayar API
type MayarErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

// PaginationMeta represents pagination metadata
type PaginationMeta struct {
	Page       int `json:"page"`
	PageSize   int `json:"pageSize"`
	TotalItems int `json:"totalItems"`
	TotalPages int `json:"totalPages"`
}

// =============================================================================
// PRODUCT TYPES (using existing Product struct from product.go)
// =============================================================================

// ProductListParams represents parameters for listing products
type ProductListParams struct {
	Page     int    `json:"page,omitempty"`
	PageSize int    `json:"pageSize,omitempty"`
	Search   string `json:"search,omitempty"`
}

// ProductListResponse represents response for product list
type ProductListResponse struct {
	Success bool           `json:"success"`
	Data    []Product      `json:"data"`
	Meta    PaginationMeta `json:"meta"`
}

// ProductResponse represents response for single product
type ProductResponse struct {
	Success bool    `json:"success"`
	Data    Product `json:"data"`
}

// =============================================================================
// INVOICE TYPES
// =============================================================================

// Invoice represents a Mayar invoice
type Invoice struct {
	ID          string    `json:"id"`
	Number      string    `json:"number"`
	CustomerID  string    `json:"customerId"`
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	Status      string    `json:"status"`
	DueDate     time.Time `json:"dueDate"`
	Items       []InvoiceItem `json:"items"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// InvoiceItem represents an item in an invoice
type InvoiceItem struct {
	ProductID   string  `json:"productId"`
	ProductName string  `json:"productName"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	TotalPrice  float64 `json:"totalPrice"`
}

// CreateInvoiceRequest represents request to create invoice
type CreateInvoiceRequest struct {
	CustomerID  string        `json:"customerId"`
	Items       []InvoiceItem `json:"items"`
	DueDate     time.Time     `json:"dueDate"`
	Notes       string        `json:"notes,omitempty"`
}

// UpdateInvoiceRequest represents request to update invoice
type UpdateInvoiceRequest struct {
	Items   []InvoiceItem `json:"items,omitempty"`
	DueDate time.Time     `json:"dueDate,omitempty"`
	Notes   string        `json:"notes,omitempty"`
}

// InvoiceResponse represents response for invoice operations
type InvoiceResponse struct {
	Success bool    `json:"success"`
	Data    Invoice `json:"data"`
}

// =============================================================================
// PAYMENT REQUEST TYPES
// =============================================================================

// PaymentRequest represents a payment request
type PaymentRequest struct {
	ID          string    `json:"id"`
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	PaymentURL  string    `json:"paymentUrl"`
	ExpiresAt   time.Time `json:"expiresAt"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// CreatePaymentRequestRequest represents request to create payment request
type CreatePaymentRequestRequest struct {
	Amount      float64   `json:"amount"`
	Currency    string    `json:"currency"`
	Description string    `json:"description"`
	ExpiresAt   time.Time `json:"expiresAt,omitempty"`
	CallbackURL string    `json:"callbackUrl,omitempty"`
}

// PaymentRequestResponse represents response for payment request operations
type PaymentRequestResponse struct {
	Success bool           `json:"success"`
	Data    PaymentRequest `json:"data"`
}

// =============================================================================
// CUSTOMER TYPES
// =============================================================================

// Customer represents a Mayar customer
type Customer struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Address   string    `json:"address"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// CreateCustomerRequest represents request to create customer
type CreateCustomerRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Phone   string `json:"phone,omitempty"`
	Address string `json:"address,omitempty"`
}

// UpdateCustomerRequest represents request to update customer
type UpdateCustomerRequest struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	Phone   string `json:"phone,omitempty"`
	Address string `json:"address,omitempty"`
}

// CustomerResponse represents response for customer operations
type CustomerResponse struct {
	Success bool     `json:"success"`
	Data    Customer `json:"data"`
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

// Transaction represents a Mayar transaction
type Transaction struct {
	ID            string    `json:"id"`
	Type          string    `json:"type"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Status        string    `json:"status"`
	Description   string    `json:"description"`
	PaymentMethod string    `json:"paymentMethod"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// TransactionListParams represents parameters for listing transactions
type TransactionListParams struct {
	Page      int    `json:"page,omitempty"`
	PageSize  int    `json:"pageSize,omitempty"`
	Status    string `json:"status,omitempty"`
	StartDate string `json:"startDate,omitempty"`
	EndDate   string `json:"endDate,omitempty"`
}

// TransactionListResponse represents response for transaction list
type TransactionListResponse struct {
	Success bool           `json:"success"`
	Data    []Transaction  `json:"data"`
	Meta    PaginationMeta `json:"meta"`
}

// TransactionResponse represents response for single transaction
type TransactionResponse struct {
	Success bool        `json:"success"`
	Data    Transaction `json:"data"`
}

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

// WebhookRegistration represents a registered webhook
type WebhookRegistration struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	Events    []string  `json:"events"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// RegisterWebhookRequest represents request to register webhook
type RegisterWebhookRequest struct {
	URL    string   `json:"url"`
	Events []string `json:"events"`
}

// WebhookRegistrationResponse represents response for webhook registration
type WebhookRegistrationResponse struct {
	Success bool                `json:"success"`
	Data    WebhookRegistration `json:"data"`
}

// WebhookHistory represents webhook delivery history
type WebhookHistory struct {
	ID           string    `json:"id"`
	WebhookID    string    `json:"webhookId"`
	Event        string    `json:"event"`
	Status       string    `json:"status"`
	ResponseCode int       `json:"responseCode"`
	Attempts     int       `json:"attempts"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// WebhookHistoryResponse represents response for webhook history
type WebhookHistoryResponse struct {
	Success bool             `json:"success"`
	Data    []WebhookHistory `json:"data"`
}

// =============================================================================
// LICENSE TYPES
// =============================================================================

// VerifyLicenseRequest represents request to verify license
type VerifyLicenseRequest struct {
	LicenseCode string `json:"licenseCode"`
	ProductID   string `json:"productId"`
	DeviceID    string `json:"deviceId,omitempty"`
}

// VerifyLicenseResponse represents response for license verification
type VerifyLicenseResponse struct {
	Success         bool      `json:"success"`
	IsLicenseActive bool      `json:"isLicenseActive"`
	LicenseCode     string    `json:"licenseCode"`
	ProductID       string    `json:"productId"`
	ExpiresAt       time.Time `json:"expiresAt"`
	Data            struct {
		IsLicenseActive bool      `json:"isLicenseActive"`
		LicenseCode     string    `json:"licenseCode"`
		ExpiresAt       time.Time `json:"expiresAt"`
	} `json:"data"`
}

// ActivateLicenseRequest represents request to activate license
type ActivateLicenseRequest struct {
	LicenseCode string `json:"licenseCode"`
	DeviceID    string `json:"deviceId"`
}

// DeactivateLicenseRequest represents request to deactivate license
type DeactivateLicenseRequest struct {
	LicenseCode string `json:"licenseCode"`
	DeviceID    string `json:"deviceId"`
}

// =============================================================================
// COUPON TYPES
// =============================================================================

// Coupon represents a discount coupon
type Coupon struct {
	ID           string    `json:"id"`
	Code         string    `json:"code"`
	Type         string    `json:"type"`
	Value        float64   `json:"value"`
	MinAmount    float64   `json:"minAmount"`
	MaxDiscount  float64   `json:"maxDiscount"`
	UsageLimit   int       `json:"usageLimit"`
	UsageCount   int       `json:"usageCount"`
	ExpiresAt    time.Time `json:"expiresAt"`
	Active       bool      `json:"active"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

// CreateCouponRequest represents request to create coupon
type CreateCouponRequest struct {
	Code        string    `json:"code"`
	Type        string    `json:"type"`
	Value       float64   `json:"value"`
	MinAmount   float64   `json:"minAmount,omitempty"`
	MaxDiscount float64   `json:"maxDiscount,omitempty"`
	UsageLimit  int       `json:"usageLimit,omitempty"`
	ExpiresAt   time.Time `json:"expiresAt,omitempty"`
}

// ApplyCouponRequest represents request to apply coupon
type ApplyCouponRequest struct {
	CouponCode string  `json:"couponCode"`
	Amount     float64 `json:"amount"`
}

// ApplyCouponResponse represents response for applying coupon
type ApplyCouponResponse struct {
	Success        bool    `json:"success"`
	IsValid        bool    `json:"isValid"`
	DiscountAmount float64 `json:"discountAmount"`
	FinalAmount    float64 `json:"finalAmount"`
	Data           struct {
		IsValid        bool    `json:"isValid"`
		DiscountAmount float64 `json:"discountAmount"`
		FinalAmount    float64 `json:"finalAmount"`
	} `json:"data"`
}

// CouponResponse represents response for coupon operations
type CouponResponse struct {
	Success bool   `json:"success"`
	Data    Coupon `json:"data"`
}