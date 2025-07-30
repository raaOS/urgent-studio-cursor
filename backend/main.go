package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/sirupsen/logrus"
)

func StartServer() {
	// Initialize logger first
	InitLogger()
	
	LogInfo("Starting Urgent Studio Backend Server", logrus.Fields{
		"version": "1.0.0",
		"port":    "8080",
	})

	// Load environment variables
	if err := godotenv.Load(); err != nil {
		LogWarn("No .env file found, using environment variables", logrus.Fields{})
	}

	// Initialize database connection
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "password"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "urgent_studio"
	}

	// Create database connection string
	dbConnStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	// Connect to database
	var err error
	dbConn, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		LogError("Failed to connect to database", logrus.Fields{
			"error": err.Error(),
		}, err)
		panic(err)
	}
	defer dbConn.Close()

	// Test database connection
	if pingErr := dbConn.Ping(); pingErr != nil {
		LogError("Failed to ping database", logrus.Fields{
			"error": pingErr.Error(),
		}, pingErr)
		panic(pingErr)
	}

	LogInfo("Database connected successfully", logrus.Fields{
		"host": dbHost,
		"port": dbPort,
		"database": dbName,
	})

	// Initialize repositories and handlers
	authService := NewAuthService(dbConn)
	orderRepo := NewOrderRepository(dbConn)
	orderHandler := NewOrderHandler(orderRepo)
	productRepo := NewProductRepository(dbConn)
	serviceRepo := NewServiceItemRepository(dbConn)
	productHandler := NewProductHandler(productRepo)
	dashboardHandler := NewDashboardHandler(serviceRepo)
	realDashboardHandler := NewRealDashboardHandler(dbConn)
	userRepo := NewUserRepository(dbConn)
	userHandler := NewUserHandler(userRepo)

	// Start WebSocket hub
	StartWebSocketHub()

	r := gin.Default()

	// Add logging middleware
	r.Use(GinLogger())
	r.Use(GinRecovery())

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:9005", "http://localhost:9006"},
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
		// Parse login credentials
		var credentials struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if bindErr := c.ShouldBindJSON(&credentials); bindErr != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "Invalid request format",
			})
			return
		}

		// Authenticate user with JWT
		token, authErr := authService.Authenticate(credentials.Username, credentials.Password)
		if authErr != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "Invalid credentials",
			})
			return
		}

		// Return success with JWT token
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Authentication successful",
			"token":   token,
		})
	})
	r.POST("/admin/logout", func(c *gin.Context) {
		// Get token from Authorization header
		token := c.GetHeader("Authorization")
		if token != "" && len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
			// Get token ID from claims
			claims, validateErr := authService.ValidateToken(token)
			if validateErr != nil {
				LogWarn("Invalid token during logout attempt", logrus.Fields{
					"error": validateErr.Error(),
				})
				c.JSON(http.StatusUnauthorized, gin.H{
					"success": false,
					"message": "Invalid token",
				})
				return
			}
			
			// Revoke the token
			if err := authService.RevokeToken(claims.TokenID); err != nil {
				// Log the error but don't fail the logout
				// The user should still be logged out even if token revocation fails
				LogError("Failed to revoke token during logout", logrus.Fields{
					"token_id": claims.TokenID,
					"error":    err.Error(),
				}, err)
			}
		}
		
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Logged out successfully",
		})
	})
	
	r.GET("/admin/logout", func(c *gin.Context) {
		// For backward compatibility
		c.Redirect(http.StatusFound, "/admin/login")
	})
	
	// Admin users page
	r.GET("/admin/users", func(c *gin.Context) {
		adminUsersHandler(c.Writer, c.Request)
	})

	// API routes
	api := r.Group("/api")
	{
		// Health check endpoint
		api.GET("/health", func(c *gin.Context) {
			requestID := GenerateRequestID()
			
			LogInfo("Health check requested", logrus.Fields{
				"request_id": requestID,
				"client_ip":  c.ClientIP(),
			})
			
			// Test database connection
			pingErr := dbConn.Ping()
			if pingErr != nil {
				LogError("Health check failed - database connection error", logrus.Fields{
					"request_id": requestID,
					"error":      pingErr.Error(),
				}, pingErr)
				
				c.JSON(500, gin.H{
					"status":     "unhealthy",
					"message":    "Database connection failed",
					"timestamp":  time.Now(),
					"error":      pingErr.Error(),
					"request_id": requestID,
				})
				return
			}

			LogInfo("Health check successful", logrus.Fields{
				"request_id": requestID,
				"database":   "connected",
			})

			c.JSON(200, gin.H{
				"status":     "healthy",
				"message":    "All systems operational",
				"timestamp":  time.Now(),
				"database":   "connected",
				"request_id": requestID,
			})
		})

		// Ping endpoint for compatibility
		api.GET("/ping", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message":   "pong",
				"timestamp": time.Now(),
				"status":    "Backend connected successfully",
			})
		})

		// Protected orders endpoints
		ordersGroup := api.Group("/orders")
		ordersGroup.Use(AuthMiddleware(authService))
		{
			ordersGroup.GET("", orderHandler.GetOrders)
			ordersGroup.GET("/:id", orderHandler.GetOrderByID)
			ordersGroup.POST("", orderHandler.CreateOrder)
			ordersGroup.PUT("/:id/status", orderHandler.UpdateOrderStatus)
			ordersGroup.GET("/status/:status", orderHandler.GetOrdersByStatus)
			ordersGroup.GET("/analytics", orderHandler.GetOrderAnalytics)
		}

		// Users endpoints (temporarily without auth for testing)
		usersGroup := api.Group("/users")
		{
			usersGroup.GET("", userHandler.GetUsers)
			usersGroup.GET("/:id", userHandler.GetUser)
			usersGroup.POST("", userHandler.CreateUser)
			usersGroup.PUT("/:id", userHandler.UpdateUser)
			usersGroup.DELETE("/:id", userHandler.DeleteUser)
			usersGroup.PATCH("/:id/toggle-status", userHandler.ToggleUserStatus)
			usersGroup.PATCH("/:id/change-password", userHandler.ChangeUserPassword)
		}
	}

	// Register product routes
	productHandler.RegisterRoutes(r)

	// Register dashboard routes
	RegisterDashboardRoutes(r, dashboardHandler)
	RegisterRealDashboardRoutes(r, realDashboardHandler)

	// Initialize Mayar.id integration
	if err := InitializeMayarIntegration(r, orderRepo); err != nil {
		LogError("Failed to initialize Mayar integration", logrus.Fields{
			"error": err.Error(),
		}, err)
		// Continue running even if Mayar integration fails
	}

	// Register WebSocket route
	r.GET("/ws", handleWebSocket)

	LogInfo("All routes registered successfully", logrus.Fields{
		"routes": []string{"/admin", "/api/health", "/api/ping", "/api/orders", "/api/users", "/api/products", "/api/mayar", "/ws"},
	})

	LogInfo("Server starting on port 8080", logrus.Fields{
		"port": "8080",
		"env":  gin.Mode(),
	})

	serverErr := r.Run(":8080")
	if serverErr != nil {
		LogError("Failed to start server", logrus.Fields{
			"error": serverErr.Error(),
		}, serverErr)
		panic(serverErr)
	}
}

func main() {
	// Initialize logger first
	InitLogger()
	
	LogInfo("Urgent Studio Backend starting...", logrus.Fields{
		"version": "1.0.0",
		"mode":    gin.Mode(),
	})
	
	// Start the server
	StartServer()
}
