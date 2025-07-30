'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, clearAuthToken } from '@/lib/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  checkAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = (): void => {
    setLoading(true);
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    setLoading(false);
  };

  const logout = (): void => {
    clearAuthToken();
    setIsLoggedIn(false);
  };

  // Periksa status autentikasi saat komponen dimount
  useEffect(() => {
    checkAuth();
  }, []);

  // Periksa token setiap kali ada perubahan pada localStorage
  useEffect(() => {
    const handleStorageChange = (): void => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const value = {
    isLoggedIn,
    loading,
    checkAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}