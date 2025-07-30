package main

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// JWT Secret - in production, this should be from environment variable
var jwtSecret = []byte("urgent-studio-jwt-secret-2025") // TODO: Move to .env

// AdminUser represents an admin user
type AdminUser struct {
	ID           string     `json:"id" db:"id"`
	Username     string     `json:"username" db:"username"`
	Email        string     `json:"email" db:"email"`
	PasswordHash string     `json:"-" db:"password_hash"`
	FullName     string     `json:"fullName" db:"full_name"`
	Role         string     `json:"role" db:"role"`
	IsActive     bool       `json:"isActive" db:"is_active"`
	LastLogin    *time.Time `json:"lastLogin" db:"last_login"`
	CreatedAt    time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time  `json:"updatedAt" db:"updated_at"`
}

// AdminToken represents a JWT token record
type AdminToken struct {
	ID          string    `json:"id" db:"id"`
	AdminUserID string    `json:"adminUserId" db:"admin_user_id"`
	TokenHash   string    `json:"-" db:"token_hash"`
	ExpiresAt   time.Time `json:"expiresAt" db:"expires_at"`
	IsRevoked   bool      `json:"isRevoked" db:"is_revoked"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}

// JWTClaims represents JWT token claims
type JWTClaims struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	TokenID  string `json:"token_id"`
	jwt.RegisteredClaims
}

// AuthService handles authentication operations
type AuthService struct {
	db *sql.DB
}

// NewAuthService creates a new auth service
func NewAuthService(db *sql.DB) *AuthService {
	return &AuthService{db: db}
}

// HashPassword hashes a password using bcrypt
func (a *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPassword verifies a password against its hash
func (a *AuthService) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// CreateAdminUser creates a new admin user
func (a *AuthService) CreateAdminUser(username, email, password, fullName, role string) (*AdminUser, error) {
	hashedPassword, err := a.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	query := `
		INSERT INTO admin_users (username, email, password_hash, full_name, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, username, email, full_name, role, is_active, created_at, updated_at
	`

	var user AdminUser
	err = a.db.QueryRow(query, username, email, hashedPassword, fullName, role).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, &user.Role,
		&user.IsActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}

	return &user, nil
}

// GetAdminUserByUsername retrieves an admin user by username
func (a *AuthService) GetAdminUserByUsername(username string) (*AdminUser, error) {
	query := `
		SELECT id, username, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at
		FROM admin_users
		WHERE username = $1 AND is_active = true
	`

	var user AdminUser
	err := a.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.FullName,
		&user.Role, &user.IsActive, &user.LastLogin, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get admin user: %w", err)
	}

	return &user, nil
}

// UpdateLastLogin updates the last login time for a user
func (a *AuthService) UpdateLastLogin(userID string) error {
	query := `UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := a.db.Exec(query, userID)
	return err
}

// Authenticate authenticates a user and returns a JWT token
func (a *AuthService) Authenticate(username, password string) (string, error) {
	fmt.Printf("DEBUG: Authenticating user: %s\n", username)

	// Get user by username
	user, err := a.GetAdminUserByUsername(username)
	if err != nil {
		fmt.Printf("DEBUG: Failed to get user: %v\n", err)
		return "", fmt.Errorf("invalid credentials")
	}

	fmt.Printf("DEBUG: Found user: %s, hash: %s\n", user.Username, user.PasswordHash)

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		fmt.Printf("DEBUG: Password check failed: %v\n", err)
		return "", fmt.Errorf("invalid credentials")
	}

	fmt.Printf("DEBUG: Password check passed\n")

	// Update last login
	err = a.UpdateLastLogin(user.ID)
	if err != nil {
		fmt.Printf("DEBUG: Failed to update last login: %v\n", err)
		// Log error but don't fail authentication
		// In production, you might want to log this properly
	}

	// Generate token
	token, err := a.GenerateToken(user)
	if err != nil {
		fmt.Printf("DEBUG: Failed to generate token: %v\n", err)
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	fmt.Printf("DEBUG: Token generated successfully\n")

	return token, nil
}

// GenerateToken generates a JWT token for an admin user
func (a *AuthService) GenerateToken(user *AdminUser) (string, error) {
	// Generate a random UUID for token ID
	tokenID, err := generateUUID()
	if err != nil {
		return "", fmt.Errorf("failed to generate token ID: %w", err)
	}

	// Set token expiration (24 hours)
	expiresAt := time.Now().Add(24 * time.Hour)

	// Create JWT claims
	claims := JWTClaims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		TokenID:  tokenID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "urgent-studio",
			Subject:   user.ID,
		},
	}

	// Create token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	// Store token hash in database
	tokenHash := hashToken(tokenString)
	err = a.storeToken(user.ID, tokenID, tokenHash, expiresAt)
	if err != nil {
		return "", fmt.Errorf("failed to store token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (a *AuthService) ValidateToken(tokenString string) (*JWTClaims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Check if token is valid
	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	// Extract claims
	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, fmt.Errorf("invalid token claims")
	}

	// Check if token exists in database and is not revoked
	tokenHash := hashToken(tokenString)
	isValid, err := a.isTokenValid(claims.TokenID, tokenHash)
	if err != nil {
		return nil, fmt.Errorf("failed to validate token in database: %w", err)
	}

	if !isValid {
		return nil, fmt.Errorf("token is revoked or not found")
	}

	return claims, nil
}

// RevokeToken revokes a token
func (a *AuthService) RevokeToken(tokenID string) error {
	query := `UPDATE admin_tokens SET is_revoked = true WHERE id = $1`
	_, err := a.db.Exec(query, tokenID)
	return err
}

// RevokeAllUserTokens revokes all tokens for a user
func (a *AuthService) RevokeAllUserTokens(userID string) error {
	query := `UPDATE admin_tokens SET is_revoked = true WHERE admin_user_id = $1`
	_, err := a.db.Exec(query, userID)
	return err
}

// CleanupExpiredTokens removes expired tokens from database
func (a *AuthService) CleanupExpiredTokens() error {
	query := `DELETE FROM admin_tokens WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true`
	_, err := a.db.Exec(query)
	return err
}

// storeToken stores a token hash in the database
func (a *AuthService) storeToken(userID, tokenID, tokenHash string, expiresAt time.Time) error {
	query := `
		INSERT INTO admin_tokens (id, admin_user_id, token_hash, expires_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err := a.db.Exec(query, tokenID, userID, tokenHash, expiresAt)
	return err
}

// isTokenValid checks if a token is valid in the database
func (a *AuthService) isTokenValid(tokenID, tokenHash string) (bool, error) {
	query := `
		SELECT COUNT(*)
		FROM admin_tokens
		WHERE id = $1 AND token_hash = $2 AND expires_at > CURRENT_TIMESTAMP AND is_revoked = false
	`

	var count int
	err := a.db.QueryRow(query, tokenID, tokenHash).Scan(&count)
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// hashToken creates a SHA256 hash of the token
func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}



// generateUUID generates a random UUID string
func generateUUID() (string, error) {
	bytes := make([]byte, 16)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}

	// Set version (4) and variant bits
	bytes[6] = (bytes[6] & 0x0f) | 0x40 // Version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // Variant 10

	return fmt.Sprintf("%x-%x-%x-%x-%x", bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:16]), nil
}

// AuthMiddleware is a middleware function to validate JWT tokens
func AuthMiddleware(authService *AuthService) func(c *gin.Context) {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(401, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			c.JSON(401, gin.H{"error": "Invalid authorization header format"})
			c.Abort()
			return
		}

		tokenString := authHeader[7:]

		// Validate token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(401, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Set("role", claims.Role)
		c.Set("token_id", claims.TokenID)

		c.Next()
	}
}
