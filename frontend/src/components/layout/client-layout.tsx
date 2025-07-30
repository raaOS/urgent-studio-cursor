'use client';

import { useState, useEffect } from 'react';
import { MobileNavigation, ScrollToTopButton } from '@/components/ui/mobile-enhanced';

interface ClientLayoutProps {
  children: React.ReactNode;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

function parseCartFromStorage(): CartItem[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const cartFromSession = sessionStorage.getItem('cart');
    if (!cartFromSession) return [];
    
    const parsedData = JSON.parse(cartFromSession);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('Failed to parse cart from session storage:', error);
    return [];
  }
}

export function ClientLayout({ children }: ClientLayoutProps): JSX.Element {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Function to update cart item count
    const updateCartCount = (): void => {
      const cart = parseCartFromStorage();
      const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
      setCartItemCount(totalQuantity);
    };

    // Update count when component mounts
    updateCartCount();

    // Update count when cart changes
    const handleCartUpdate = (): void => {
      updateCartCount();
    };

    const handleStorageChange = (): void => {
      updateCartCount();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", handleStorageChange);

    return (): void => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <>
      <MobileNavigation 
        cartItemCount={cartItemCount}
        onCartClick={() => window.location.href = '/cart'}
        onSearchClick={() => window.location.href = '/search'}
      />
      <main id="main-content">
        {children}
      </main>
      <ScrollToTopButton />
    </>
  );
}