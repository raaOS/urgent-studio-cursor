
"use client";

import { Suspense, useState, useEffect } from 'react';
import BriefForm from '@/components/BriefForm';
import { Container, Typography } from '@/components/ui/visual-consistency';
import { StaggerContainer } from '@/components/ui/micro-interactions';
import LoadingSkeleton from '@/components/ui/loading';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const BriefLoadingFallback: React.FC = () => (
  <Container className="py-6 sm:py-8 px-4 sm:px-6">
    <div className="text-center mb-6 sm:mb-8">
      <LoadingSkeleton className="h-6 sm:h-8 w-48 sm:w-64 mx-auto mb-3 sm:mb-4" />
      <LoadingSkeleton className="h-3 sm:h-4 w-72 sm:w-96 mx-auto" />
    </div>
    <div className="space-y-4 sm:space-y-6">
      <LoadingSkeleton className="h-24 sm:h-32 w-full" />
      <LoadingSkeleton className="h-20 sm:h-24 w-full" />
      <LoadingSkeleton className="h-12 sm:h-16 w-full" />
    </div>
  </Container>
);

export default function BriefPage(): JSX.Element {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        // Read cart from sessionStorage on client side
        if (typeof window !== 'undefined') {
            const savedCart = sessionStorage.getItem('globalCart');
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

    return (
        <div className="min-h-screen bg-background">
            <Container className="py-6 sm:py-8 px-4 sm:px-6">
                <StaggerContainer>
                    <div className="mb-6 sm:mb-8 text-center">
                        <Typography 
                            variant="h1" 
                            className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4"
                        >
                            📝 Form Brief Desain
                        </Typography>

                    </div>
                    
                    <Suspense fallback={<BriefLoadingFallback />}>
                        <BriefForm cart={cart} />
                    </Suspense>
                </StaggerContainer>
            </Container>
        </div>
    )
}
