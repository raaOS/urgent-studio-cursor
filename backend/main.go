package main

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Order struct untuk dummy data
type Order struct {
	ID            string    `json:"id"`
	CustomerName  string    `json:"customerName"`
	CustomerEmail string    `json:"customerEmail"`
	Status        string    `json:"status"`
	TotalAmount   float64   `json:"totalAmount"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

// Dummy data orders
var orders = []Order{
	{
		ID:            "ORD-001",
		CustomerName:  "John Doe",
		CustomerEmail: "john@example.com",
		Status:        "pending",
		TotalAmount:   150000,
		CreatedAt:     time.Now().AddDate(0, 0, -2),
		UpdatedAt:     time.Now().AddDate(0, 0, -1),
	},
	{
		ID:            "ORD-002",
		CustomerName:  "Jane Smith",
		CustomerEmail: "jane@example.com",
		Status:        "completed",
		TotalAmount:   250000,
		CreatedAt:     time.Now().AddDate(0, 0, -5),
		UpdatedAt:     time.Now().AddDate(0, 0, -3),
	},
}

func main() {
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:9005"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Admin panel routes
	r.GET("/admin", func(c *gin.Context) {
		adminDashboardHandler(c.Writer, c.Request)
	})
	r.GET("/admin/login", func(c *gin.Context) {
		adminLoginHandler(c.Writer, c.Request)
	})
	r.POST("/admin/login", func(c *gin.Context) {
		// Dummy login, langsung redirect ke dashboard
		c.Redirect(http.StatusFound, "/admin")
	})
	r.GET("/admin/logout", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/admin/login")
	})

	// API routes
	api := r.Group("/api")
	{
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message":   "pong",
				"timestamp": time.Now(),
				"status":    "Backend connected successfully",
			})
		})

		// Orders endpoints
		api.GET("/orders", func(c *gin.Context) {
			c.JSON(200, orders)
		})

		api.GET("/orders/:id", func(c *gin.Context) {
			id := c.Param("id")
			for _, order := range orders {
				if order.ID == id {
					c.JSON(200, order)
					return
				}
			}
			c.JSON(404, gin.H{"error": "Order not found"})
		})

		api.POST("/orders", func(c *gin.Context) {
			var newOrder Order
			if err := c.ShouldBindJSON(&newOrder); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}
			newOrder.ID = "ORD-" + time.Now().Format("20060102150405")
			newOrder.CreatedAt = time.Now()
			newOrder.UpdatedAt = time.Now()
			orders = append(orders, newOrder)
			c.JSON(201, newOrder)
		})

		api.PUT("/orders/:id/status", func(c *gin.Context) {
			id := c.Param("id")
			var statusUpdate struct {
				Status string `json:"status"`
			}
			if err := c.ShouldBindJSON(&statusUpdate); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			for i, order := range orders {
				if order.ID == id {
					orders[i].Status = statusUpdate.Status
					orders[i].UpdatedAt = time.Now()
					c.JSON(200, orders[i])
					return
				}
			}
			c.JSON(404, gin.H{"error": "Order not found"})
		})
	}

	r.Run(":8080")
}
