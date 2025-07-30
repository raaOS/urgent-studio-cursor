package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// DashboardMetrics represents the dashboard metrics data
type DashboardMetrics struct {
	TotalOrders      int                    `json:"totalOrders"`
	TotalRevenue     float64                `json:"totalRevenue"`
	TotalServices    int                    `json:"totalServices"`
	ActiveCustomers  int                    `json:"activeCustomers"`
	PendingOrders    int                    `json:"pendingOrders"`
	CompletedToday   int                    `json:"completedToday"`
	RevenueToday     float64                `json:"revenueToday"`
	OrdersByStatus   map[string]int         `json:"ordersByStatus"`
	RevenueByCategory map[string]float64    `json:"revenueByCategory"`
	DailyStats       []DailyStats           `json:"dailyStats"`
	TopProducts      []ProductStats         `json:"topProducts"`
	RecentActivity   []ActivityItem         `json:"recentActivity"`
}

// DailyStats represents daily statistics
type DailyStats struct {
	Date    string  `json:"date"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
}

// ProductStats represents product statistics
type ProductStats struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
}

// ActivityItem represents recent activity
type ActivityItem struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// DashboardHandler handles dashboard-related requests
type DashboardHandler struct {
	serviceRepo *ServiceItemRepository
	db          *sql.DB
}

// NewDashboardHandler creates a new dashboard handler
func NewDashboardHandler(serviceRepo *ServiceItemRepository) *DashboardHandler {
	return &DashboardHandler{
		serviceRepo: serviceRepo,
		db:          serviceRepo.db,
	}
}

// GetMetrics handles GET /api/dashboard/metrics
func (h *DashboardHandler) GetMetrics(c *gin.Context) {
	// Get total services count from products table
	var totalServices int
	err := h.db.QueryRow("SELECT COUNT(*) FROM products").Scan(&totalServices)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get services count"})
		return
	}

	// Get services by category for revenue calculation from products table
	rows, err := h.db.Query(`
		SELECT category, COUNT(*) as count, AVG(price) as avg_price 
		FROM products 
		GROUP BY category
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get category data"})
		return
	}
	defer rows.Close()

	revenueByCategory := make(map[string]float64)
	totalRevenue := 0.0
	
	for rows.Next() {
		var category string
		var count int
		var avgPrice float64
		
		if err := rows.Scan(&category, &count, &avgPrice); err != nil {
			continue
		}
		
		categoryRevenue := float64(count) * avgPrice
		revenueByCategory[category] = categoryRevenue
		totalRevenue += categoryRevenue
	}

	// Mock data for orders and customers (since we don't have these tables yet)
	totalOrders := 150
	totalCustomers := 75
	ordersToday := 12
	revenueToday := 2500.0
	pendingOrders := 8

	metrics := DashboardMetrics{
		TotalOrders:       totalOrders,
		TotalRevenue:      totalRevenue,
		TotalServices:     totalServices,
		ActiveCustomers:   totalCustomers,
		PendingOrders:     pendingOrders,
		CompletedToday:    ordersToday,
		RevenueToday:      revenueToday,
		OrdersByStatus: map[string]int{
			"pending":    pendingOrders,
			"processing": 25,
			"completed":  98,
			"cancelled":  21,
		},
		RevenueByCategory: revenueByCategory,
		DailyStats: []DailyStats{
			{
				Date:    time.Now().Format("2006-01-02"),
				Orders:  ordersToday,
				Revenue: revenueToday,
			},
		},
		TopProducts: []ProductStats{
			{ID: "1", Name: "Logo Design Premium", Orders: 25, Revenue: 12500.0},
			{ID: "2", Name: "Business Card Design", Orders: 18, Revenue: 5400.0},
		},
		RecentActivity: []ActivityItem{
			{
				ID:        "1",
				Type:      "order_created",
				Message:   "Pesanan baru untuk Logo Design Premium",
				Timestamp: time.Now().Add(-time.Hour * 2).Format(time.RFC3339),
			},
		},
	}

	c.JSON(http.StatusOK, metrics)
}

// GetOrderAnalytics handles GET /api/dashboard/orders/analytics
func (h *DashboardHandler) GetOrderAnalytics(c *gin.Context) {
	// Mock order analytics data
	analytics := gin.H{
		"totalOrders":       156,
		"averageOrderValue": 503205,
		"conversionRate":    12.5,
		"orderTrends": []gin.H{
			{"month": "Jan", "orders": 45, "revenue": 22500000},
			{"month": "Feb", "orders": 52, "revenue": 26000000},
			{"month": "Mar", "orders": 59, "revenue": 30000000},
		},
		"statusDistribution": gin.H{
			"pending":    12,
			"processing": 25,
			"completed":  98,
			"cancelled":  21,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    analytics,
	})
}

// GetProductAnalytics handles GET /api/dashboard/products/analytics
func (h *DashboardHandler) GetProductAnalytics(c *gin.Context) {
	// Check if specific product ID is requested
	productID := c.Query("productId")
	
	if productID != "" {
		// Return analytics for specific product
		analytics := gin.H{
			"views":          1250,
			"orders":         25,
			"revenue":        12500000,
			"conversionRate": 2.0,
			"popularityScore": 85,
			"categoryRanking": 2,
			"lastUpdated":    time.Now().Format(time.RFC3339),
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    analytics,
		})
		return
	}

	// Return analytics for all products
	analytics := []gin.H{
		{
			"id":             "1",
			"name":           "Logo Design Premium",
			"views":          1250,
			"orders":         25,
			"revenue":        12500000,
			"conversionRate": 2.0,
		},
		{
			"id":             "2",
			"name":           "Business Card Design",
			"views":          890,
			"orders":         18,
			"revenue":        5400000,
			"conversionRate": 2.02,
		},
		{
			"id":             "3",
			"name":           "Brochure Design",
			"views":          675,
			"orders":         15,
			"revenue":        7500000,
			"conversionRate": 2.22,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    analytics,
	})
}

// GlobalSearch handles GET /api/dashboard/search
func (h *DashboardHandler) GlobalSearch(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Query parameter 'q' is required",
		})
		return
	}

	// Mock search results
	results := gin.H{
		"orders": []gin.H{
			{"id": "12345", "customerName": "John Doe", "status": "completed", "totalAmount": 500000},
		},
		"products": []gin.H{
			{"id": "1", "name": "Logo Design Premium", "category": "design", "price": 500000},
		},
		"customers": []gin.H{
			{"id": "1", "name": "John Doe", "email": "john@example.com", "totalOrders": 3},
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// GetActivityFeed handles GET /api/dashboard/activity
func (h *DashboardHandler) GetActivityFeed(c *gin.Context) {
	limitStr := c.Query("limit")
	limit := 20
	if limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	now := time.Now()
	activities := make([]ActivityItem, limit)
	
	for i := 0; i < limit; i++ {
		activities[i] = ActivityItem{
			ID:        fmt.Sprintf("%d", i+1),
			Type:      []string{"order_created", "order_updated", "product_updated"}[i%3],
			Message:   fmt.Sprintf("Activity item %d", i+1),
			Timestamp: now.Add(-time.Duration(i) * time.Hour).Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    activities,
	})
}

// BulkUpdateOrderStatus handles POST /api/dashboard/orders/bulk-update
func (h *DashboardHandler) BulkUpdateOrderStatus(c *gin.Context) {
	var request struct {
		OrderIDs []string `json:"orderIds"`
		Status   string   `json:"status"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request body",
		})
		return
	}

	// Mock bulk update
	fmt.Printf("Bulk updating %d orders to status: %s\n", len(request.OrderIDs), request.Status)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Successfully updated %d orders", len(request.OrderIDs)),
	})
}

// ExportOrders handles GET /api/dashboard/orders/export
func (h *DashboardHandler) ExportOrders(c *gin.Context) {
	format := c.Query("format")
	if format == "" {
		format = "excel"
	}

	// Set appropriate headers for file download
	if format == "excel" {
		c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
		c.Header("Content-Disposition", "attachment; filename=orders-export.xlsx")
	} else {
		c.Header("Content-Type", "text/csv")
		c.Header("Content-Disposition", "attachment; filename=orders-export.csv")
	}

	// Mock file content
	mockContent := "Order ID,Customer,Amount,Status,Date\n12345,John Doe,500000,completed,2024-01-15\n12346,Jane Smith,750000,pending,2024-01-16\n"
	
	c.Data(http.StatusOK, "text/csv", []byte(mockContent))
}

// RegisterDashboardRoutes registers dashboard routes
func RegisterDashboardRoutes(router *gin.Engine, dashboardHandler *DashboardHandler) {
	api := router.Group("/api/dashboard")
	
	// Dashboard metrics
	api.GET("/metrics", dashboardHandler.GetMetrics)
	
	// Analytics
	api.GET("/orders/analytics", dashboardHandler.GetOrderAnalytics)
	api.GET("/products/analytics", dashboardHandler.GetProductAnalytics)
	
	// Search and activity
	api.GET("/search", dashboardHandler.GlobalSearch)
	api.GET("/activity", dashboardHandler.GetActivityFeed)
	
	// Bulk operations
	api.POST("/orders/bulk-update", dashboardHandler.BulkUpdateOrderStatus)
	api.GET("/orders/export", dashboardHandler.ExportOrders)
}