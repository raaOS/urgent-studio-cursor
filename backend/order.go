package main

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

// OrderModel represents an order in the system
type OrderModel struct {
	ID              string  `json:"id" db:"id"`
	OrderNumber     string  `json:"orderNumber" db:"order_number"`
	CustomerName    string  `json:"customerName" db:"customer_name"`
	CustomerEmail   string  `json:"customerEmail" db:"customer_email"`
	CustomerPhone   *string `json:"customerPhone" db:"customer_phone"`
	CustomerAddress *string `json:"customerAddress" db:"customer_address"`

	// Order details
	Status         string  `json:"status" db:"status"`
	TotalAmount    float64 `json:"totalAmount" db:"total_amount"`
	Subtotal       float64 `json:"subtotal" db:"subtotal"`
	TaxAmount      float64 `json:"taxAmount" db:"tax_amount"`
	DiscountAmount float64 `json:"discountAmount" db:"discount_amount"`
	HandlingFee    float64 `json:"handlingFee" db:"handling_fee"`
	UniqueCode     *int    `json:"uniqueCode" db:"unique_code"`

	// Payment details
	PaymentMethod *string    `json:"paymentMethod" db:"payment_method"`
	PaymentStatus string     `json:"paymentStatus" db:"payment_status"`
	PaymentToken  *string    `json:"paymentToken" db:"payment_token"`
	PaymentURL    *string    `json:"paymentUrl" db:"payment_url"`
	PaidAt        *time.Time `json:"paidAt" db:"paid_at"`

	// Order metadata
	Notes      *string `json:"notes" db:"notes"`
	AdminNotes *string `json:"adminNotes" db:"admin_notes"`
	Priority   string  `json:"priority" db:"priority"`
	Source     string  `json:"source" db:"source"`

	// Timestamps
	CreatedAt   time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time  `json:"updatedAt" db:"updated_at"`
	CompletedAt *time.Time `json:"completedAt" db:"completed_at"`
	CancelledAt *time.Time `json:"cancelledAt" db:"cancelled_at"`

	// Related data
	Items []OrderItem `json:"items,omitempty"`
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID        string  `json:"id" db:"id"`
	OrderID   string  `json:"orderId" db:"order_id"`
	ProductID *string `json:"productId" db:"product_id"`
	ServiceID *string `json:"serviceId" db:"service_id"`

	// Item details
	ItemName        string  `json:"itemName" db:"item_name"`
	ItemDescription *string `json:"itemDescription" db:"item_description"`
	Quantity        int     `json:"quantity" db:"quantity"`
	UnitPrice       float64 `json:"unitPrice" db:"unit_price"`
	TotalPrice      float64 `json:"totalPrice" db:"total_price"`

	// Service specific fields
	BriefDetails  *string    `json:"briefDetails" db:"brief_details"`
	DeliveryDate  *time.Time `json:"deliveryDate" db:"delivery_date"`
	RevisionCount int        `json:"revisionCount" db:"revision_count"`
	MaxRevisions  int        `json:"maxRevisions" db:"max_revisions"`

	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

// OrderStatusHistory represents order status changes
type OrderStatusHistory struct {
	ID        string    `json:"id" db:"id"`
	OrderID   string    `json:"orderId" db:"order_id"`
	Status    string    `json:"status" db:"status"`
	Notes     *string   `json:"notes" db:"notes"`
	ChangedBy *string   `json:"changedBy" db:"changed_by"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// CreateOrderRequest represents the request to create a new order
type CreateOrderRequest struct {
	CustomerName    string             `json:"customerName" binding:"required"`
	CustomerEmail   string             `json:"customerEmail" binding:"required,email"`
	CustomerPhone   *string            `json:"customerPhone"`
	CustomerAddress *string            `json:"customerAddress"`
	Notes           *string            `json:"notes"`
	Items           []OrderItemRequest `json:"items" binding:"required,min=1"`
}

// OrderItemRequest represents an item in the create order request
type OrderItemRequest struct {
	ProductID       *string `json:"productId"`
	ServiceID       *string `json:"serviceId"`
	ItemName        string  `json:"itemName" binding:"required"`
	ItemDescription *string `json:"itemDescription"`
	Quantity        int     `json:"quantity" binding:"required,min=1"`
	UnitPrice       float64 `json:"unitPrice" binding:"required,min=0"`
	BriefDetails    *string `json:"briefDetails"`
	DeliveryDate    *string `json:"deliveryDate"` // ISO date string
}

// UpdateOrderStatusRequest represents the request to update order status
type UpdateOrderStatusRequest struct {
	Status    string  `json:"status" binding:"required"`
	Notes     *string `json:"notes"`
	ChangedBy *string `json:"changedBy"`
}

// OrderRepository handles database operations for orders
type OrderRepository struct {
	db *sql.DB
}

// NewOrderRepository creates a new order repository
func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// CreateOrder creates a new order
func (r *OrderRepository) CreateOrder(req *CreateOrderRequest) (*OrderModel, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			// Rollback error is expected when transaction was committed successfully
			// Only log if it's not a "transaction has already been committed or rolled back" error
			if rollbackErr.Error() != "sql: transaction has already been committed or rolled back" {
				LogError("Failed to rollback transaction in CreateOrder", logrus.Fields{
					"error": rollbackErr.Error(),
				}, rollbackErr)
			}
		} else {
			// Log successful transaction rollback (for debugging purposes)
			LogDebug("Transaction rollback completed successfully", logrus.Fields{
				"operation": "CreateOrder",
			})
		}
	}()
	
	// Menghapus kondisi yang tidak valid

	// Generate order number
	orderNumber := fmt.Sprintf("ORD-%s", time.Now().Format("20060102150405"))

	// Calculate totals
	var subtotal float64
	for _, item := range req.Items {
		subtotal += item.UnitPrice * float64(item.Quantity)
	}

	// For now, no tax or handling fee
	totalAmount := subtotal

	// Insert order
	orderQuery := `
		INSERT INTO orders (order_number, customer_name, customer_email, customer_phone, customer_address, 
		                   status, subtotal, total_amount, notes, priority, source)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at, updated_at
	`

	var order OrderModel
	err = tx.QueryRow(orderQuery, orderNumber, req.CustomerName, req.CustomerEmail,
		req.CustomerPhone, req.CustomerAddress, "pending", subtotal, totalAmount,
		req.Notes, "normal", "website").Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Set order fields
	order.OrderNumber = orderNumber
	order.CustomerName = req.CustomerName
	order.CustomerEmail = req.CustomerEmail
	order.CustomerPhone = req.CustomerPhone
	order.CustomerAddress = req.CustomerAddress
	order.Status = "pending"
	order.Subtotal = subtotal
	order.TotalAmount = totalAmount
	order.Notes = req.Notes
	order.Priority = "normal"
	order.Source = "website"
	order.PaymentStatus = "pending"

	// Insert order items
	for _, itemReq := range req.Items {
		itemID := uuid.New().String()
		totalPrice := itemReq.UnitPrice * float64(itemReq.Quantity)

		var deliveryDate *time.Time
		if itemReq.DeliveryDate != nil && *itemReq.DeliveryDate != "" {
			if parsed, parseErr := time.Parse("2006-01-02", *itemReq.DeliveryDate); parseErr == nil {
				deliveryDate = &parsed
			} else {
				// Log invalid date format but continue without delivery date
				LogWarn("Invalid delivery date format, skipping", logrus.Fields{
					"date":  *itemReq.DeliveryDate,
					"error": parseErr.Error(),
				})
			}
		}

		itemQuery := `
			INSERT INTO order_items (id, order_id, product_id, service_id, item_name, item_description,
			                        quantity, unit_price, total_price, brief_details, delivery_date, max_revisions)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		`

		_, err = tx.Exec(itemQuery, itemID, order.ID, itemReq.ProductID, itemReq.ServiceID,
			itemReq.ItemName, itemReq.ItemDescription, itemReq.Quantity, itemReq.UnitPrice,
			totalPrice, itemReq.BriefDetails, deliveryDate, 1)
		if err != nil {
			return nil, fmt.Errorf("failed to create order item: %w", err)
		}

		// Add item to order
		item := OrderItem{
			ID:              itemID,
			OrderID:         order.ID,
			ProductID:       itemReq.ProductID,
			ServiceID:       itemReq.ServiceID,
			ItemName:        itemReq.ItemName,
			ItemDescription: itemReq.ItemDescription,
			Quantity:        itemReq.Quantity,
			UnitPrice:       itemReq.UnitPrice,
			TotalPrice:      totalPrice,
			BriefDetails:    itemReq.BriefDetails,
			DeliveryDate:    deliveryDate,
			RevisionCount:   0,
			MaxRevisions:    1,
			CreatedAt:       order.CreatedAt,
			UpdatedAt:       order.UpdatedAt,
		}
		order.Items = append(order.Items, item)
	}

	// Add initial status history
	err = r.addStatusHistory(tx, order.ID, "pending", nil, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to add status history: %w", err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &order, nil
}

// GetAllOrders retrieves all orders with pagination
func (r *OrderRepository) GetAllOrders(limit int, offset int) ([]OrderModel, error) {
	query := `
		SELECT id, order_number, customer_name, customer_email, customer_phone, customer_address,
		       status, total_amount, subtotal, tax_amount, discount_amount, handling_fee, unique_code,
		       payment_method, payment_status, payment_token, payment_url, paid_at,
		       notes, admin_notes, priority, source,
		       created_at, updated_at, completed_at, cancelled_at
		FROM orders
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	rows, err := r.db.Query(query, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query orders: %w", err)
	}
	defer rows.Close()

	// Initialize with empty slice to ensure it's never nil
	orders := make([]OrderModel, 0)
	for rows.Next() {
		var order OrderModel
		scanErr := rows.Scan(
			&order.ID, &order.OrderNumber, &order.CustomerName, &order.CustomerEmail,
			&order.CustomerPhone, &order.CustomerAddress, &order.Status, &order.TotalAmount,
			&order.Subtotal, &order.TaxAmount, &order.DiscountAmount, &order.HandlingFee,
			&order.UniqueCode, &order.PaymentMethod, &order.PaymentStatus, &order.PaymentToken,
			&order.PaymentURL, &order.PaidAt, &order.Notes, &order.AdminNotes, &order.Priority,
			&order.Source, &order.CreatedAt, &order.UpdatedAt, &order.CompletedAt, &order.CancelledAt,
		)
		if scanErr != nil {
			return nil, fmt.Errorf("failed to scan order: %w", scanErr)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// GetOrderByID retrieves an order by ID with its items
func (r *OrderRepository) GetOrderByID(id string) (*OrderModel, error) {
	// Get order
	orderQuery := `
		SELECT id, order_number, customer_name, customer_email, customer_phone, customer_address,
		       status, total_amount, subtotal, tax_amount, discount_amount, handling_fee, unique_code,
		       payment_method, payment_status, payment_token, payment_url, paid_at,
		       notes, admin_notes, priority, source,
		       created_at, updated_at, completed_at, cancelled_at
		FROM orders
		WHERE id = $1
	`

	var order OrderModel
	err := r.db.QueryRow(orderQuery, id).Scan(
		&order.ID, &order.OrderNumber, &order.CustomerName, &order.CustomerEmail,
		&order.CustomerPhone, &order.CustomerAddress, &order.Status, &order.TotalAmount,
		&order.Subtotal, &order.TaxAmount, &order.DiscountAmount, &order.HandlingFee,
		&order.UniqueCode, &order.PaymentMethod, &order.PaymentStatus, &order.PaymentToken,
		&order.PaymentURL, &order.PaidAt, &order.Notes, &order.AdminNotes, &order.Priority,
		&order.Source, &order.CreatedAt, &order.UpdatedAt, &order.CompletedAt, &order.CancelledAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Get order items
	itemsQuery := `
		SELECT id, order_id, product_id, service_id, item_name, item_description,
		       quantity, unit_price, total_price, brief_details, delivery_date,
		       revision_count, max_revisions, created_at, updated_at
		FROM order_items
		WHERE order_id = $1
		ORDER BY created_at
	`

	rows, err := r.db.Query(itemsQuery, id)
	if err != nil {
		return nil, fmt.Errorf("failed to query order items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item OrderItem
		scanErr := rows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.ServiceID,
			&item.ItemName, &item.ItemDescription, &item.Quantity, &item.UnitPrice,
			&item.TotalPrice, &item.BriefDetails, &item.DeliveryDate,
			&item.RevisionCount, &item.MaxRevisions, &item.CreatedAt, &item.UpdatedAt,
		)
		if scanErr != nil {
			return nil, fmt.Errorf("failed to scan order item: %w", scanErr)
		}
		order.Items = append(order.Items, item)
	}

	return &order, nil
}

// UpdateOrderStatus updates the status of an order
func (r *OrderRepository) UpdateOrderStatus(id string, req *UpdateOrderStatusRequest) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			// Rollback error is expected when transaction was committed successfully
			// Only log if it's not a "transaction has already been committed or rolled back" error
			if rollbackErr.Error() != "sql: transaction has already been committed or rolled back" {
				LogError("Failed to rollback transaction in UpdateOrderStatus", logrus.Fields{
					"error": rollbackErr.Error(),
				}, rollbackErr)
			}
		} else {
			// Log successful transaction rollback (for debugging purposes)
			LogDebug("Transaction rollback completed successfully", logrus.Fields{
				"operation": "UpdateOrderStatus",
			})
		}
	}()

	// Update order status
	var completedAt, cancelledAt *time.Time
	now := time.Now()

	switch req.Status {
	case "completed":
		completedAt = &now
	case "cancelled":
		cancelledAt = &now
	}

	updateQuery := `
		UPDATE orders 
		SET status = $1, completed_at = $2, cancelled_at = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`

	_, err = tx.Exec(updateQuery, req.Status, completedAt, cancelledAt, id)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	// Add status history
	err = r.addStatusHistory(tx, id, req.Status, req.Notes, req.ChangedBy)
	if err != nil {
		return fmt.Errorf("failed to add status history: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Get order details for broadcasting
	order, getErr := r.GetOrderByID(id)
	if getErr != nil {
		LogError("Failed to get order for broadcasting", logrus.Fields{
			"order_id": id,
			"error":    getErr.Error(),
		}, getErr)
	} else {
		// Broadcast order update via WebSocket
		orderUpdate := OrderUpdate{
			ID:          order.ID,
			Status:      order.Status,
			TotalAmount: order.TotalAmount,
			Customer:    order.CustomerName,
			UpdatedAt:   order.UpdatedAt,
		}
		BroadcastOrderUpdate(orderUpdate)
	}

	return nil
}

// addStatusHistory adds a status change to the history
func (r *OrderRepository) addStatusHistory(tx *sql.Tx, orderID, status string, notes, changedBy *string) error {
	query := `
		INSERT INTO order_status_history (id, order_id, status, notes, changed_by)
		VALUES ($1, $2, $3, $4, $5)
	`

	historyID := uuid.New().String()
	_, err := tx.Exec(query, historyID, orderID, status, notes, changedBy)
	return err
}

// GetOrdersByStatus retrieves orders by status
func (r *OrderRepository) GetOrdersByStatus(status string, limit, offset int) ([]OrderModel, error) {
	query := `
		SELECT id, order_number, customer_name, customer_email, customer_phone, customer_address,
		       status, total_amount, subtotal, tax_amount, discount_amount, handling_fee, unique_code,
		       payment_method, payment_status, payment_token, payment_url, paid_at,
		       notes, admin_notes, priority, source,
		       created_at, updated_at, completed_at, cancelled_at
		FROM orders
		WHERE status = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Query(query, status, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query orders by status: %w", err)
	}
	defer rows.Close()

	// Initialize with empty slice to ensure it's never nil
	orders := make([]OrderModel, 0)
	for rows.Next() {
		var order OrderModel
		err := rows.Scan(
			&order.ID, &order.OrderNumber, &order.CustomerName, &order.CustomerEmail,
			&order.CustomerPhone, &order.CustomerAddress, &order.Status, &order.TotalAmount,
			&order.Subtotal, &order.TaxAmount, &order.DiscountAmount, &order.HandlingFee,
			&order.UniqueCode, &order.PaymentMethod, &order.PaymentStatus, &order.PaymentToken,
			&order.PaymentURL, &order.PaidAt, &order.Notes, &order.AdminNotes, &order.Priority,
			&order.Source, &order.CreatedAt, &order.UpdatedAt, &order.CompletedAt, &order.CancelledAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan order: %w", err)
		}
		orders = append(orders, order)
	}

	return orders, nil
}

// GetOrderAnalytics returns order analytics data
func (r *OrderRepository) GetOrderAnalytics() (map[string]interface{}, error) {
	analytics := make(map[string]interface{})

	// Total orders
	var totalOrders int
	err := r.db.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)
	if err != nil {
		return nil, fmt.Errorf("failed to get total orders: %w", err)
	}
	analytics["totalOrders"] = totalOrders

	// Total revenue
	var totalRevenue float64
	err = r.db.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed'").Scan(&totalRevenue)
	if err != nil {
		return nil, fmt.Errorf("failed to get total revenue: %w", err)
	}
	analytics["totalRevenue"] = totalRevenue

	// Orders by status
	statusQuery := `
		SELECT status, COUNT(*) 
		FROM orders 
		GROUP BY status
	`
	rows, err := r.db.Query(statusQuery)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders by status: %w", err)
	}
	defer rows.Close()

	ordersByStatus := make(map[string]int)
	for rows.Next() {
		var status string
		var count int
		scanErr := rows.Scan(&status, &count)
		if scanErr != nil {
			return nil, fmt.Errorf("failed to scan status count: %w", scanErr)
		}
		ordersByStatus[status] = count
	}
	analytics["ordersByStatus"] = ordersByStatus

	// Today's orders
	var todayOrders int
	err = r.db.QueryRow("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE").Scan(&todayOrders)
	if err != nil {
		return nil, fmt.Errorf("failed to get today's orders: %w", err)
	}
	analytics["todayOrders"] = todayOrders

	// Today's revenue
	var todayRevenue float64
	err = r.db.QueryRow("SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'").Scan(&todayRevenue)
	if err != nil {
		return nil, fmt.Errorf("failed to get today's revenue: %w", err)
	}
	analytics["todayRevenue"] = todayRevenue

	return analytics, nil
}

// UpdateOrderPaymentStatus updates the payment status of an order
func (r *OrderRepository) UpdateOrderPaymentStatus(id string, paymentStatus string, paymentMethod *string, paidAt *time.Time) error {
	tx, err := r.db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer func() {
		if rollbackErr := tx.Rollback(); rollbackErr != nil {
			// Rollback error is expected when transaction was committed successfully
			// Only log if it's not a "transaction has already been committed or rolled back" error
			if rollbackErr.Error() != "sql: transaction has already been committed or rolled back" {
				LogError("Failed to rollback transaction in UpdateOrderPaymentStatus", logrus.Fields{
					"error": rollbackErr.Error(),
				}, rollbackErr)
			}
		} else {
			// Log successful transaction rollback (for debugging purposes)
			LogDebug("Transaction rollback completed successfully", logrus.Fields{
				"operation": "UpdateOrderPaymentStatus",
			})
		}
	}()

	// Update order payment status
	updateQuery := `
		UPDATE orders 
		SET payment_status = $1, payment_method = $2, paid_at = $3, updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
	`

	_, err = tx.Exec(updateQuery, paymentStatus, paymentMethod, paidAt, id)
	if err != nil {
		return fmt.Errorf("failed to update order payment status: %w", err)
	}

	// Add status history note about payment status change
	notes := "Payment status updated to " + paymentStatus
	if paymentStatus == "paid" {
		notes = "Payment received"
	} else if paymentStatus == "failed" {
		notes = "Payment failed"
	}

	notesPtr := &notes
	var changedBy *string = nil // System change

	// Add status history
	err = r.addStatusHistory(tx, id, "payment_updated", notesPtr, changedBy)
	if err != nil {
		return fmt.Errorf("failed to add status history: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Get order details for broadcasting
	order, getErr := r.GetOrderByID(id)
	if getErr != nil {
		LogError("Failed to get order for broadcasting", logrus.Fields{
			"order_id": id,
			"error":    getErr.Error(),
		}, getErr)
	} else {
		// Broadcast order update via WebSocket
		orderUpdate := OrderUpdate{
			ID:            order.ID,
			Status:        order.Status,
			PaymentStatus: order.PaymentStatus,
			TotalAmount:   order.TotalAmount,
			Customer:      order.CustomerName,
			UpdatedAt:     order.UpdatedAt,
		}
		BroadcastOrderUpdate(orderUpdate)
	}

	return nil
}
