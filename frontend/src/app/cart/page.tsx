"use client";

import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';

// Enhanced UI Components
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader } from '@/components/ui/card';
import { Container, Typography, ConsistentCard, ConsistentButton } from '@/components/ui/visual-consistency';
import { StaggerContainer } from '@/components/ui/micro-interactions';
import { LazyImage } from '@/components/ui/performance';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

interface OrderSummary {
  subtotal: number;
  tax: number;
  total: number;
}

export default function CartPage(): JSX.Element {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load cart from sessionStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedCart = sessionStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Gagal memuat keranjang');
      setCart([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save cart to sessionStorage whenever it changes
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

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = (productId: string, newQuantity: number): void => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
    
    toast.success('Jumlah diperbarui');
  };

  const removeFromCart = (productId: string): void => {
    const removedItem = cart.find(item => item.productId === productId);
    setCart(cart.filter(item => item.productId !== productId));
    
    if (removedItem) {
      toast.success(`${removedItem.name} dihapus dari keranjang`);
    }
  };

  const clearCart = (): void => {
    setCart([]);
    toast.success('Keranjang dikosongkan');
  };

  const getOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const getTotalItems = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = (): void => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    
    toast.success('Mengarahkan ke pembayaran...');
    // In a real app, this would navigate to checkout
    // router.push('/checkout');
  };

  const continueShopping = (): void => {
    router.push('/products');
  };

  const summary = getOrderSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <Container className="py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Toaster position="top-right" />
      <Header />
      
      <Container className="py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <Typography variant="h1" className="mb-4 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Keranjang Belanja
          </Typography>
          <Typography variant="body" className="text-gray-600 max-w-2xl mx-auto text-lg">
            Review pesanan Anda sebelum melanjutkan ke pembayaran
          </Typography>
        </div>

        {cart.length === 0 ? (
          // Empty Cart State
          <StaggerContainer className="flex flex-col items-center justify-center py-20">
            <ConsistentCard className="text-center p-12 max-w-md">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <Typography variant="h3" className="mb-2">Keranjang Kosong</Typography>
              <Typography variant="body" className="text-muted-foreground mb-6">
                Belum ada produk di keranjang Anda
              </Typography>
              <ConsistentButton 
                onClick={continueShopping}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Lanjut Belanja
              </ConsistentButton>
            </ConsistentCard>
          </StaggerContainer>
        ) : (
          // Cart Content
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <StaggerContainer className="space-y-4">
                {/* Cart Header */}
                <div className="flex justify-between items-center mb-4">
                  <Typography variant="h2">
                    {getTotalItems()} Item dalam Keranjang
                  </Typography>
                  <Button 
                    variant="ghost" 
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Kosongkan
                  </Button>
                </div>

                {/* Cart Items List */}
                {cart.map((item) => (
                  <ConsistentCard 
                    key={item.id} 
                    className="p-4 hover:shadow-md transition-shadow"
                    hover
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                        {item.imageUrl ? (
                          <LazyImage 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Typography variant="h4" className="font-bold text-gray-900 mb-1">
                          {item.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-500 mb-2">
                          {item.category}
                        </Typography>
                        {item.description && (
                          <Typography variant="body" className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {item.description}
                          </Typography>
                        )}
                        
                        <Typography variant="h3" className="font-bold text-primary mb-2">
                          {formatPrice(item.price)}
                        </Typography>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.productId)}
                            className="h-8 px-2 text-destructive hover:text-destructive/90"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <Typography variant="caption" className="text-gray-500">Subtotal</Typography>
                        <Typography variant="h3" className="font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </div>
                    </div>
                  </ConsistentCard>
                ))}
              </StaggerContainer>

              {/* Continue Shopping */}
              <div className="mt-6">
                <ConsistentButton
                  variant="outline"
                  onClick={continueShopping}
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Lanjut Belanja
                </ConsistentButton>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <ConsistentCard className="sticky top-24">
                <CardHeader>
                  <Typography variant="h3" className="font-bold">
                    Ringkasan Pesanan
                  </Typography>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Typography variant="body" className="text-gray-600">
                        Subtotal ({getTotalItems()} item)
                      </Typography>
                      <Typography variant="body" className="font-medium">
                        {formatPrice(summary.subtotal)}
                      </Typography>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <Typography variant="body" className="text-gray-600">
                        Pajak (11%)
                      </Typography>
                      <Typography variant="body" className="font-medium">
                        {formatPrice(summary.tax)}
                      </Typography>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <Typography variant="h4" className="font-bold">
                          Total
                        </Typography>
                        <Typography variant="h4" className="font-bold text-primary">
                          {formatPrice(summary.total)}
                        </Typography>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <ConsistentButton
                    onClick={proceedToCheckout}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={cart.length === 0}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Lanjut ke Pembayaran
                  </ConsistentButton>

                  {/* Security Notice */}
                  <div className="text-center text-xs text-gray-500 space-y-1">
                    <Typography variant="caption">
                      🔒 Pembayaran aman & terenkripsi
                    </Typography>
                    <Typography variant="caption">
                      ⚡ Proses instan & transparan
                    </Typography>
                  </div>
                </CardContent>
              </ConsistentCard>

              {/* Additional Info */}
              <ConsistentCard className="mt-4">
                <CardContent className="text-sm space-y-2">
                  <Typography variant="body" className="font-medium">
                    📋 Informasi Tambahan
                  </Typography>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Revisi akan dimulai setelah pembayaran</li>
                    <li>• File akan dikirim via email/WhatsApp</li>
                    <li>• Garansi 100% uang kembali</li>
                  </ul>
                </CardContent>
              </ConsistentCard>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}