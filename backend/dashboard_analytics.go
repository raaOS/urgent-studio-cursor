package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// RealDashboardHandler handles dashboard analytics with real data
type RealDashboardHandler struct {
	db *sql.DB
}

// NewRealDashboardHandler creates a new real dashboard handler
func NewRealDashboardHandler(db *sql.DB) *RealDashboardHandler {
	return &RealDashboardHandler{db: db}
}

// RealDashboardMetrics represents real dashboard metrics from database
type RealDashboardMetrics struct {
	TotalOrders      int                    `json:"totalOrders"`
	TotalRevenue     float64                `json:"totalRevenue"`
	TotalCustomers   int                    `json:"totalCustomers"`
	PendingOrders    int                    `json:"pendingOrders"`
	CompletedToday   int                    `json:"completedToday"`
	RevenueToday     float64                `json:"revenueToday"`
	OrdersByStatus   map[string]int         `json:"ordersByStatus"`
	RevenueByService map[string]float64     `json:"revenueByService"`
	DailyStats       []RealDailyStats       `json:"dailyStats"`
	TopServices      []RealServiceStats     `json:"topServices"`
	RecentActivity   []RealActivityItem     `json:"recentActivity"`
}

// RealDailyStats represents real daily statistics
type RealDailyStats struct {
	Date    string  `json:"date"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
}

// RealServiceStats represents real service statistics
type RealServiceStats struct {
	Service string  `json:"service"`
	Orders  int     `json:"orders"`
	Revenue float64 `json:"revenue"`
}

// RealActivityItem represents real recent activity
type RealActivityItem struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

// GetRealMetrics handles GET /api/dashboard/real-metrics
func (h *RealDashboardHandler) GetRealMetrics(c *gin.Context) {
	metrics := RealDashboardMetrics{}

	// Get total orders
	err := h.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&metrics.TotalOrders)
	if err != nil {
		metrics.TotalOrders = 0
	}

	// Get total revenue
	err = h.db.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM orders").Scan(&metrics.TotalRevenue)
	if err != nil {
		metrics.TotalRevenue = 0
	}

	// Get total unique customers
	err = h.db.QueryRow("SELECT COUNT(DISTINCT customer_email) FROM orders").Scan(&metrics.TotalCustomers)
	if err != nil {
		metrics.TotalCustomers = 0
	}

	// Get pending orders
	err = h.db.QueryRow("SELECT COUNT(*) FROM orders WHERE status = 'pending'").Scan(&metrics.PendingOrders)
	if err != nil {
		metrics.PendingOrders = 0
	}

	// Get completed orders today
	err = h.db.QueryRow(`
		SELECT COUNT(*) FROM orders 
		WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE
	`).Scan(&metrics.CompletedToday)
	if err != nil {
		metrics.CompletedToday = 0
	}

	// Get revenue today
	err = h.db.QueryRow(`
		SELECT COALESCE(SUM(total_amount), 0) FROM orders 
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&metrics.RevenueToday)
	if err != nil {
		metrics.RevenueToday = 0
	}

	// Get orders by status
	metrics.OrdersByStatus = make(map[string]int)
	statusRows, statusErr := h.db.Query("SELECT status, COUNT(*) FROM orders GROUP BY status")
	if statusErr == nil {
		defer statusRows.Close()
		for statusRows.Next() {
			var status string
			var count int
			if scanErr := statusRows.Scan(&status, &count); scanErr == nil {
				metrics.OrdersByStatus[status] = count
			}
		}
	}

	// Get revenue by service
	metrics.RevenueByService = make(map[string]float64)
	serviceRows, serviceErr := h.db.Query(`
		SELECT service_type, COALESCE(SUM(total_amount), 0) 
		FROM orders 
		GROUP BY service_type
	`)
	if serviceErr == nil {
		defer serviceRows.Close()
		for serviceRows.Next() {
			var service string
			var revenue float64
			if scanErr := serviceRows.Scan(&service, &revenue); scanErr == nil {
				metrics.RevenueByService[service] = revenue
			}
		}
	}

	// Get daily stats for last 7 days
	dailyRows, dailyErr := h.db.Query(`
		SELECT DATE(created_at) as date, COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue
		FROM orders 
		WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`)
	if dailyErr == nil {
		defer dailyRows.Close()
		for dailyRows.Next() {
			var stat RealDailyStats
			if scanErr := dailyRows.Scan(&stat.Date, &stat.Orders, &stat.Revenue); scanErr == nil {
				metrics.DailyStats = append(metrics.DailyStats, stat)
			}
		}
	}

	// Get top services
	topRows, topErr := h.db.Query(`
		SELECT service_type, COUNT(*) as orders, COALESCE(SUM(total_amount), 0) as revenue
		FROM orders 
		GROUP BY service_type
		ORDER BY revenue DESC
		LIMIT 5
	`)
	if topErr == nil {
		defer topRows.Close()
		for topRows.Next() {
			var stat RealServiceStats
			if scanErr := topRows.Scan(&stat.Service, &stat.Orders, &stat.Revenue); scanErr == nil {
				metrics.TopServices = append(metrics.TopServices, stat)
			}
		}
	}

	// Get recent activity
	activityRows, activityErr := h.db.Query(`
		SELECT id, status, customer_name, created_at
		FROM orders 
		ORDER BY created_at DESC
		LIMIT 10
	`)
	if activityErr == nil {
		defer activityRows.Close()
		for activityRows.Next() {
			var id, status, customerName string
			var createdAt time.Time
			if scanErr := activityRows.Scan(&id, &status, &customerName, &createdAt); scanErr == nil {
				activity := RealActivityItem{
					ID:        id,
					Type:      "order_" + status,
					Message:   fmt.Sprintf("Order %s - %s (%s)", id, customerName, status),
					Timestamp: createdAt.Format(time.RFC3339),
				}
				metrics.RecentActivity = append(metrics.RecentActivity, activity)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    metrics,
	})
}

// GetRealOrderAnalytics handles GET /api/dashboard/real-orders/analytics
func (h *RealDashboardHandler) GetRealOrderAnalytics(c *gin.Context) {
	analytics := gin.H{}

	// Total orders
	var totalOrders int
	if err := h.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders); err != nil {
		// Log error but continue with 0 as default
		totalOrders = 0
	}
	analytics["totalOrders"] = totalOrders

	// Average order value
	var avgOrderValue float64
	if err := h.db.QueryRow("SELECT COALESCE(AVG(total_amount), 0) FROM orders").Scan(&avgOrderValue); err != nil {
		// Log error but continue with 0 as default
		avgOrderValue = 0
	}
	analytics["averageOrderValue"] = avgOrderValue

	// Conversion rate (assuming we track visits in the future)
	analytics["conversionRate"] = 0.0 // Placeholder

	// Order trends by month
	trendRows, trendErr := h.db.Query(`
		SELECT 
			TO_CHAR(created_at, 'Mon') as month,
			COUNT(*) as orders,
			COALESCE(SUM(total_amount), 0) as revenue
		FROM orders 
		WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
		GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(month FROM created_at)
		ORDER BY EXTRACT(month FROM created_at)
	`)
	
	var orderTrends []gin.H
	if trendErr == nil {
		defer trendRows.Close()
		for trendRows.Next() {
			var month string
			var orders int
			var revenue float64
			if scanErr := trendRows.Scan(&month, &orders, &revenue); scanErr == nil {
				orderTrends = append(orderTrends, gin.H{
					"month":   month,
					"orders":  orders,
					"revenue": revenue,
				})
			}
		}
	}
	analytics["orderTrends"] = orderTrends

	// Status distribution
	statusDist := make(map[string]int)
	statusRows, statusErr := h.db.Query("SELECT status, COUNT(*) FROM orders GROUP BY status")
	if statusErr == nil {
		defer statusRows.Close()
		for statusRows.Next() {
			var status string
			var count int
			if scanErr := statusRows.Scan(&status, &count); scanErr == nil {
				statusDist[status] = count
			}
		}
	}
	analytics["statusDistribution"] = statusDist

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    analytics,
	})
}

// GetRealSearchResults handles GET /api/dashboard/real-search
func (h *RealDashboardHandler) GetRealSearchResults(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}

	results := gin.H{
		"orders":    []gin.H{},
		"customers": []gin.H{},
		"services":  []gin.H{},
	}

	// Search orders
	orderRows, orderErr := h.db.Query(`
		SELECT id, order_number, customer_name, service_type, status, total_amount
		FROM orders 
		WHERE order_number ILIKE $1 OR customer_name ILIKE $1 OR service_type ILIKE $1
		LIMIT 10
	`, "%"+query+"%")
	
	if orderErr == nil {
		defer orderRows.Close()
		var orders []gin.H
		for orderRows.Next() {
			var id, orderNumber, customerName, serviceType, status string
			var totalAmount float64
			if scanErr := orderRows.Scan(&id, &orderNumber, &customerName, &serviceType, &status, &totalAmount); scanErr == nil {
				orders = append(orders, gin.H{
					"id":           id,
					"orderNumber":  orderNumber,
					"customerName": customerName,
					"serviceType":  serviceType,
					"status":       status,
					"totalAmount":  totalAmount,
				})
			}
		}
		results["orders"] = orders
	}

	// Search customers (unique customers from orders)
	customerRows, customerErr := h.db.Query(`
		SELECT DISTINCT customer_name, customer_email, customer_phone
		FROM orders 
		WHERE customer_name ILIKE $1 OR customer_email ILIKE $1 OR customer_phone ILIKE $1
		LIMIT 10
	`, "%"+query+"%")
	
	if customerErr == nil {
		defer customerRows.Close()
		var customers []gin.H
		for customerRows.Next() {
			var name, email, phone string
			if scanErr := customerRows.Scan(&name, &email, &phone); scanErr == nil {
				customers = append(customers, gin.H{
					"name":  name,
					"email": email,
					"phone": phone,
				})
			}
		}
		results["customers"] = customers
	}

	// Search services (from products table if available)
	serviceRows, serviceErr := h.db.Query(`
		SELECT DISTINCT service_type, COUNT(*) as order_count, COALESCE(SUM(total_amount), 0) as total_revenue
		FROM orders 
		WHERE service_type ILIKE $1
		GROUP BY service_type
		LIMIT 10
	`, "%"+query+"%")
	
	if serviceErr == nil {
		defer serviceRows.Close()
		var services []gin.H
		for serviceRows.Next() {
			var serviceType string
			var orderCount int
			var totalRevenue float64
			if scanErr := serviceRows.Scan(&serviceType, &orderCount, &totalRevenue); scanErr == nil {
				services = append(services, gin.H{
					"name":         serviceType,
					"orderCount":   orderCount,
					"totalRevenue": totalRevenue,
				})
			}
		}
		results["services"] = services
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// RegisterRealDashboardRoutes registers real dashboard routes
func RegisterRealDashboardRoutes(router *gin.Engine, handler *RealDashboardHandler) {
	api := router.Group("/api/dashboard")
	{
		api.GET("/real-metrics", handler.GetRealMetrics)
		api.GET("/real-orders/analytics", handler.GetRealOrderAnalytics)
		api.GET("/real-search", handler.GetRealSearchResults)
	}
}