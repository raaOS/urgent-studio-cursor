package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"
)

// MayarService handles all Mayar.id API interactions
type MayarService struct {
	config *MayarConfig
	client *http.Client
}

// NewMayarService creates a new Mayar service instance
func NewMayarService() (*MayarService, error) {
	config, err := GetMayarConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load Mayar config: %w", err)
	}
	
	return &MayarService{
		config: config,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}, nil
}

// =============================================================================
// HTTP CLIENT METHODS
// =============================================================================

// makeRequest performs HTTP request to Mayar API
func (s *MayarService) makeRequest(method, endpoint string, body interface{}) (*http.Response, error) {
	url := s.config.GetMayarBaseURL() + endpoint
	
	// Debug logging
	log.Printf("DEBUG: Making request to URL: %s", url)
	log.Printf("DEBUG: Base URL: %s", s.config.GetMayarBaseURL())
	log.Printf("DEBUG: Environment: %s", s.config.Environment)
	log.Printf("DEBUG: API Key (first 10 chars): %s", s.config.APIKey[:10]+"...")
	
	var reqBody io.Reader
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonData)
	}
	
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	
	// Add headers
	headers := s.config.GetAPIHeaders()
	for key, value := range headers {
		req.Header.Set(key, value)
		log.Printf("DEBUG: Header %s: %s", key, value)
	}
	
	return s.client.Do(req)
}

// parseResponse parses HTTP response into target struct
func (s *MayarService) parseResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()
	
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}
	
	// Debug logging
	log.Printf("Mayar API Response - Status: %d, Body: %s", resp.StatusCode, string(body))
	
	if resp.StatusCode >= 400 {
		var errorResp MayarErrorResponse
		if err := json.Unmarshal(body, &errorResp); err != nil {
			return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
		}
		if errorResp.Message == "" {
			return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
		}
		return fmt.Errorf("API error: %s", errorResp.Message)
	}
	
	if target != nil {
		if err := json.Unmarshal(body, target); err != nil {
			return fmt.Errorf("failed to unmarshal response: %w - body: %s", err, string(body))
		}
	}
	
	return nil
}

// =============================================================================
// PRODUCT METHODS
// =============================================================================

// GetProducts retrieves all products with pagination
func (s *MayarService) GetProducts(params ProductListParams) (*ProductListResponse, error) {
	endpoint := "/product"
	
	// Build query parameters
	query := make([]string, 0)
	if params.Page > 0 {
		query = append(query, "page="+strconv.Itoa(params.Page))
	}
	if params.PageSize > 0 {
		query = append(query, "pageSize="+strconv.Itoa(params.PageSize))
	}
	if params.Search != "" {
		query = append(query, "search="+params.Search)
	}
	
	if len(query) > 0 {
		endpoint += "?" + joinStrings(query, "&")
	}
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result ProductListResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetProductsByType retrieves products by type
func (s *MayarService) GetProductsByType(productType string, params ProductListParams) (*ProductListResponse, error) {
	endpoint := fmt.Sprintf("/product/type/%s", productType)
	
	// Build query parameters
	query := make([]string, 0)
	if params.Page > 0 {
		query = append(query, "page="+strconv.Itoa(params.Page))
	}
	if params.PageSize > 0 {
		query = append(query, "pageSize="+strconv.Itoa(params.PageSize))
	}
	
	if len(query) > 0 {
		endpoint += "?" + joinStrings(query, "&")
	}
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result ProductListResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetProduct retrieves a single product by ID
func (s *MayarService) GetProduct(productID string) (*ProductResponse, error) {
	endpoint := fmt.Sprintf("/product/%s", productID)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result ProductResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// CloseProduct closes a product
func (s *MayarService) CloseProduct(productID string) error {
	endpoint := fmt.Sprintf("/product/close/%s", productID)
	
	resp, err := s.makeRequest("POST", endpoint, nil)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// ReopenProduct reopens a closed product
func (s *MayarService) ReopenProduct(productID string) error {
	endpoint := fmt.Sprintf("/product/open/%s", productID)
	
	resp, err := s.makeRequest("POST", endpoint, nil)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// =============================================================================
// INVOICE METHODS
// =============================================================================

// CreateInvoice creates a new invoice
func (s *MayarService) CreateInvoice(req CreateInvoiceRequest) (*InvoiceResponse, error) {
	resp, err := s.makeRequest("POST", "/invoice", req)
	if err != nil {
		return nil, err
	}
	
	var result InvoiceResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetInvoice retrieves an invoice by ID
func (s *MayarService) GetInvoice(invoiceID string) (*InvoiceResponse, error) {
	endpoint := fmt.Sprintf("/invoice/%s", invoiceID)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result InvoiceResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// UpdateInvoice updates an existing invoice
func (s *MayarService) UpdateInvoice(invoiceID string, req UpdateInvoiceRequest) (*InvoiceResponse, error) {
	endpoint := fmt.Sprintf("/invoice/%s", invoiceID)
	
	resp, err := s.makeRequest("PUT", endpoint, req)
	if err != nil {
		return nil, err
	}
	
	var result InvoiceResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// DeleteInvoice deletes an invoice
func (s *MayarService) DeleteInvoice(invoiceID string) error {
	endpoint := fmt.Sprintf("/invoice/%s", invoiceID)
	
	resp, err := s.makeRequest("DELETE", endpoint, nil)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// =============================================================================
// PAYMENT REQUEST METHODS
// =============================================================================

// CreatePaymentRequest creates a new payment request
func (s *MayarService) CreatePaymentRequest(req CreatePaymentRequestRequest) (*PaymentRequestResponse, error) {
	resp, err := s.makeRequest("POST", "/request-payment", req)
	if err != nil {
		return nil, err
	}
	
	var result PaymentRequestResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetPaymentRequest retrieves a payment request by ID
func (s *MayarService) GetPaymentRequest(requestID string) (*PaymentRequestResponse, error) {
	endpoint := fmt.Sprintf("/request-payment/%s", requestID)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result PaymentRequestResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// =============================================================================
// CUSTOMER METHODS
// =============================================================================

// CreateCustomer creates a new customer
func (s *MayarService) CreateCustomer(req CreateCustomerRequest) (*CustomerResponse, error) {
	resp, err := s.makeRequest("POST", "/customer", req)
	if err != nil {
		return nil, err
	}
	
	var result CustomerResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetCustomer retrieves a customer by ID
func (s *MayarService) GetCustomer(customerID string) (*CustomerResponse, error) {
	endpoint := fmt.Sprintf("/customer/%s", customerID)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result CustomerResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// UpdateCustomer updates an existing customer
func (s *MayarService) UpdateCustomer(customerID string, req UpdateCustomerRequest) (*CustomerResponse, error) {
	endpoint := fmt.Sprintf("/customer/%s", customerID)
	
	resp, err := s.makeRequest("PUT", endpoint, req)
	if err != nil {
		return nil, err
	}
	
	var result CustomerResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// =============================================================================
// TRANSACTION METHODS
// =============================================================================

// GetTransactions retrieves transactions with filters
func (s *MayarService) GetTransactions(params TransactionListParams) (*TransactionListResponse, error) {
	endpoint := "/transactions"
	
	// Build query parameters
	query := make([]string, 0)
	if params.Page > 0 {
		query = append(query, "page="+strconv.Itoa(params.Page))
	}
	if params.PageSize > 0 {
		query = append(query, "pageSize="+strconv.Itoa(params.PageSize))
	}
	if params.Status != "" {
		query = append(query, "status="+params.Status)
	}
	if params.StartDate != "" {
		query = append(query, "startDate="+params.StartDate)
	}
	if params.EndDate != "" {
		query = append(query, "endDate="+params.EndDate)
	}
	
	if len(query) > 0 {
		endpoint += "?" + joinStrings(query, "&")
	}
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result TransactionListResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetTransaction retrieves a transaction by ID
func (s *MayarService) GetTransaction(transactionID string) (*TransactionResponse, error) {
	endpoint := fmt.Sprintf("/transaction/%s", transactionID)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result TransactionResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// =============================================================================
// WEBHOOK METHODS
// =============================================================================

// RegisterWebhook registers a new webhook URL
func (s *MayarService) RegisterWebhook(req RegisterWebhookRequest) (*WebhookRegistrationResponse, error) {
	resp, err := s.makeRequest("POST", "/webhook/register", req)
	if err != nil {
		return nil, err
	}
	
	var result WebhookRegistrationResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetWebhookHistory retrieves webhook delivery history
func (s *MayarService) GetWebhookHistory() (*WebhookHistoryResponse, error) {
	resp, err := s.makeRequest("GET", "/webhook/history", nil)
	if err != nil {
		return nil, err
	}
	
	var result WebhookHistoryResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// TestWebhook tests a webhook URL
func (s *MayarService) TestWebhook(webhookID string) error {
	endpoint := fmt.Sprintf("/webhook/test/%s", webhookID)
	
	resp, err := s.makeRequest("POST", endpoint, nil)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// RetryWebhook retries a failed webhook delivery
func (s *MayarService) RetryWebhook(historyID string) error {
	endpoint := fmt.Sprintf("/webhook/retry/%s", historyID)
	
	resp, err := s.makeRequest("POST", endpoint, nil)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// VerifyWebhookSignature verifies webhook signature
func (s *MayarService) VerifyWebhookSignature(payload []byte, signature string) bool {
	mac := hmac.New(sha256.New, []byte(s.config.WebhookSecret))
	mac.Write(payload)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}

// =============================================================================
// LICENSE METHODS
// =============================================================================

// VerifyLicense verifies a software license
func (s *MayarService) VerifyLicense(req VerifyLicenseRequest) (*VerifyLicenseResponse, error) {
	resp, err := s.makeRequest("POST", "/license/verify", req)
	if err != nil {
		return nil, err
	}
	
	var result VerifyLicenseResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// ActivateLicense activates a software license
func (s *MayarService) ActivateLicense(req ActivateLicenseRequest) error {
	resp, err := s.makeRequest("POST", "/license/activate", req)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// DeactivateLicense deactivates a software license
func (s *MayarService) DeactivateLicense(req DeactivateLicenseRequest) error {
	resp, err := s.makeRequest("POST", "/license/deactivate", req)
	if err != nil {
		return err
	}
	
	return s.parseResponse(resp, nil)
}

// =============================================================================
// COUPON METHODS
// =============================================================================

// CreateCoupon creates a new coupon
func (s *MayarService) CreateCoupon(req CreateCouponRequest) (*CouponResponse, error) {
	resp, err := s.makeRequest("POST", "/coupon", req)
	if err != nil {
		return nil, err
	}
	
	var result CouponResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// ApplyCoupon applies a coupon to calculate discount
func (s *MayarService) ApplyCoupon(req ApplyCouponRequest) (*ApplyCouponResponse, error) {
	resp, err := s.makeRequest("POST", "/coupon/apply", req)
	if err != nil {
		return nil, err
	}
	
	var result ApplyCouponResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// GetCoupon retrieves a coupon by code
func (s *MayarService) GetCoupon(couponCode string) (*CouponResponse, error) {
	endpoint := fmt.Sprintf("/coupon/%s", couponCode)
	
	resp, err := s.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var result CouponResponse
	if err := s.parseResponse(resp, &result); err != nil {
		return nil, err
	}
	
	return &result, nil
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// joinStrings joins string slice with separator
func joinStrings(strs []string, sep string) string {
	if len(strs) == 0 {
		return ""
	}
	if len(strs) == 1 {
		return strs[0]
	}
	
	result := strs[0]
	for i := 1; i < len(strs); i++ {
		result += sep + strs[i]
	}
	return result
}