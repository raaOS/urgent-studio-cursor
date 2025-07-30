package main

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// OrderHandler handles HTTP requests for orders
type OrderHandler struct {
	repo *OrderRepository
}

// NewOrderHandler creates a new order handler
func NewOrderHandler(repo *OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
}

// GetOrders handles GET /api/orders
func (h *OrderHandler) GetOrders(c *gin.Context) {
	requestID := GenerateRequestID()
	
	LogInfo("Get orders requested", logrus.Fields{
		"request_id": requestID,
		"client_ip":  c.ClientIP(),
	})

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // Max limit
	}
	
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get orders from database
	orders, err := h.repo.GetAllOrders(limit, offset)
	if err != nil {
		LogError("Failed to get orders", logrus.Fields{
			"request_id": requestID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to retrieve orders",
			"request_id": requestID,
		})
		return
	}

	// Ensure orders is never nil - always return an array
	if orders == nil {
		orders = []OrderModel{}
	}

	LogInfo("Orders retrieved successfully", logrus.Fields{
		"request_id": requestID,
		"count":      len(orders),
		"limit":      limit,
		"offset":     offset,
	})

	c.JSON(http.StatusOK, gin.H{
		"data":       orders,
		"count":      len(orders),
		"limit":      limit,
		"offset":     offset,
		"request_id": requestID,
	})
}

// GetOrderByID handles GET /api/orders/:id
func (h *OrderHandler) GetOrderByID(c *gin.Context) {
	requestID := GenerateRequestID()
	orderID := c.Param("id")
	
	LogInfo("Get order by ID requested", logrus.Fields{
		"request_id": requestID,
		"order_id":   orderID,
		"client_ip":  c.ClientIP(),
	})

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "Order ID is required",
			"request_id": requestID,
		})
		return
	}

	// Get order from database
	order, err := h.repo.GetOrderByID(orderID)
	if err != nil {
		LogError("Failed to get order", logrus.Fields{
			"request_id": requestID,
			"order_id":   orderID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusNotFound, gin.H{
			"error":      "Order not found",
			"request_id": requestID,
		})
		return
	}

	LogInfo("Order retrieved successfully", logrus.Fields{
		"request_id": requestID,
		"order_id":   orderID,
	})

	c.JSON(http.StatusOK, gin.H{
		"data":       order,
		"request_id": requestID,
	})
}

// CreateOrder handles POST /api/orders
func (h *OrderHandler) CreateOrder(c *gin.Context) {
	requestID := GenerateRequestID()
	
	LogInfo("Create order requested", logrus.Fields{
		"request_id": requestID,
		"client_ip":  c.ClientIP(),
	})

	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		LogError("Invalid request format", logrus.Fields{
			"request_id": requestID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "Invalid request format",
			"details":    err.Error(),
			"request_id": requestID,
		})
		return
	}

	// Create order in database
	order, err := h.repo.CreateOrder(&req)
	if err != nil {
		LogError("Failed to create order", logrus.Fields{
			"request_id": requestID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to create order",
			"request_id": requestID,
		})
		return
	}

	LogInfo("Order created successfully", logrus.Fields{
		"request_id":   requestID,
		"order_id":     order.ID,
		"order_number": order.OrderNumber,
		"customer":     order.CustomerName,
		"total":        order.TotalAmount,
	})

	c.JSON(http.StatusCreated, gin.H{
		"data":       order,
		"message":    "Order created successfully",
		"request_id": requestID,
	})
}

// UpdateOrderStatus handles PUT /api/orders/:id/status
func (h *OrderHandler) UpdateOrderStatus(c *gin.Context) {
	requestID := GenerateRequestID()
	orderID := c.Param("id")
	
	LogInfo("Update order status requested", logrus.Fields{
		"request_id": requestID,
		"order_id":   orderID,
		"client_ip":  c.ClientIP(),
	})

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "Order ID is required",
			"request_id": requestID,
		})
		return
	}

	var req UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		LogError("Invalid request format", logrus.Fields{
			"request_id": requestID,
			"order_id":   orderID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "Invalid request format",
			"details":    err.Error(),
			"request_id": requestID,
		})
		return
	}

	// Update order status in database
	err := h.repo.UpdateOrderStatus(orderID, &req)
	if err != nil {
		LogError("Failed to update order status", logrus.Fields{
			"request_id": requestID,
			"order_id":   orderID,
			"status":     req.Status,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to update order status",
			"request_id": requestID,
		})
		return
	}

	LogInfo("Order status updated successfully", logrus.Fields{
		"request_id": requestID,
		"order_id":   orderID,
		"new_status": req.Status,
	})

	c.JSON(http.StatusOK, gin.H{
		"message":    "Order status updated successfully",
		"request_id": requestID,
	})
}

// GetOrdersByStatus handles GET /api/orders/status/:status
func (h *OrderHandler) GetOrdersByStatus(c *gin.Context) {
	requestID := GenerateRequestID()
	status := c.Param("status")
	
	LogInfo("Get orders by status requested", logrus.Fields{
		"request_id": requestID,
		"status":     status,
		"client_ip":  c.ClientIP(),
	})

	if status == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "Status is required",
			"request_id": requestID,
		})
		return
	}

	// Parse pagination parameters
	limitStr := c.DefaultQuery("limit", "10")
	offsetStr := c.DefaultQuery("offset", "0")
	
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // Max limit
	}
	
	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}

	// Get orders by status from database
	orders, err := h.repo.GetOrdersByStatus(status, limit, offset)
	if err != nil {
		LogError("Failed to get orders by status", logrus.Fields{
			"request_id": requestID,
			"status":     status,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to retrieve orders",
			"request_id": requestID,
		})
		return
	}

	LogInfo("Orders by status retrieved successfully", logrus.Fields{
		"request_id": requestID,
		"status":     status,
		"count":      len(orders),
		"limit":      limit,
		"offset":     offset,
	})

	c.JSON(http.StatusOK, gin.H{
		"data":       orders,
		"count":      len(orders),
		"status":     status,
		"limit":      limit,
		"offset":     offset,
		"request_id": requestID,
	})
}

// GetOrderAnalytics handles GET /api/orders/analytics
func (h *OrderHandler) GetOrderAnalytics(c *gin.Context) {
	requestID := GenerateRequestID()
	
	LogInfo("Get order analytics requested", logrus.Fields{
		"request_id": requestID,
		"client_ip":  c.ClientIP(),
	})

	// Get analytics from database
	analytics, err := h.repo.GetOrderAnalytics()
	if err != nil {
		LogError("Failed to get order analytics", logrus.Fields{
			"request_id": requestID,
			"error":      err.Error(),
		}, err)
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to retrieve analytics",
			"request_id": requestID,
		})
		return
	}

	LogInfo("Order analytics retrieved successfully", logrus.Fields{
		"request_id": requestID,
	})

	c.JSON(http.StatusOK, gin.H{
		"data":       analytics,
		"request_id": requestID,
	})
}