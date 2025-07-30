'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart, Search, Home, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  cartItemCount?: number;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ cartItemCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground">
        <div className="flex items-center justify-between p-4">
          {/* Logo */}
          <Link href="/" className="font-bold text-lg" onClick={closeMenu}>
            Urgent Studio
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <Link href="/products" onClick={closeMenu}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b-2 border-foreground shadow-neo">
            <nav className="p-4 space-y-4">
              <Link
                href="/"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={closeMenu}
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Beranda</span>
              </Link>
              
              <Link
                href="/products"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary transition-colors"
                onClick={closeMenu}
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Katalog Produk</span>
              </Link>

              {/* Order Tracking */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Lacak Pesanan
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan ID pesanan..."
                    className="flex-1 px-3 py-2 text-sm border-2 border-foreground rounded-md"
                  />
                  <Button size="sm" className="px-4">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="pt-4 border-t border-border">
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  Hubungi Kami
                </h3>
                <p className="text-sm">WhatsApp: +62 812-3456-7890</p>
                <p className="text-sm">Email: hello@urgentstudio.com</p>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer untuk fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
};

export default MobileNavigation;