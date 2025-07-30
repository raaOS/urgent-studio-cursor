"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";

// Interfaces
interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Constants
const STORAGE_KEY = "cart" as const;

// Helper functions
function isValidCartData(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item: unknown): item is CartItem => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const cartItem = item as Record<string, unknown>;
    return (
      typeof cartItem.id === "string" &&
      typeof cartItem.productId === "string" &&
      typeof cartItem.name === "string" &&
      typeof cartItem.price === "number" &&
      typeof cartItem.quantity === "number" &&
      typeof cartItem.category === "string"
    );
  });
}

function parseCartFromStorage(): CartItem[] {
  try {
    const cartFromSession = sessionStorage.getItem(STORAGE_KEY);
    if (
      cartFromSession === null ||
      cartFromSession === undefined ||
      cartFromSession === ""
    ) {
      return [];
    }

    const parsedData: unknown = JSON.parse(cartFromSession);
    return isValidCartData(parsedData) ? parsedData : [];
  } catch (error) {
    console.error("Failed to parse cart from session storage:", error);
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
      const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalQuantity);
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

  if (cartCount === 0) {
    return (
    <Link href="/cart">
      <div className="relative p-2 sm:p-3 bg-[#ff7a2f] border-2 border-black rounded-md transition-all duration-150 cursor-pointer hover:bg-[#ff6b1f]">
        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
      </div>
    </Link>
  );
  }

  return (
    <Link href="/cart">
      <div className="relative p-2 sm:p-3 bg-[#ff7a2f] border-2 border-black rounded-md transition-all duration-150 cursor-pointer hover:bg-[#ff6b1f]">
        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
        <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 hover:bg-red-500 text-white text-xs min-w-[18px] sm:min-w-[20px] h-4 sm:h-5 flex items-center justify-center border border-black">
          {cartCount}
        </Badge>
      </div>
    </Link>
  );
}

export function Header(): JSX.Element {
  return (
    <header className="w-full bg-[#ff7a2f] text-white border-b-2 border-black">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg sm:text-2xl font-bold tracking-tighter"
        >
          Urgent <span className="font-light">Studio</span>
        </Link>
        <nav className="flex items-center space-x-2">
          <CartButton />
        </nav>
      </div>
    </header>
  );
}
