'use client';

import { ShoppingCart, Truck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Interfaces
interface CartItem {
  id: string;
  name: string;
  tier: string;
  price: number;
  instanceId?: string;
}

// Constants
const STORAGE_KEY = 'globalCart' as const;

// Helper functions
function isValidCartData(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) {
    return false;
  }
  
  return data.every((item: unknown): item is CartItem => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    
    const cartItem = item as Record<string, unknown>;
    return (
      typeof cartItem.id === 'string' &&
      typeof cartItem.name === 'string' &&
      typeof cartItem.tier === 'string' &&
      typeof cartItem.price === 'number'
    );
  });
}

function parseCartFromStorage(): CartItem[] {
  try {
    const cartFromSession = sessionStorage.getItem(STORAGE_KEY);
    if (cartFromSession === null || cartFromSession === undefined || cartFromSession === '') {
      return [];
    }
    
    const parsedData: unknown = JSON.parse(cartFromSession);
    return isValidCartData(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('Failed to parse cart from session storage:', error);
    return [];
  }
}

// Components
function CartButton(): JSX.Element {
  const [cartCount, setCartCount] = useState<number>(0);
  
  useEffect((): (() => void) => {
    // Function to update cart item count
    const updateCartCount = (): void => {
      const cart = parseCartFromStorage();
      setCartCount(cart.length);
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
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    return (): void => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  if (cartCount === 0) {
    return (
      <Button 
        asChild 
        variant="ghost" 
        className="font-bold text-white hover:bg-white/10 hover:text-white"
      >
        <Link href="/brief" className="w-full overflow-hidden text-ellipsis">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Keranjang
        </Link>
      </Button>
    );
  }
  
  return (
    <Button 
      asChild 
      variant="ghost" 
      className="font-bold text-white hover:bg-white/10 hover:text-white relative"
    >
      <Link href="/brief" className="w-full overflow-hidden text-ellipsis">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Keranjang
        <Badge className="ml-2 bg-[#ff7a2f] hover:bg-[#ff7a2f] text-white">
          {cartCount}
        </Badge>
      </Link>
    </Button>
  );
}

export function Header(): JSX.Element {
  return (
    <header className="absolute top-0 z-40 w-full bg-[#ff7a2f] text-primary-foreground">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-tighter text-white" 
          style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}
        >
          Urgent <span className="font-light">Studio</span>
        </Link>
        <nav className="flex items-center space-x-2">
          <CartButton />
          <Button 
            asChild 
            variant="ghost" 
            className="font-bold text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="/track" className="w-full overflow-hidden text-ellipsis">
              <Truck className="mr-2 h-5 w-5" />
              Lacak Pesanan
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
