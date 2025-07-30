package main

import (
	"github.com/gin-gonic/gin"
)

// SetupMayarRoutes sets up all Mayar.id API routes
func SetupMayarRoutes(router *gin.Engine, handler *MayarHandler) {
	// Create API group
	api := router.Group("/api/mayar")
	
	// =============================================================================
	// PRODUCT ROUTES
	// =============================================================================
	products := api.Group("/products")
	{
		products.GET("", handler.GetProducts)                    // GET /api/mayar/products
		products.GET("/type/:type", handler.GetProductsByType)   // GET /api/mayar/products/type/:type
		products.GET("/:id", handler.GetProduct)                // GET /api/mayar/products/:id
		products.POST("/:id/close", handler.CloseProduct)       // POST /api/mayar/products/:id/close
		products.POST("/:id/reopen", handler.ReopenProduct)     // POST /api/mayar/products/:id/reopen
	}
	
	// =============================================================================
	// INVOICE ROUTES
	// =============================================================================
	invoices := api.Group("/invoices")
	{
		invoices.POST("", handler.CreateInvoice)      // POST /api/mayar/invoices
		invoices.GET("/:id", handler.GetInvoice)      // GET /api/mayar/invoices/:id
		invoices.PUT("/:id", handler.UpdateInvoice)   // PUT /api/mayar/invoices/:id
		invoices.DELETE("/:id", handler.DeleteInvoice) // DELETE /api/mayar/invoices/:id
	}
	
	// =============================================================================
	// PAYMENT REQUEST ROUTES
	// =============================================================================
	paymentRequests := api.Group("/payment-requests")
	{
		paymentRequests.POST("", handler.CreatePaymentRequest)  // POST /api/mayar/payment-requests
		paymentRequests.GET("/:id", handler.GetPaymentRequest)  // GET /api/mayar/payment-requests/:id
	}
	
	// =============================================================================
	// CUSTOMER ROUTES
	// =============================================================================
	customers := api.Group("/customers")
	{
		customers.POST("", handler.CreateCustomer)      // POST /api/mayar/customers
		customers.GET("/:id", handler.GetCustomer)      // GET /api/mayar/customers/:id
		customers.PUT("/:id", handler.UpdateCustomer)   // PUT /api/mayar/customers/:id
	}
	
	// =============================================================================
	// TRANSACTION ROUTES
	// =============================================================================
	transactions := api.Group("/transactions")
	{
		transactions.GET("", handler.GetTransactions)     // GET /api/mayar/transactions
		transactions.GET("/:id", handler.GetTransaction)  // GET /api/mayar/transactions/:id
	}
	
	// =============================================================================
	// WEBHOOK ROUTES
	// =============================================================================
	webhooks := api.Group("/webhooks")
	{
		webhooks.POST("/register", handler.RegisterWebhook)           // POST /api/mayar/webhooks/register
		webhooks.GET("/history", handler.GetWebhookHistory)           // GET /api/mayar/webhooks/history
		webhooks.POST("/:id/test", handler.TestWebhook)               // POST /api/mayar/webhooks/:id/test
		webhooks.POST("/retry/:historyId", handler.RetryWebhook)      // POST /api/mayar/webhooks/retry/:historyId
		webhooks.POST("/incoming", handler.HandleWebhook)             // POST /api/mayar/webhooks/incoming
	}
	
	// =============================================================================
	// LICENSE ROUTES
	// =============================================================================
	license := api.Group("/license")
	{
		license.POST("/verify", handler.VerifyLicense)         // POST /api/mayar/license/verify
		license.POST("/activate", handler.ActivateLicense)     // POST /api/mayar/license/activate
		license.POST("/deactivate", handler.DeactivateLicense) // POST /api/mayar/license/deactivate
	}
	
	// =============================================================================
	// COUPON ROUTES
	// =============================================================================
	coupons := api.Group("/coupons")
	{
		coupons.POST("", handler.CreateCoupon)           // POST /api/mayar/coupons
		coupons.POST("/apply", handler.ApplyCoupon)      // POST /api/mayar/coupons/apply
		coupons.GET("/:code", handler.GetCoupon)         // GET /api/mayar/coupons/:code
	}
}

// SetupMayarMiddleware sets up middleware for Mayar routes
func SetupMayarMiddleware(router *gin.Engine) {
	// Add CORS middleware for Mayar routes
	router.Use(func(c *gin.Context) {
		// Allow specific origins for Mayar integration
		origin := c.Request.Header.Get("Origin")
		if origin == "https://api.mayar.id" || origin == "https://sandbox.mayar.id" {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Mayar-Signature")
		}
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})
	
	// Add rate limiting middleware for Mayar routes
	router.Use(func(c *gin.Context) {
		// Skip rate limiting for webhook endpoints
		if c.Request.URL.Path == "/api/mayar/webhooks/incoming" {
			c.Next()
			return
		}
		
		// TODO: Implement rate limiting logic
		// For now, just continue
		c.Next()
	})
}

// InitializeMayarIntegration initializes the complete Mayar.id integration
func InitializeMayarIntegration(router *gin.Engine, orderRepo *OrderRepository) error {
	// Create Mayar service
	service, err := NewMayarService()
	if err != nil {
		return err
	}
	
	// Create Mayar handler
	handler := NewMayarHandler(service, orderRepo)
	
	// Setup middleware
	SetupMayarMiddleware(router)
	
	// Setup routes
	SetupMayarRoutes(router, handler)
	
	return nil
}