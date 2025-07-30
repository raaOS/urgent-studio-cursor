'use client';

import { ShoppingCart, Plus, Minus, Filter, X } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

// Enhanced UI Components
import { Header } from '@/components/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Container, Typography, ConsistentCard } from '@/components/ui/visual-consistency';
import LoadingSkeleton from '@/components/ui/loading';
import { MobileFilterPanel } from '@/components/ui/mobile-enhanced';
import { StaggerContainer } from '@/components/ui/micro-interactions';
import { LazyImage } from '@/components/ui/performance';
import products from '@/lib/products';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  features: string[];
  deliveryTime: string;
  revisions: number;
  popular: boolean;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Konstanta
const SORT_OPTIONS = [
  { value: 'name', label: 'Nama A-Z' },
  { value: 'price-low', label: 'Harga Terendah' },
  { value: 'price-high', label: 'Harga Tertinggi' },
  { value: 'popular', label: 'Paling Populer' }
];

export default function ProductsPage(): JSX.Element {
  // State untuk produk dan kategori
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // State untuk UI
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);
  const router = useRouter();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const addToCart = (product: Product): void => {
    const existingItem = cart.find((item) => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        category: product.category,
      };
      setCart([...cart, newItem]);
    }

    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  const removeFromCart = (productId: string): void => {
    const existingItem = cart.find((item) => item.productId === productId);
    
    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ));
    } else {
      setCart(cart.filter((item) => item.productId !== productId));
    }
  };

  const getCartItemQuantity = (productId: string): number => {
    const item = cart.find((item) => item.productId === productId);
    return item ? item.quantity : 0;
  };

  const getTotalPrice = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Load products from local data
  useEffect(() => {
    setIsLoading(true);
    try {
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Gagal memuat produk. Silakan refresh halaman.');
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load cart from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error parsing cart from sessionStorage:', error);
          setCart([]);
        }
      }
    }
  }, []);

  // Save cart to sessionStorage and dispatch event whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (cart.length > 0) {
        sessionStorage.setItem('cart', JSON.stringify(cart));
      } else {
        sessionStorage.removeItem('cart');
      }
      window.dispatchEvent(new Event('cartUpdated'));
    }
  }, [cart]);

  const filteredAndSortedProducts = useMemo((): Product[] => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    // Sort products
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [selectedCategory, sortBy, allProducts]);

  const getCategoryBadgeColor = (category: string): string => {
    switch (category) {
      case 'jasa-satuan':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string): string => {
    switch (category) {
      case 'jasa-satuan':
        return 'Jasa Satuan';
      default:
        return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Header />
      <Container className="py-8">
        <div className="text-center mb-8">
          <Typography variant="h1" className="mb-4 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Katalog Produk Desain
          </Typography>
          <Typography variant="body" className="text-gray-600 max-w-2xl mx-auto text-lg">
            Temukan solusi desain terbaik untuk kebutuhan bisnis Anda. Dari konten media sosial hingga materi promosi profesional.
          </Typography>
        </div>

        {/* Enhanced Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 p-6 bg-white rounded-xl shadow-lg border-2 border-gray-100">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Kategori Produk
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-12 text-base border-2 border-gray-200 hover:border-primary transition-colors">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center">
                    <span className="mr-2">🎯</span>
                    Semua Kategori
                  </div>
                </SelectItem>
                <SelectItem value="jasa-satuan">
                  <div className="flex items-center">
                    <span className="mr-2">🎨</span>
                    Jasa Satuan
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔄 Urutkan Berdasarkan
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-12 text-base border-2 border-gray-200 hover:border-primary transition-colors">
                <SelectValue placeholder="Urutkan berdasarkan" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {option.value.includes('price') ? '💰' : 
                         option.value.includes('name') ? '📝' : '⭐'}
                      </span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Filter Button */}
          <div className="sm:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔧 Filter Lanjutan
            </label>
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-primary transition-colors"
              onClick={() => setIsMobileFilterOpen(true)}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filter & Pencarian
            </Button>
          </div>
        </div>

        {/* Product Stats */}
        <div className="flex flex-wrap gap-4 mb-6 justify-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-full border border-blue-200">
            <span className="text-sm font-medium text-blue-700">
              📊 {filteredAndSortedProducts.length} produk tersedia
            </span>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-full border border-green-200">
            <span className="text-sm font-medium text-green-700">
              🚀 Pengerjaan 1-10 hari
            </span>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-full border border-orange-200">
            <span className="text-sm font-medium text-orange-700">
              ♾️ Revisi unlimited tersedia
            </span>
          </div>
        </div>



        {/* Enhanced Product Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20 max-w-6xl mx-auto">
            {filteredAndSortedProducts.map((product, _index) => {
              const cartQuantity = getCartItemQuantity(product.id);
              
              return (
                <ConsistentCard
                  key={product.id}
                  className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 max-w-sm mx-auto w-full"
                  hover
                  clickable
                >
                  {/* Product Image with Overlay */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <LazyImage
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Badges Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <Badge className={`${getCategoryBadgeColor(product.category)} font-medium shadow-sm`}>
                        {getCategoryLabel(product.category)}
                      </Badge>
                      {product.popular && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium shadow-sm animate-pulse">
                          ⭐ Populer
                        </Badge>
                      )}
                    </div>

                    {/* Quick Action Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Product Content */}
                  <CardContent className="p-4 space-y-3">
                    {/* Product Title */}
                    <div>
                      <Typography variant="h4" className="font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {product.name}
                      </Typography>
                      <Typography variant="caption" className="text-gray-500 mt-1">
                        📦 {product.deliveryTime} • 🔄 {product.revisions === 999 ? 'Unlimited' : product.revisions} revisi
                      </Typography>
                    </div>

                    {/* Product Description */}
                    <Typography variant="body" className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {product.description}
                    </Typography>

                    {/* Features */}
                    <div className="space-y-2">
                      <Typography variant="caption" className="font-medium text-gray-700">
                        ✨ Fitur Utama:
                      </Typography>
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full border"
                          >
                            {feature}
                          </span>
                        ))}
                        {product.features.length > 3 && (
                          <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded-full border border-primary/20">
                            +{product.features.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <Typography variant="caption" className="text-gray-500">
                            Mulai dari
                          </Typography>
                          <Typography variant="h3" className="font-bold text-primary">
                            {formatPrice(product.price)}
                          </Typography>
                        </div>
                        
                        {/* Quantity Badge */}
                        {cartQuantity > 0 && (
                          <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold animate-bounce">
                            {cartQuantity}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {cartQuantity > 0 ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(product.id)}
                              className="h-9 w-9 p-0 border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            
                            <div className="flex-1 text-center">
                              <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                                {cartQuantity}
                              </span>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(product)}
                              className="h-9 w-9 p-0 border-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah ke Keranjang
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </ConsistentCard>
              );
            })}
          </StaggerContainer>
        )}

        {/* Enhanced Shopping Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-primary shadow-2xl z-50">
            <Container className="py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {getTotalItems()}
                  </div>
                  <div>
                    <Typography variant="body" className="font-semibold text-gray-900">
                      🛒 {getTotalItems()} item dalam keranjang
                    </Typography>
                    <Typography variant="caption" className="text-gray-600">
                      Total: <span className="font-bold text-primary text-lg">Rp {getTotalPrice().toLocaleString('id-ID')}</span>
                    </Typography>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCart([])}
                    className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Kosongkan
                  </Button>
                  <Button
                    onClick={() => router.push('/checkout')}
                    className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout Sekarang
                  </Button>
                </div>
              </div>
            </Container>
          </div>
        )}

        {/* Mobile Filter Panel */}
        <MobileFilterPanel
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          filters={{
            categories: selectedCategory === 'all' ? [] : [selectedCategory],
            priceRange: [0, 10000000],
            rating: 0,
            sortBy: sortBy
          }}
          onFiltersChange={(newFilters) => {
            if (newFilters.categories.length > 0) {
              setSelectedCategory(newFilters.categories[0] || 'all');
            } else {
              setSelectedCategory('all');
            }
            setSortBy(newFilters.sortBy);
          }}
        />
      </Container>
      <Toaster position="top-right" />
    </div>
  );
}