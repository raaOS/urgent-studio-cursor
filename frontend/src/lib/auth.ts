/**
 * Authentication utilities for admin access
 */

/**
 * Interface for admin credentials
 */
export interface AdminCredentials {
  username: string;
  password: string;
}

/**
 * Interface for authentication result
 */
export interface AuthResult {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * Interface for admin user
 */
export interface AdminUser {
  username: string;
  role: string;
  permissions: string[];
}

/**
 * Authenticates admin user
 * @param credentials - Admin credentials
 * @returns Promise with authentication result
 */
export async function authenticateAdmin(credentials: AdminCredentials): Promise<AuthResult> {
  try {
    const response = await fetch('http://localhost:8080/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return {
        success: false,
        message: 'Authentication failed',
      };
    }

    // Parse the response to get the token
    const data = await response.json();
    
    if (!data.success || !data.token) {
      return {
        success: false,
        message: data.message || 'Authentication failed',
      };
    }
    
    // Store the token
    const token = data.token;
    setAuthToken(token);
    setCookie('adminAuthToken', token, 7); // Set cookie for 7 days
    
    return {
      success: true,
      message: data.message || 'Authentication successful',
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication service unavailable',
    };
  }
}

/**
 * Checks if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

/**
 * Gets authentication token from storage
 * @returns Authentication token or null if not found
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Try to get token from localStorage first
  const token = localStorage.getItem('adminAuthToken');
  if (token) {
    return token;
  }
  
  // If not in localStorage, try to get from cookie
  return getCookie('adminAuthToken');
}

/**
 * Sets authentication token in storage
 * @param token - Authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('adminAuthToken', token);
}

/**
 * Clears authentication token from storage
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('adminAuthToken');
  deleteCookie('adminAuthToken');
}

/**
 * Logs out admin user
 */
export async function logoutAdmin(): Promise<void> {
  try {
    // Call logout endpoint
    const response = await fetch('http://localhost:8080/admin/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      console.error('Logout failed:', await response.text());
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear the token locally, even if the server request fails
    clearAuthToken();
  }
}

/**
 * Sets a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until cookie expires
 */
export function setCookie(name: string, value: string, days: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
}

/**
 * Gets a cookie value
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue; // Skip if cookie element is undefined
    
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return null;
}

/**
 * Deletes a cookie
 * @param name - Cookie name
 */
export function deleteCookie(name: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
}