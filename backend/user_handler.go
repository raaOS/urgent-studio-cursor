package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID           string    `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	FullName     string    `json:"fullName" db:"full_name"`
	Role         string    `json:"role" db:"role"`
	IsActive     bool      `json:"isActive" db:"is_active"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

// CreateUserRequest represents the request body for creating a user
type CreateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"fullName" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// UpdateUserRequest represents the request body for updating a user
type UpdateUserRequest struct {
	Email    string `json:"email" binding:"required,email"`
	FullName string `json:"fullName" binding:"required"`
	Role     string `json:"role" binding:"required"`
	IsActive *bool  `json:"isActive"`
}

// ChangePasswordRequest represents the request body for changing password
type ChangePasswordRequest struct {
	Password string `json:"password" binding:"required,min=6"`
}

// UserRepository handles database operations for users
type UserRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new user repository
func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// GetAllUsers retrieves all users with pagination and search
func (r *UserRepository) GetAllUsers(page, limit int, search, role string) ([]User, int, error) {
	offset := (page - 1) * limit
	
	// Build WHERE clause
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if search != "" {
		whereClause += fmt.Sprintf(" AND (full_name ILIKE $%d OR email ILIKE $%d)", argIndex, argIndex+1)
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern)
		argIndex += 2
	}

	if role != "" {
		whereClause += fmt.Sprintf(" AND role = $%d", argIndex)
		args = append(args, role)
		argIndex++
	}

	// Get total count
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM users %s", whereClause)
	var total int
	err := r.db.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count users: %w", err)
	}

	// Get users with pagination
	query := fmt.Sprintf(`
		SELECT id, email, full_name, role, 
		       COALESCE(is_active, true) as is_active, 
		       created_at, updated_at 
		FROM users %s 
		ORDER BY created_at DESC 
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)
	
	args = append(args, limit, offset)

	// Debug: log the actual query and args
	fmt.Printf("DEBUG: Executing query: %s\n", query)
	fmt.Printf("DEBUG: Query args: %v\n", args)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID, &user.Email, &user.FullName, &user.Role,
			&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, user)
	}

	return users, total, nil
}

// GetUserByID retrieves a user by ID
func (r *UserRepository) GetUserByID(id string) (*User, error) {
	query := `
		SELECT id, email, full_name, role, 
		       COALESCE(is_active, true) as is_active, 
		       created_at, updated_at 
		FROM users 
		WHERE id = $1
	`

	var user User
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.FullName, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// CreateUser creates a new user
func (r *UserRepository) CreateUser(req CreateUserRequest) (*User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate UUID
	userID := uuid.New().String()

	// Insert user
	query := `
		INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		RETURNING id, email, full_name, role, 
		          COALESCE(is_active, true) as is_active, 
		          created_at, updated_at
	`

	var user User
	err = r.db.QueryRow(query, userID, req.Email, string(hashedPassword), req.FullName, req.Role).Scan(
		&user.ID, &user.Email, &user.FullName, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, fmt.Errorf("email already exists")
		}
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return &user, nil
}

// UpdateUser updates an existing user
func (r *UserRepository) UpdateUser(id string, req UpdateUserRequest) (*User, error) {
	// Check if user exists
	_, err := r.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	// Build update query
	setParts := []string{"updated_at = CURRENT_TIMESTAMP"}
	args := []interface{}{}
	argIndex := 1

	if req.Email != "" {
		setParts = append(setParts, fmt.Sprintf("email = $%d", argIndex))
		args = append(args, req.Email)
		argIndex++
	}

	if req.FullName != "" {
		setParts = append(setParts, fmt.Sprintf("full_name = $%d", argIndex))
		args = append(args, req.FullName)
		argIndex++
	}

	if req.Role != "" {
		setParts = append(setParts, fmt.Sprintf("role = $%d", argIndex))
		args = append(args, req.Role)
		argIndex++
	}

	if req.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *req.IsActive)
		argIndex++
	}

	// Add ID to args
	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE users 
		SET %s 
		WHERE id = $%d
		RETURNING id, email, full_name, role, 
		          COALESCE(is_active, true) as is_active, 
		          created_at, updated_at
	`, strings.Join(setParts, ", "), argIndex)

	var user User
	err = r.db.QueryRow(query, args...).Scan(
		&user.ID, &user.Email, &user.FullName, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, fmt.Errorf("email already exists")
		}
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return &user, nil
}

// DeleteUser deletes a user
func (r *UserRepository) DeleteUser(id string) error {
	// Check if user exists
	_, err := r.GetUserByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM users WHERE id = $1"
	result, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("user not found")
	}

	return nil
}

// ToggleUserStatus toggles user active status
func (r *UserRepository) ToggleUserStatus(id string) (*User, error) {
	// Get current user
	user, err := r.GetUserByID(id)
	if err != nil {
		return nil, err
	}

	// Toggle status
	newStatus := !user.IsActive

	query := `
		UPDATE users 
		SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
		WHERE id = $2
		RETURNING id, email, full_name, role, 
		          COALESCE(is_active, true) as is_active, 
		          created_at, updated_at
	`

	var updatedUser User
	err = r.db.QueryRow(query, newStatus, id).Scan(
		&updatedUser.ID, &updatedUser.Email, &updatedUser.FullName, &updatedUser.Role,
		&updatedUser.IsActive, &updatedUser.CreatedAt, &updatedUser.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to toggle user status: %w", err)
	}

	return &updatedUser, nil
}

// ChangeUserPassword changes user password
func (r *UserRepository) ChangeUserPassword(id string, newPassword string) error {
	// Check if user exists
	_, err := r.GetUserByID(id)
	if err != nil {
		return err
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	query := "UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2"
	_, err = r.db.Exec(query, string(hashedPassword), id)
	if err != nil {
		return fmt.Errorf("failed to change password: %w", err)
	}

	return nil
}

// UserHandler handles user-related HTTP requests
type UserHandler struct {
	repo *UserRepository
}

// NewUserHandler creates a new user handler
func NewUserHandler(repo *UserRepository) *UserHandler {
	return &UserHandler{repo: repo}
}

// GetUsers handles GET /api/users
func (h *UserHandler) GetUsers(c *gin.Context) {
	fmt.Printf("DEBUG: GetUsers called\n")
	
	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	search := c.Query("search")
	role := c.Query("role")

	fmt.Printf("DEBUG: Parameters - page: %d, limit: %d, search: %s, role: %s\n", page, limit, search, role)

	// Validate pagination
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	fmt.Printf("DEBUG: Calling GetAllUsers...\n")
	users, total, err := h.repo.GetAllUsers(page, limit, search, role)
	if err != nil {
		fmt.Printf("DEBUG: Error from GetAllUsers: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get users",
			"error":   err.Error(),
		})
		return
	}

	fmt.Printf("DEBUG: GetAllUsers success - users: %d, total: %d\n", len(users), total)

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    users,
		"pagination": gin.H{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": totalPages,
		},
	})
}

// GetUser handles GET /api/users/:id
func (h *UserHandler) GetUser(c *gin.Context) {
	id := c.Param("id")

	user, err := h.repo.GetUserByID(id)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

// CreateUser handles POST /api/users
func (h *UserHandler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	user, err := h.repo.CreateUser(req)
	if err != nil {
		if err.Error() == "email already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    user,
		"message": "User created successfully",
	})
}

// UpdateUser handles PUT /api/users/:id
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	user, err := h.repo.UpdateUser(id, req)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		if err.Error() == "email already exists" {
			c.JSON(http.StatusConflict, gin.H{
				"success": false,
				"message": "Email already exists",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to update user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
		"message": "User updated successfully",
	})
}

// DeleteUser handles DELETE /api/users/:id
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	err := h.repo.DeleteUser(id)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete user",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
	})
}

// ToggleUserStatus handles PATCH /api/users/:id/toggle-status
func (h *UserHandler) ToggleUserStatus(c *gin.Context) {
	id := c.Param("id")

	user, err := h.repo.ToggleUserStatus(id)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to toggle user status",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
		"message": "User status updated successfully",
	})
}

// ChangeUserPassword handles PATCH /api/users/:id/change-password
func (h *UserHandler) ChangeUserPassword(c *gin.Context) {
	id := c.Param("id")

	var req ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		})
		return
	}

	err := h.repo.ChangeUserPassword(id, req.Password)
	if err != nil {
		if err.Error() == "user not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to change password",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password changed successfully",
	})
}