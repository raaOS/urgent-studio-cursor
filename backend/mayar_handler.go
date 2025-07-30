package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// MayarHandler handles HTTP requests for Mayar.id integration
type MayarHandler struct {
	service   *MayarService
	orderRepo *OrderRepository
}

// NewMayarHandler creates a new Mayar handler
func NewMayarHandler(service *MayarService, orderRepo *OrderRepository) *MayarHandler {
	return &MayarHandler{
		service:   service,
		orderRepo: orderRepo,
	}
}

// =============================================================================
// PRODUCT HANDLERS
// =============================================================================

// GetProducts handles GET /api/mayar/products
func (h *MayarHandler) GetProducts(c *gin.Context) {
	// Parse query parameters
	params := ProductListParams{}
	
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			params.Page = p
		}
	}
	
	if pageSize := c.Query("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			params.PageSize = ps
		}
	}
	
	params.Search = c.Query("search")
	
	// Call service
	result, err := h.service.GetProducts(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch products",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetProductsByType handles GET /api/mayar/products/type/:type
func (h *MayarHandler) GetProductsByType(c *gin.Context) {
	productType := c.Param("type")
	
	// Parse query parameters
	params := ProductListParams{}
	
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			params.Page = p
		}
	}
	
	if pageSize := c.Query("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			params.PageSize = ps
		}
	}
	
	// Call service
	result, err := h.service.GetProductsByType(productType, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch products by type",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetProduct handles GET /api/mayar/products/:id
func (h *MayarHandler) GetProduct(c *gin.Context) {
	productID := c.Param("id")
	
	result, err := h.service.GetProduct(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch product",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// CloseProduct handles POST /api/mayar/products/:id/close
func (h *MayarHandler) CloseProduct(c *gin.Context) {
	productID := c.Param("id")
	
	err := h.service.CloseProduct(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to close product",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product closed successfully",
	})
}

// ReopenProduct handles POST /api/mayar/products/:id/reopen
func (h *MayarHandler) ReopenProduct(c *gin.Context) {
	productID := c.Param("id")
	
	err := h.service.ReopenProduct(productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to reopen product",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product reopened successfully",
	})
}

// =============================================================================
// INVOICE HANDLERS
// =============================================================================

// CreateInvoice handles POST /api/mayar/invoices
func (h *MayarHandler) CreateInvoice(c *gin.Context) {
	var req CreateInvoiceRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.CreateInvoice(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create invoice",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, result)
}

// GetInvoice handles GET /api/mayar/invoices/:id
func (h *MayarHandler) GetInvoice(c *gin.Context) {
	invoiceID := c.Param("id")
	
	result, err := h.service.GetInvoice(invoiceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch invoice",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// UpdateInvoice handles PUT /api/mayar/invoices/:id
func (h *MayarHandler) UpdateInvoice(c *gin.Context) {
	invoiceID := c.Param("id")
	
	var req UpdateInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.UpdateInvoice(invoiceID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update invoice",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// DeleteInvoice handles DELETE /api/mayar/invoices/:id
func (h *MayarHandler) DeleteInvoice(c *gin.Context) {
	invoiceID := c.Param("id")
	
	err := h.service.DeleteInvoice(invoiceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete invoice",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Invoice deleted successfully",
	})
}

// =============================================================================
// PAYMENT REQUEST HANDLERS
// =============================================================================

// CreatePaymentRequest handles POST /api/mayar/payment-requests
func (h *MayarHandler) CreatePaymentRequest(c *gin.Context) {
	var req CreatePaymentRequestRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.CreatePaymentRequest(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create payment request",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, result)
}

// GetPaymentRequest handles GET /api/mayar/payment-requests/:id
func (h *MayarHandler) GetPaymentRequest(c *gin.Context) {
	requestID := c.Param("id")
	
	result, err := h.service.GetPaymentRequest(requestID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch payment request",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// =============================================================================
// CUSTOMER HANDLERS
// =============================================================================

// CreateCustomer handles POST /api/mayar/customers
func (h *MayarHandler) CreateCustomer(c *gin.Context) {
	var req CreateCustomerRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.CreateCustomer(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create customer",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, result)
}

// GetCustomer handles GET /api/mayar/customers/:id
func (h *MayarHandler) GetCustomer(c *gin.Context) {
	customerID := c.Param("id")
	
	result, err := h.service.GetCustomer(customerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch customer",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// UpdateCustomer handles PUT /api/mayar/customers/:id
func (h *MayarHandler) UpdateCustomer(c *gin.Context) {
	customerID := c.Param("id")
	
	var req UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.UpdateCustomer(customerID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update customer",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// =============================================================================
// TRANSACTION HANDLERS
// =============================================================================

// GetTransactions handles GET /api/mayar/transactions
func (h *MayarHandler) GetTransactions(c *gin.Context) {
	// Parse query parameters
	params := TransactionListParams{}
	
	if page := c.Query("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			params.Page = p
		}
	}
	
	if pageSize := c.Query("pageSize"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			params.PageSize = ps
		}
	}
	
	params.Status = c.Query("status")
	params.StartDate = c.Query("startDate")
	params.EndDate = c.Query("endDate")
	
	// Call service
	result, err := h.service.GetTransactions(params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch transactions",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetTransaction handles GET /api/mayar/transactions/:id
func (h *MayarHandler) GetTransaction(c *gin.Context) {
	transactionID := c.Param("id")
	
	result, err := h.service.GetTransaction(transactionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch transaction",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// =============================================================================
// WEBHOOK HANDLERS
// =============================================================================

// RegisterWebhook handles POST /api/mayar/webhooks/register
func (h *MayarHandler) RegisterWebhook(c *gin.Context) {
	var req RegisterWebhookRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.RegisterWebhook(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to register webhook",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, result)
}

// GetWebhookHistory handles GET /api/mayar/webhooks/history
func (h *MayarHandler) GetWebhookHistory(c *gin.Context) {
	result, err := h.service.GetWebhookHistory()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch webhook history",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// TestWebhook handles POST /api/mayar/webhooks/:id/test
func (h *MayarHandler) TestWebhook(c *gin.Context) {
	webhookID := c.Param("id")
	
	err := h.service.TestWebhook(webhookID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to test webhook",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Webhook test sent successfully",
	})
}

// RetryWebhook handles POST /api/mayar/webhooks/retry/:historyId
func (h *MayarHandler) RetryWebhook(c *gin.Context) {
	historyID := c.Param("historyId")
	
	err := h.service.RetryWebhook(historyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to retry webhook",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Webhook retry initiated successfully",
	})
}

// HandleWebhook handles incoming webhook from Mayar.id
func (h *MayarHandler) HandleWebhook(c *gin.Context) {
	// Get signature from header
	signature := c.GetHeader("X-Mayar-Signature")
	if signature == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Missing webhook signature",
		})
		return
	}
	
	// Read raw body
	body, err := c.GetRawData()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Failed to read request body",
		})
		return
	}
	
	// Verify signature
	if !h.service.VerifyWebhookSignature(body, signature) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"message": "Invalid webhook signature",
		})
		return
	}
	
	// Parse webhook payload
	var payload map[string]interface{}
	if err := json.Unmarshal(body, &payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid JSON payload",
		})
		return
	}
	
	// Process webhook based on event type
	eventType, ok := payload["event"].(string)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Missing event type",
		})
		return
	}
	
	// Handle different webhook events
	switch eventType {
	case "payment.completed":
		// Handle payment completion
		paymentData, ok := payload["data"].(map[string]interface{})
		if !ok {
			LogError("Invalid payment.completed webhook payload: missing data", logrus.Fields{
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract payment information
		paymentID, _ := paymentData["id"].(string)
		paymentStatus, _ := paymentData["status"].(string)
		paymentMethod, _ := paymentData["paymentMethod"].(string)
		
		// Extract reference ID (order ID) from metadata or description
		var orderID string
		if metadata, ok := paymentData["metadata"].(map[string]interface{}); ok {
			orderID, _ = metadata["order_id"].(string)
		}
		
		// If order ID not found in metadata, try to extract from description
		if orderID == "" {
			description, _ := paymentData["description"].(string)
			// Try to extract order ID from description (assuming format like "Payment for Order #123456")
			parts := strings.Split(description, "#")
			if len(parts) > 1 {
				orderID = strings.TrimSpace(parts[1])
			}
		}
		
		if orderID == "" {
			LogError("Cannot determine order ID from payment.completed webhook", logrus.Fields{
				"payment_id": paymentID,
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract paid_at timestamp
		var paidAt *time.Time
		if paidAtStr, ok := paymentData["paidAt"].(string); ok && paidAtStr != "" {
			parsedTime, err := time.Parse(time.RFC3339, paidAtStr)
			if err == nil {
				paidAt = &parsedTime
			}
		}
		
		// If paidAt is not available, use current time
		if paidAt == nil {
			now := time.Now()
			paidAt = &now
		}
		
		// Set payment method pointer
		paymentMethodPtr := &paymentMethod
		if paymentMethod == "" {
			paymentMethodPtr = nil
		}
		
		// Update order payment status
		err := h.orderRepo.UpdateOrderPaymentStatus(orderID, paymentStatus, paymentMethodPtr, paidAt)
		if err != nil {
			LogError("Failed to update order payment status", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
				"error": err.Error(),
			}, err)
		} else {
			LogInfo("Order payment status updated successfully", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
				"status": paymentStatus,
			})
		}
	case "payment.failed":
		// Handle payment failure
		paymentData, ok := payload["data"].(map[string]interface{})
		if !ok {
			LogError("Invalid payment.failed webhook payload: missing data", logrus.Fields{
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract payment information
		paymentID, _ := paymentData["id"].(string)
		paymentStatus := "failed" // Explicitly set to failed
		paymentMethod, _ := paymentData["paymentMethod"].(string)
		
		// Extract reference ID (order ID) from metadata or description
		var orderID string
		if metadata, ok := paymentData["metadata"].(map[string]interface{}); ok {
			orderID, _ = metadata["order_id"].(string)
		}
		
		// If order ID not found in metadata, try to extract from description
		if orderID == "" {
			description, _ := paymentData["description"].(string)
			// Try to extract order ID from description (assuming format like "Payment for Order #123456")
			parts := strings.Split(description, "#")
			if len(parts) > 1 {
				orderID = strings.TrimSpace(parts[1])
			}
		}
		
		if orderID == "" {
			LogError("Cannot determine order ID from payment.failed webhook", logrus.Fields{
				"payment_id": paymentID,
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract failed_at timestamp or use current time
		var failedAt *time.Time
		if failedAtStr, ok := paymentData["failedAt"].(string); ok && failedAtStr != "" {
			parsedTime, err := time.Parse(time.RFC3339, failedAtStr)
			if err == nil {
				failedAt = &parsedTime
			}
		}
		
		// If failedAt is not available, use current time
		if failedAt == nil {
			now := time.Now()
			failedAt = &now
		}
		
		// Set payment method pointer
		paymentMethodPtr := &paymentMethod
		if paymentMethod == "" {
			paymentMethodPtr = nil
		}
		
		// Update order payment status
		err := h.orderRepo.UpdateOrderPaymentStatus(orderID, paymentStatus, paymentMethodPtr, failedAt)
		if err != nil {
			LogError("Failed to update order payment status to failed", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
				"error": err.Error(),
			}, err)
		} else {
			LogInfo("Order payment status updated to failed", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
			})
		}
		
		// Set payment method pointer
		paymentMethodPtr := &paymentMethod
		if paymentMethod == "" {
			paymentMethodPtr = nil
		}
		
		// Update order payment status
if updateErr := h.orderRepo.UpdateOrderPaymentStatus(orderID, paymentStatus, paymentMethodPtr, failedAt); updateErr != nil {
		if err != nil {
			LogError("Failed to update order payment status to failed", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
				"error": err.Error(),
			}, err)
		} else {
			LogInfo("Order payment status updated successfully", logrus.Fields{
				"order_id": orderID,
				"payment_id": paymentID,
				"status": paymentStatus,
			})
		}
	case "invoice.paid":
		// Handle invoice payment
		invoiceData, ok := payload["data"].(map[string]interface{})
		if !ok {
			LogError("Invalid invoice.paid webhook payload: missing data", logrus.Fields{
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract invoice information
		invoiceID, _ := invoiceData["id"].(string)
		paymentStatus := "paid" // Explicitly set to paid for invoice.paid event
		paymentMethod, _ := invoiceData["paymentMethod"].(string)
		
		// Extract reference ID (order ID) from metadata or description
		var orderID string
		if metadata, ok := invoiceData["metadata"].(map[string]interface{}); ok {
			orderID, _ = metadata["order_id"].(string)
		}
		
		// If order ID not found in metadata, try to extract from description
		if orderID == "" {
			description, _ := invoiceData["description"].(string)
			// Try to extract order ID from description (assuming format like "Invoice for Order #123456")
			parts := strings.Split(description, "#")
			if len(parts) > 1 {
				orderID = strings.TrimSpace(parts[1])
			}
		}
		
		if orderID == "" {
			LogError("Cannot determine order ID from invoice.paid webhook", logrus.Fields{
				"invoice_id": invoiceID,
				"payload": payload,
			}, nil)
			break
		}
		
		// Get paid timestamp
		var paidAt *time.Time
		if paidAtStr, ok := invoiceData["paidAt"].(string); ok && paidAtStr != "" {
			parsedTime, err := time.Parse(time.RFC3339, paidAtStr)
			if err == nil {
				paidAt = &parsedTime
			}
		}
		
		// If paidAt is not available, use current time
		if paidAt == nil {
			now := time.Now()
			paidAt = &now
		}
		
		// Update order payment status
		paymentMethodPtr := &paymentMethod
		if paymentMethod == "" {
			paymentMethodPtr = nil
		}
		
		err := h.orderRepo.UpdateOrderPaymentStatus(orderID, paymentStatus, paymentMethodPtr, paidAt)
		if err != nil {
			LogError("Failed to update order payment status from invoice", logrus.Fields{
				"order_id": orderID,
				"invoice_id": invoiceID,
				"error": err.Error(),
			}, err)
		} else {
			LogInfo("Order payment status updated successfully", logrus.Fields{
				"order_id": orderID,
				"invoice_id": invoiceID,
				"status": paymentStatus,
			})
		}
	case "subscription.created":
		// Handle subscription creation
		subscriptionData, ok := payload["data"].(map[string]interface{})
		if !ok {
			LogError("Invalid subscription.created webhook payload: missing data", logrus.Fields{
				"payload": payload,
			}, nil)
			break
		}
		
		// Extract subscription information
		subscriptionID, _ := subscriptionData["id"].(string)
		
		// Log subscription creation
		LogInfo("Subscription created", logrus.Fields{
			"subscription_id": subscriptionID,
		})
		
		// Note: Additional subscription handling can be implemented here if needed
	default:
		// Log unknown event type
		LogInfo("Received unhandled webhook event type", logrus.Fields{
			"event_type": eventType,
		})
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Webhook processed successfully",
	})
}

// =============================================================================
// LICENSE HANDLERS
// =============================================================================

// VerifyLicense handles POST /api/mayar/license/verify
func (h *MayarHandler) VerifyLicense(c *gin.Context) {
	var req VerifyLicenseRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.VerifyLicense(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to verify license",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// ActivateLicense handles POST /api/mayar/license/activate
func (h *MayarHandler) ActivateLicense(c *gin.Context) {
	var req ActivateLicenseRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	err := h.service.ActivateLicense(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to activate license",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "License activated successfully",
	})
}

// DeactivateLicense handles POST /api/mayar/license/deactivate
func (h *MayarHandler) DeactivateLicense(c *gin.Context) {
	var req DeactivateLicenseRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	err := h.service.DeactivateLicense(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to deactivate license",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "License deactivated successfully",
	})
}

// =============================================================================
// COUPON HANDLERS
// =============================================================================

// CreateCoupon handles POST /api/mayar/coupons
func (h *MayarHandler) CreateCoupon(c *gin.Context) {
	var req CreateCouponRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.CreateCoupon(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create coupon",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusCreated, result)
}

// ApplyCoupon handles POST /api/mayar/coupons/apply
func (h *MayarHandler) ApplyCoupon(c *gin.Context) {
	var req ApplyCouponRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	result, err := h.service.ApplyCoupon(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to apply coupon",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}

// GetCoupon handles GET /api/mayar/coupons/:code
func (h *MayarHandler) GetCoupon(c *gin.Context) {
	couponCode := c.Param("code")
	
	result, err := h.service.GetCoupon(couponCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch coupon",
			"error":   err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, result)
}