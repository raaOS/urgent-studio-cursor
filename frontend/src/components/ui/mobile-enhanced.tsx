'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ShoppingCart, 
  Search, 
  User, 
  Heart, 
  Package, 
  Phone, 
  Mail,
  MapPin,
  ChevronRight,
  Home,
  Grid3X3,
  Star,
  SortAsc,
  ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

// Enhanced Mobile Navigation
interface MobileNavigationProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  cartItemCount = 0,
  onCartClick,
  onSearchClick,
  className
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen(prev => !prev);
    onSearchClick?.();
  }, [onSearchClick]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (isMenuOpen && !(event.target as Element).closest('.mobile-menu')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const menuItems = [
    { icon: Home, label: 'Beranda', href: '/' },
    { icon: Grid3X3, label: 'Katalog Produk', href: '/products' },
    { icon: Package, label: 'Lacak Pesanan', href: '/track-order' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: User, label: 'Profil', href: '/profile' },
  ];

  const contactItems = [
    { icon: Phone, label: '+62 812-3456-7890', href: 'tel:+6281234567890' },
    { icon: Mail, label: 'hello@urgentstudio.com', href: 'mailto:hello@urgentstudio.com' },
    { icon: MapPin, label: 'Jakarta, Indonesia', href: '#' },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className={cn(
        'lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b-2 border-foreground',
        'shadow-[0_4px_0px_0px_rgba(0,0,0,1)]',
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMenu}
            className="p-2 hover:bg-muted focus:outline-none focus:ring-1 focus:ring-gray-500"
            aria-label="Buka menu"
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Logo */}
          <motion.div 
            className="font-bold text-xl"
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="text-foreground">
              Urgent Studio
            </Link>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSearch}
              className="p-2 hover:bg-muted"
              aria-label="Cari produk"
            >
              <Search className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="p-2 hover:bg-muted relative"
              aria-label={`Keranjang belanja (${cartItemCount} item)`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu lg:hidden fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-background border-r-2 border-foreground shadow-neo"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
              <h2 className="font-bold text-lg">Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="p-2 hover:bg-muted"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {menuItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-foreground" />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Contact Section */}
              <div className="border-t-2 border-foreground p-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                  Hubungi Kami
                </h3>
                <div className="space-y-2">
                  {contactItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (menuItems.length + index) * 0.1 }}
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{item.label}</span>
                    </motion.a>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-50 bg-background"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="p-4 border-b-2 border-foreground">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  className="flex-1 p-3 border-2 border-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
                <Button size="sm" className="px-4">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Search Results */}
            <div className="p-4">
              <p className="text-muted-foreground text-center py-8">
                Mulai mengetik untuk mencari produk...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Swipeable Product Card
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className
}) => {
  const [dragX, setDragX] = useState<number>(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold && onSwipeRight) {
      onSwipeRight();
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      onSwipeLeft();
    }
    
    setDragX(0);
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <div ref={constraintsRef} className="relative overflow-hidden">
      <motion.div
        className={cn('cursor-grab active:cursor-grabbing', className)}
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        style={{ x: dragX }}
      >
        {children}
      </motion.div>

      {/* Swipe Indicators */}
      {Math.abs(dragX) > 50 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className={cn(
              'px-4 py-2 rounded-full text-white font-bold',
              dragX > 0 ? 'bg-green-500' : 'bg-red-500'
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {dragX > 0 ? '❤️ Suka' : '🗑️ Hapus'}
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Mobile Filter Panel
interface MobileFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    categories: string[];
    priceRange: [number, number];
    rating: number;
    sortBy: string;
  };
  onFiltersChange: (filters: {
    categories: string[];
    priceRange: [number, number];
    rating: number;
    sortBy: string;
  }) => void;
}

export const MobileFilterPanel: React.FC<MobileFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange
}) => {
  const categories = ['Semua', 'Elektronik', 'Fashion', 'Rumah & Taman', 'Olahraga', 'Buku'];
  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'popular', label: 'Terpopuler' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t-2 border-foreground rounded-t-xl max-h-[80vh] overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-foreground">
              <h2 className="font-bold text-lg">Filter & Urutkan</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Kategori
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={filters.categories.includes(category) ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        const newCategories = filters.categories.includes(category)
                          ? filters.categories.filter(c => c !== category)
                          : [...filters.categories, category];
                        onFiltersChange({ ...filters, categories: newCategories });
                      }}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold mb-3">Rentang Harga</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={filters.priceRange[1]}
                    onChange={(e) => {
                      onFiltersChange({
                        ...filters,
                        priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                      });
                    }}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Rp 0</span>
                    <span>Rp {filters.priceRange[1].toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Rating Minimum
                </h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={filters.rating >= rating ? "default" : "outline"}
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, rating })}
                      className="flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Urutkan Berdasarkan
                </h3>
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={filters.sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onFiltersChange({ ...filters, sortBy: option.value })}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-foreground p-4 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Reset
              </Button>
              <Button className="flex-1" onClick={onClose}>
                Terapkan Filter
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Scroll to Top Button
export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          className="fixed bottom-4 right-20 z-40 p-3 bg-primary text-primary-foreground rounded-full shadow-neo border-2 border-foreground hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Touch Gestures Hook
interface TouchGesture {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  threshold?: number;
}

export const useTouchGestures = (gestures: TouchGesture): React.RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);
  const { threshold = 50 } = gestures;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;
    let startDistance = 0;

    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 1 && e.touches[0]) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        startDistance = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (e.changedTouches.length === 1 && e.changedTouches[0]) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > threshold && gestures.onSwipeRight) {
            gestures.onSwipeRight();
          } else if (deltaX < -threshold && gestures.onSwipeLeft) {
            gestures.onSwipeLeft();
          }
        } else {
          if (deltaY > threshold && gestures.onSwipeDown) {
            gestures.onSwipeDown();
          } else if (deltaY < -threshold && gestures.onSwipeUp) {
            gestures.onSwipeUp();
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 2 && e.touches[0] && e.touches[1] && gestures.onPinch) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const scale = distance / startDistance;
        gestures.onPinch(scale);
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('touchmove', handleTouchMove);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gestures, threshold]);

  return ref;
};