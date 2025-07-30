package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"github.com/google/uuid"
)

// Product represents a product in the system
type Product struct {
	ID          string          `json:"id"`
	ProductCode string          `json:"productCode"`
	Name        string          `json:"name"`
	Description string          `json:"description"`
	Price       float64         `json:"price"`
	Category    string          `json:"category"`
	ImageURL    string          `json:"imageUrl"`
	Features    json.RawMessage `json:"features"`
	DeliveryTime string         `json:"deliveryTime"`
	Revisions   int             `json:"revisions"`
	Popular     bool            `json:"popular"`
	CreatedAt   time.Time       `json:"createdAt"`
	UpdatedAt   time.Time       `json:"updatedAt"`
}

// ProductRepository handles database operations for products
type ProductRepository struct {
	db *sql.DB
}

// NewProductRepository creates a new product repository
func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// GetAllProducts retrieves all products from the database
func (r *ProductRepository) GetAllProducts() ([]Product, error) {
	query := `
		SELECT id, product_code, name, description, price, category, image_url, 
		       features, delivery_time, revisions, popular, created_at, updated_at 
		FROM products
		ORDER BY name ASC
	`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var features []byte

		scanErr := rows.Scan(
			&p.ID, &p.ProductCode, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
			&features, &p.DeliveryTime, &p.Revisions, &p.Popular, &p.CreatedAt, &p.UpdatedAt,
		)
		if scanErr != nil {
			return nil, scanErr
		}

		p.Features = features
		products = append(products, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// GetProductByCode retrieves a product by its product code
func (r *ProductRepository) GetProductByCode(productCode string) (Product, error) {
	query := `
		SELECT id, product_code, name, description, price, category, image_url, 
		       features, delivery_time, revisions, popular, created_at, updated_at 
		FROM products 
		WHERE product_code = $1
	`

	var p Product
	var features []byte

	err := r.db.QueryRow(query, productCode).Scan(
		&p.ID, &p.ProductCode, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
		&features, &p.DeliveryTime, &p.Revisions, &p.Popular, &p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Product{}, errors.New("product not found")
		}
		return Product{}, err
	}

	p.Features = features
	return p, nil
}

// GetProductByID retrieves a product by its ID
func (r *ProductRepository) GetProductByID(id string) (Product, error) {
	query := `
		SELECT id, product_code, name, description, price, category, image_url, 
		       features, delivery_time, revisions, popular, created_at, updated_at 
		FROM products 
		WHERE id = $1
	`

	var p Product
	var features []byte

	err := r.db.QueryRow(query, id).Scan(
		&p.ID, &p.ProductCode, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
		&features, &p.DeliveryTime, &p.Revisions, &p.Popular, &p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Product{}, errors.New("product not found")
		}
		return Product{}, err
	}

	p.Features = features
	return p, nil
}

// GetProductsByCategory retrieves products by category
func (r *ProductRepository) GetProductsByCategory(category string) ([]Product, error) {
	query := `
		SELECT id, product_code, name, description, price, category, image_url, 
		       features, delivery_time, revisions, popular, created_at, updated_at 
		FROM products 
		WHERE category = $1
		ORDER BY name ASC
	`

	rows, err := r.db.Query(query, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []Product
	for rows.Next() {
		var p Product
		var features []byte

		scanErr := rows.Scan(
			&p.ID, &p.ProductCode, &p.Name, &p.Description, &p.Price, &p.Category, &p.ImageURL,
			&features, &p.DeliveryTime, &p.Revisions, &p.Popular, &p.CreatedAt, &p.UpdatedAt,
		)
		if scanErr != nil {
			return nil, scanErr
		}

		p.Features = features
		products = append(products, p)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// CreateProduct creates a new product in the database
func (r *ProductRepository) CreateProduct(product Product) (Product, error) {
	query := `
		INSERT INTO products (id, product_code, name, description, price, category, image_url, 
		                     features, delivery_time, revisions, popular, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id
	`

	// Generate a new UUID if not provided
	if product.ID == "" {
		product.ID = uuid.New().String()
	}

	// Set timestamps
	now := time.Now()
	product.CreatedAt = now
	product.UpdatedAt = now

	// Execute the query
	err := r.db.QueryRow(
		query,
		product.ID, product.ProductCode, product.Name, product.Description, product.Price, product.Category,
		product.ImageURL, product.Features, product.DeliveryTime, product.Revisions,
		product.Popular, product.CreatedAt, product.UpdatedAt,
	).Scan(&product.ID)

	if err != nil {
		return Product{}, err
	}

	return product, nil
}

// UpdateProduct updates an existing product
func (r *ProductRepository) UpdateProduct(product Product) (Product, error) {
	query := `
		UPDATE products
		SET product_code = $2, name = $3, description = $4, price = $5, category = $6, image_url = $7,
		    features = $8, delivery_time = $9, revisions = $10, popular = $11, updated_at = $12
		WHERE id = $1
		RETURNING id
	`

	// Update timestamp
	product.UpdatedAt = time.Now()

	// Execute the query
	var id string
	err := r.db.QueryRow(
		query,
		product.ID, product.ProductCode, product.Name, product.Description, product.Price, product.Category,
		product.ImageURL, product.Features, product.DeliveryTime, product.Revisions,
		product.Popular, product.UpdatedAt,
	).Scan(&id)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Product{}, errors.New("product not found")
		}
		return Product{}, err
	}

	return product, nil
}

// DeleteProduct deletes a product by its ID
func (r *ProductRepository) DeleteProduct(id string) error {
	query := "DELETE FROM products WHERE id = $1"

	result, err := r.db.Exec(query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("product not found")
	}

	return nil
}