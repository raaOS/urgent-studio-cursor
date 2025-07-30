"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography } from '@/components/ui/visual-consistency';
import { StaggerContainer } from '@/components/ui/micro-interactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowRight, AlertCircle } from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export default function CheckoutPage(): JSX.Element {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check cart from sessionStorage
    if (typeof window !== 'undefined') {
      const savedCart = sessionStorage.getItem('globalCart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart) as CartItem[];
          setCart(parsedCart);
        } catch (error) {
          console.error('Error parsing cart:', error);
          setCart([]);
        }
      }
      setLoading(false);
    }
  }, []);

  const handleContinueToBrief = (): void => {
    router.push('/brief');
  };

  const handleBackToHome = (): void => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <Typography variant="body" className="text-muted-foreground">
            Memuat keranjang...
          </Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-6 sm:py-8 px-4 sm:px-6">
        <StaggerContainer>
          <div className="mb-6 sm:mb-8 text-center">
            <Typography 
              variant="h1" 
              className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4"
            >
              🛒 Checkout
            </Typography>
            <Typography 
              variant="body" 
              className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4"
            >
              Lanjutkan proses pemesanan desain Anda
            </Typography>
          </div>

          <div className="max-w-2xl mx-auto">
            {cart.length === 0 ? (
              // Empty Cart State
              <Card className="border-2 border-foreground shadow-neo">
                <CardHeader className="text-center p-4 sm:p-6">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🛒</div>
                  <CardTitle className="text-lg sm:text-xl">Keranjang Kosong</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
                  <Typography variant="body" className="text-sm sm:text-base text-muted-foreground">
                    Anda belum memilih layanan desain apapun. Silakan pilih layanan terlebih dahulu.
                  </Typography>
                  <Button 
                    onClick={handleBackToHome}
                    className="w-full h-11 sm:h-12 text-sm sm:text-base"
                    size="lg"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Pilih Layanan Desain
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Cart with Items
              <div className="space-y-4 sm:space-y-6">
                {/* Cart Summary */}
                <Card className="border-2 border-foreground shadow-neo">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                      Keranjang Anda ({cart.length} item)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 border border-dashed border-foreground/30 rounded-md space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <Typography variant="body" className="font-medium text-sm sm:text-base">
                            {item.name}
                          </Typography>
                          <Typography variant="caption" className="text-muted-foreground text-xs sm:text-sm">
                            {item.category} • Qty: {item.quantity}
                          </Typography>
                        </div>
                        <Typography variant="body" className="font-bold text-sm sm:text-base text-right">
                          Rp {item.price.toLocaleString()}
                        </Typography>
                      </div>
                    ))}
                    
                    <div className="border-t pt-3 sm:pt-4">
                      <div className="flex justify-between items-center">
                        <Typography variant="body" className="font-bold text-base sm:text-lg">
                          Total:
                        </Typography>
                        <Typography variant="body" className="font-bold text-base sm:text-lg">
                          Rp {cart.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Step Info */}
                <Card className="border-2 border-blue-500 bg-blue-50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <Typography variant="body" className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
                          Langkah Selanjutnya
                        </Typography>
                        <Typography variant="caption" className="text-blue-700 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                          Untuk melanjutkan ke pembayaran, Anda perlu mengisi form brief desain terlebih dahulu. 
                          Brief ini akan membantu designer memahami kebutuhan Anda dengan detail.
                        </Typography>
                        <Button 
                          onClick={handleContinueToBrief}
                          className="w-full h-11 sm:h-12 text-sm sm:text-base"
                          size="lg"
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Lanjut ke Form Brief
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </StaggerContainer>
      </Container>
    </div>
  );
}