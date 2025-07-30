'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  authenticateAdmin, 
  setAuthToken, 
  AdminCredentials, 
  AuthResult 
} from '@/lib/auth';
import { useAuthContext } from '@/providers/auth-provider';

/**
 * Interface untuk hasil hook useAuth
 */
interface UseAuthResult {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: AdminCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

/**
 * Hook untuk mengelola autentikasi admin
 * @returns Objek dengan status login, fungsi login, dan fungsi logout
 */
export function useAuth(): UseAuthResult {
  const router = useRouter();
  const { isLoggedIn, loading, checkAuth, logout: contextLogout } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  /**
   * Fungsi untuk login admin
   * @param credentials - Kredensial admin
   * @returns Promise dengan hasil autentikasi
   */
  const login = async (credentials: AdminCredentials): Promise<AuthResult> => {
    setError(null);

    try {
      const result = await authenticateAdmin(credentials);
      
      if (result.success && result.token) {
        setAuthToken(result.token);
        checkAuth(); // Perbarui status autentikasi
      } else {
        setError(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat login';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  /**
   * Fungsi untuk logout admin
   */
  const logout = async (): Promise<void> => {
    try {
      contextLogout();
      router.push('/admin/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat logout';
      setError(errorMessage);
      console.error('Logout error:', err);
    }
  };

  return {
    isLoggedIn,
    loading,
    error,
    login,
    logout
  };
}