package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq" // PostgreSQL driver
)

// ServiceItem represents a single service item in the system
type ServiceItem struct {
	ID          string          `json:"id"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Price       float64         `json:"price"`
	Category    string          `json:"category"`
	ImageURL    string          `json:"imageUrl"`
	Features    json.RawMessage `json:"features"`
	DeliveryTime string         `json:"deliveryTime"`
	Revisions   int             `json:"revisions"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// ServiceItemRepository handles database operations for service items
type ServiceItemRepository struct {
	db *sql.DB
}

// NewServiceItemRepository creates a new service item repository
func NewServiceItemRepository(db *sql.DB) *ServiceItemRepository {
	return &ServiceItemRepository{db: db}
}

// GetAllServiceItems retrieves all service items from the database
func (r *ServiceItemRepository) GetAllServiceItems() ([]ServiceItem, error) {
	query := `
		SELECT id, name, description, price, category, image_url, 
		       features, delivery_time, revisions, created_at, updated_at 
		FROM service_items
		ORDER BY name ASC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []ServiceItem
	for rows.Next() {
		var item ServiceItem
		var features []byte

		scanErr := rows.Scan(
			&item.ID, &item.Name, &item.Description, &item.Price, &item.Category, &item.ImageURL,
			&features, &item.DeliveryTime, &item.Revisions, &item.CreatedAt, &item.UpdatedAt,
		)
		if scanErr != nil {
			return nil, scanErr
		}

		item.Features = features
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

// CreateServiceItem creates a new service item in the database
func (r *ServiceItemRepository) CreateServiceItem(item ServiceItem) (ServiceItem, error) {
	query := `
		INSERT INTO service_items (id, name, description, price, category, image_url, 
		                     features, delivery_time, revisions, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id
	`

	// Generate a new UUID if not provided
	if item.ID == "" {
		item.ID = uuid.New().String()
	}

	// Set timestamps
	now := time.Now()
	item.CreatedAt = now
	item.UpdatedAt = now

	// Execute the query
	err := r.db.QueryRow(
		query,
		item.ID, item.Name, item.Description, item.Price, item.Category,
		item.ImageURL, item.Features, item.DeliveryTime, item.Revisions,
		item.CreatedAt, item.UpdatedAt,
	).Scan(&item.ID)

	if err != nil {
		return ServiceItem{}, err
	}

	return item, nil
}

// UpdateServiceItem updates an existing service item
func (r *ServiceItemRepository) UpdateServiceItem(item ServiceItem) (ServiceItem, error) {
	query := `
		UPDATE service_items
		SET name = $2, description = $3, price = $4, category = $5, image_url = $6,
		    features = $7, delivery_time = $8, revisions = $9, updated_at = $10
		WHERE id = $1
		RETURNING id
	`

	// Update timestamp
	item.UpdatedAt = time.Now()

	// Execute the query
	var id string
	err := r.db.QueryRow(
		query,
		item.ID, item.Name, item.Description, item.Price, item.Category,
		item.ImageURL, item.Features, item.DeliveryTime, item.Revisions,
		item.UpdatedAt,
	).Scan(&id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ServiceItem{}, errors.New("service item not found")
		}
		return ServiceItem{}, err
	}

	return item, nil
}

// DeleteServiceItem deletes a service item by its ID
func (r *ServiceItemRepository) DeleteServiceItem(id string) error {
	query := "DELETE FROM service_items WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("service item not found")
	}

	return nil
}

// ServiceItemHandler handles HTTP requests related to service items
type ServiceItemHandler struct {
	repo *ServiceItemRepository
}

// NewServiceItemHandler creates a new service item handler
func NewServiceItemHandler(repo *ServiceItemRepository) *ServiceItemHandler {
	return &ServiceItemHandler{repo: repo}
}

// RegisterRoutes registers the service item routes
func (h *ServiceItemHandler) RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/services", h.GetAllServiceItems)
		api.GET("/services/:id", h.GetServiceItemByID)
		api.GET("/services/category/:category", h.GetServiceItemsByCategory)
		api.POST("/services", h.CreateServiceItem)
		api.PUT("/services/:id", h.UpdateServiceItem)
		api.DELETE("/services/:id", h.DeleteServiceItem)
	}
}

// GetAllServiceItems handles GET /api/services
func (h *ServiceItemHandler) GetAllServiceItems(c *gin.Context) {
	items, err := h.repo.GetAllServiceItems()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

// GetServiceItemByID handles GET /api/services/:id
func (h *ServiceItemHandler) GetServiceItemByID(c *gin.Context) {
	id := c.Param("id")
	item, err := h.repo.GetServiceItemByID(id)
	if err != nil {
		if err.Error() == "service item not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Service item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, item)
}

// GetServiceItemsByCategory handles GET /api/services/category/:category
func (h *ServiceItemHandler) GetServiceItemsByCategory(c *gin.Context) {
	category := c.Param("category")
	items, err := h.repo.GetServiceItemsByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, items)
}

// CreateServiceItem handles POST /api/services
func (h *ServiceItemHandler) CreateServiceItem(c *gin.Context) {
	var item ServiceItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if item.Name == "" || item.Description == "" || item.Price <= 0 || item.Category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Create the service item
	createdItem, err := h.repo.CreateServiceItem(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdItem)
}

// UpdateServiceItem handles PUT /api/services/:id
func (h *ServiceItemHandler) UpdateServiceItem(c *gin.Context) {
	id := c.Param("id")

	// Check if service item exists
	_, err := h.repo.GetServiceItemByID(id)
	if err != nil {
		if err.Error() == "service item not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Service item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Parse the request body
	var item ServiceItem
	if bindErr := c.ShouldBindJSON(&item); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": bindErr.Error()})
		return
	}

	// Ensure ID in URL matches service item ID
	item.ID = id

	// Validate required fields
	if item.Name == "" || item.Description == "" || item.Price <= 0 || item.Category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Update the service item
	updatedItem, err := h.repo.UpdateServiceItem(item)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedItem)
}

// DeleteServiceItem handles DELETE /api/services/:id
func (h *ServiceItemHandler) DeleteServiceItem(c *gin.Context) {
	id := c.Param("id")

	// Delete the service item
	err := h.repo.DeleteServiceItem(id)
	if err != nil {
		if err.Error() == "service item not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Service item not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Service item deleted successfully"})
}

// Global database connection
var db *sql.DB

// InitDB initializes the database connection
func InitDB() (*sql.DB, error) {
	// Load .env file
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using default values")
	}

	// Get database connection parameters from environment variables
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "urgent_studio")

	// Create connection string
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		dbUser, dbPassword, dbHost, dbPort, dbName)

	// Open database connection
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test the connection
	err = db.Ping()
	if err != nil {
		return nil, err
	}

	log.Println("Database connection established")
	return db, nil
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// CloseDB closes the database connection
func CloseDB() {
	if db != nil {
		db.Close()
		log.Println("Database connection closed")
	}
}

// Main function to run the server - commented out to avoid duplicate main
// func main() {
// 	RunSimpleServer()
// }

// RunSimpleServer is the function to run the simple server
func RunSimpleServer() {
	// Initialize database connection
	dbConn, err := InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer CloseDB()

	// Initialize repositories
	serviceItemRepo := NewServiceItemRepository(dbConn)

	// Initialize handlers
	serviceItemHandler := NewServiceItemHandler(serviceItemRepo)
	dashboardHandler := NewDashboardHandler(serviceItemRepo)

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

	// Health check endpoint
	r.GET("/api/health", func(c *gin.Context) {
		// Check database connection
		if err := dbConn.Ping(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": "Database connection error",
				"error":   err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Service is healthy",
		})
	})

	// Register routes
	serviceItemHandler.RegisterRoutes(r)
	RegisterDashboardRoutes(r, dashboardHandler)

	// Get server port from environment variable
	port := getEnv("SERVER_PORT", "8080")

	// Start server
	log.Printf("Server running on port :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// GetServiceItemByID retrieves a service item by its ID
func (r *ServiceItemRepository) GetServiceItemByID(id string) (ServiceItem, error) {
	query := `
		SELECT id, name, description, price, category, image_url, 
		       features, delivery_time, revisions, created_at, updated_at 
		FROM service_items 
		WHERE id = $1
	`

	var item ServiceItem
	var features []byte

	err := r.db.QueryRow(query, id).Scan(
		&item.ID, &item.Name, &item.Description, &item.Price, &item.Category, &item.ImageURL,
		&features, &item.DeliveryTime, &item.Revisions, &item.CreatedAt, &item.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ServiceItem{}, errors.New("service item not found")
		}
		return ServiceItem{}, err
	}

	item.Features = features
	return item, nil
}

// GetServiceItemsByCategory retrieves service items by category
func (r *ServiceItemRepository) GetServiceItemsByCategory(category string) ([]ServiceItem, error) {
	query := `
		SELECT id, name, description, price, category, image_url, 
		       features, delivery_time, revisions, created_at, updated_at 
		FROM service_items 
		WHERE category = $1
		ORDER BY name ASC
	`

	rows, err := r.db.Query(query, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []ServiceItem
	for rows.Next() {
		var item ServiceItem
		var features []byte

		scanErr := rows.Scan(
			&item.ID, &item.Name, &item.Description, &item.Price, &item.Category, &item.ImageURL,
			&features, &item.DeliveryTime, &item.Revisions, &item.CreatedAt, &item.UpdatedAt,
		)
		if scanErr != nil {
			return nil, scanErr
		}

		item.Features = features
		items = append(items, item)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}