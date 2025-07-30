package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ProductHandler handles HTTP requests related to products
type ProductHandler struct {
	repo *ProductRepository
}

// NewProductHandler creates a new product handler
func NewProductHandler(repo *ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

// RegisterRoutes registers the product routes
func (h *ProductHandler) RegisterRoutes(router *gin.Engine) {
	api := router.Group("/api")
	{
		api.GET("/products", h.GetAllProducts)
		api.GET("/products/:id", h.GetProductByID)
		api.GET("/products/code/:code", h.GetProductByCode)
		api.GET("/products/category/:category", h.GetProductsByCategory)
		api.POST("/products", h.CreateProduct)
		api.PUT("/products/:id", h.UpdateProduct)
		api.DELETE("/products/:id", h.DeleteProduct)
	}
}

// GetAllProducts handles GET /api/products
func (h *ProductHandler) GetAllProducts(c *gin.Context) {
	products, err := h.repo.GetAllProducts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

// GetProductByID handles GET /api/products/:id
func (h *ProductHandler) GetProductByID(c *gin.Context) {
	id := c.Param("id")
	product, err := h.repo.GetProductByID(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

// GetProductByCode handles GET /api/products/code/:code
func (h *ProductHandler) GetProductByCode(c *gin.Context) {
	code := c.Param("code")
	product, err := h.repo.GetProductByCode(code)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, product)
}

// GetProductsByCategory handles GET /api/products/category/:category
func (h *ProductHandler) GetProductsByCategory(c *gin.Context) {
	category := c.Param("category")
	products, err := h.repo.GetProductsByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, products)
}

// CreateProduct handles POST /api/products
func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var product Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate required fields
	if product.Name == "" || product.Description == "" || product.Price <= 0 || product.Category == "" || product.ProductCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Create the product
	createdProduct, err := h.repo.CreateProduct(product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdProduct)
}

// UpdateProduct handles PUT /api/products/:id
func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id := c.Param("id")

	// Check if product exists
	_, err := h.repo.GetProductByID(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Parse the request body
	var product Product
	if bindErr := c.ShouldBindJSON(&product); bindErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": bindErr.Error()})
		return
	}

	// Ensure ID in URL matches product ID
	product.ID = id

	// Validate required fields
	if product.Name == "" || product.Description == "" || product.Price <= 0 || product.Category == "" || product.ProductCode == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing required fields"})
		return
	}

	// Update the product
	updatedProduct, err := h.repo.UpdateProduct(product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedProduct)
}

// DeleteProduct handles DELETE /api/products/:id
func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id := c.Param("id")

	// Delete the product
	err := h.repo.DeleteProduct(id)
	if err != nil {
		if err.Error() == "product not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}