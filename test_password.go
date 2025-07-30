package main

import (
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

	// Test different passwords
	passwords := []string{"password", "admin", "admin123", "secret"}

	for _, pwd := range passwords {
		err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pwd))
		if err == nil {
			fmt.Printf("Password '%s' matches!\n", pwd)
		} else {
			fmt.Printf("Password '%s' does not match\n", pwd)
		}
	}
}
