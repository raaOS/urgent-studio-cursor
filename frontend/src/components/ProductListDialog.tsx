
'use client';

import { ImageIcon, Loader2, Minus, Plus, ShoppingCart, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getProductsForTier, ProductMaster } from '@/lib/products';

// Interfaces
interface ProductListDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialTierName: string;
}

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

interface PreviewImageState {
  url: string;
  name: string;
}

interface CartProduct extends ProductMaster {
  instanceId: string;
}

// Constants
const TIERS: readonly string[] = ['Budget Kaki Lima', 'Budget UMKM', 'Budget E-commerce'] as const;

const CURRENCY_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
} as const;

// Helper functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', CURRENCY_FORMAT_OPTIONS).format(amount);
}

function isValidCartData(data: unknown): data is CartProduct[] {
  if (!Array.isArray(data)) {
    return false;
  }
  
  return data.every((item: unknown): item is CartProduct => {
    if (typeof item !== 'object' || item === null) {
      return false;
    }
    
    const cartItem = item as Record<string, unknown>;
    return (
      typeof cartItem.id === 'string' &&
      typeof cartItem.name === 'string' &&
      typeof cartItem.tier === 'string' &&
      typeof cartItem.price === 'number' &&
      typeof cartItem.imageUrl === 'string' &&
      typeof cartItem.instanceId === 'string'
    );
  });
}

function parseCartFromStorage(): CartProduct[] {
  try {
    const cartFromSession = sessionStorage.getItem('globalCart');
    if (cartFromSession === null || cartFromSession === undefined || cartFromSession === '') {
      return [];
    }
    
    const parsed: unknown = JSON.parse(cartFromSession);
    return isValidCartData(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to parse cart from session storage:', error);
    return [];
  }
}

function saveCartToStorage(cart: CartProduct[]): void {
  try {
    sessionStorage.setItem('globalCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('Failed to save cart to session storage:', error);
  }
}

// Image Preview Modal Component
function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: ImagePreviewModalProps): JSX.Element | null {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect((): (() => void) | undefined => {
    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc, true);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      if (modalRef.current) {
        modalRef.current.focus();
      }

      return (): void => {
        document.removeEventListener('keydown', handleEsc, true);
        document.body.style.overflow = originalOverflow;
      };
    }
    
    return undefined;
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        cursor: 'pointer',
      }}
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: 8,
          overflow: 'hidden',
          maxWidth: '90vw',
          maxHeight: '90vh',
          cursor: 'default',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
        onClick={handleContentClick}
      >
        <div
          style={{
            width: 'min(500px, 90vw)',
            height: 'min(500px, 90vh)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={imageUrl}
            alt={imageName}
            fill
            sizes="(max-width: 768px) 90vw, 500px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

// Main Component
export function ProductListDialog({
  isOpen,
  setIsOpen,
  initialTierName,
}: ProductListDialogProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<PreviewImageState | null>(null);

  // Load cart from sessionStorage when dialog opens
  useEffect((): void => {
    if (isOpen) {
      const cartData = parseCartFromStorage();
      setCart(cartData);
    }
  }, [isOpen]);

  const handleQuantityChange = (product: ProductMaster, change: number): void => {
    const newCart = [...cart];
    const { id, name, tier, price, promoPrice, imageUrl } = product;
    const baseProduct: Omit<CartProduct, 'instanceId'> = { 
      id, 
      name, 
      tier, 
      price, 
      promoPrice: promoPrice ?? 0, 
      imageUrl,
      'data-ai-hint': product['data-ai-hint']
    };

    if (change > 0) {
      // Add product
      const newProduct: CartProduct = { 
        ...baseProduct, 
        instanceId: `${product.id}-${Date.now()}` 
      };
      newCart.push(newProduct);
    } else if (change < 0) {
      // Remove product - remove the last added one
      const lastIndex = newCart.map((item: CartProduct): string => item.id).lastIndexOf(product.id);
      if (lastIndex !== -1) {
        newCart.splice(lastIndex, 1);
      }
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
  };
  
  const handleContinue = (): void => {
    setIsProcessing(true);
    
    if (cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Keranjang Kosong',
        description: 'Pilih setidaknya satu produk untuk melanjutkan.',
      });
      setIsProcessing(false);
      return;
    }
    
    // Save final cart to sessionStorage before navigation
    saveCartToStorage(cart);
    
    void router.push('/brief');
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>, product: ProductMaster): void => {
    e.stopPropagation();
    e.preventDefault();
    if (product.imageUrl) {
      setPreviewImage({ url: product.imageUrl, name: product.name });
    }
  };

  const handleClosePreview = (): void => {
    setPreviewImage(null);
  };

  const handleDialogClose = (open: boolean): void => {
    if (isProcessing) {
      return;
    }
    if (!open) {
      setIsOpen(false);
    }
  };

  const renderPrice = (product: ProductMaster): JSX.Element => (
    <div className="text-sm">
      {(product.promoPrice !== null && product.promoPrice !== undefined) ? (
        <>
          <span className="line-through text-muted-foreground text-xs">
            {formatCurrency(product.price)}
          </span>
          <span className="block font-bold text-primary">
            {formatCurrency(product.promoPrice)}
          </span>
        </>
      ) : (
        <span className="font-bold">
          {formatCurrency(product.price)}
        </span>
      )}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent
          className="max-w-3xl w-full border-2 border-foreground shadow-neo p-0"
          style={{ height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          onClick={(): void => {
            if (previewImage !== null) {
              handleClosePreview();
            }
          }}
        >
          <DialogHeader className="p-4 bg-background flex flex-row items-center justify-between border-b-2 border-foreground">
            <DialogTitle className="text-foreground text-lg">
              Pilih Produk Desain
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(): void => setIsOpen(false)} 
              className="h-8 w-8 overflow-hidden"
            >
              <X className="h-5 w-5"/>
            </Button>
          </DialogHeader>

          <Tabs defaultValue={initialTierName} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4">
              {TIERS.map((tier: string): JSX.Element => (
                <TabsTrigger key={tier} value={tier}>{tier}</TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 sm:p-6">
                  {TIERS.map((tier: string): JSX.Element => (
                    <TabsContent key={tier} value={tier} className="mt-0">
                      <div className="space-y-4">
                        {getProductsForTier(tier).map((product: ProductMaster): JSX.Element => {
                          const quantity = cart.filter((item: CartProduct): boolean => item.id === product.id).length;
                          const isPromo = (product.promoPrice !== null && product.promoPrice !== undefined && product.promoPrice < product.price);
                          
                          return (
                            <div
                              key={product.id}
                              className="relative border-2 border-foreground rounded-lg p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-card transition-all"
                            >
                              {isPromo && (
                                <div 
                                  className="starburst absolute -top-4 -left-4 w-16 h-16 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold pointer-events-none" 
                                  style={{ lineHeight: '1.1', zIndex: 10 }}
                                >
                                  PROMO
                                </div>
                              )}

                              <div className="flex items-start gap-4 flex-grow">
                                <div
                                  className="w-16 h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={(e: MouseEvent<HTMLDivElement>): void => handleImageClick(e, product)}
                                  role="button"
                                  tabIndex={0}
                                  aria-label={`View ${product.name} image`}
                                >
                                  {(product.imageUrl !== null && product.imageUrl !== undefined && product.imageUrl !== '') ? (
                                    <Image 
                                      src={product.imageUrl ?? ''} 
                                      alt={product.name} 
                                      width={64} 
                                      height={64} 
                                      className="object-cover w-full h-full" 
                                      data-ai-hint="product design"
                                    />
                                  ) : (
                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">{product.name}</span>
                                  {renderPrice(product)}
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-2 shrink-0">
                                <Button 
                                  type="button" 
                                  size="icon" 
                                  onClick={(): void => handleQuantityChange(product, -1)} 
                                  disabled={quantity === 0 || isProcessing} 
                                  className="h-8 w-8 bg-[#ffe502] text-foreground hover:bg-[#ffe502]/90 border-2 border-foreground disabled:bg-muted disabled:text-muted-foreground overflow-hidden"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-6 text-center font-bold text-lg">{quantity}</span>
                                <Button 
                                  type="button" 
                                  size="icon" 
                                  className="h-8 w-8 border-2 border-foreground bg-primary hover:bg-primary/90 overflow-hidden" 
                                  onClick={(): void => handleQuantityChange(product, 1)} 
                                  disabled={isProcessing}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Tabs>

          <DialogFooter className="bg-background p-4 border-t-2 border-foreground">
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={(): void => setIsOpen(false)}
                className="font-bold border-2 border-foreground bg-muted text-muted-foreground w-1/3 h-11"
                disabled={isProcessing}
              >
                <span className="overflow-hidden text-ellipsis">Tutup</span>
              </Button>
              <Button
                onClick={handleContinue}
                disabled={cart.length === 0 || isProcessing}
                className="font-bold border-2 border-foreground bg-accent text-accent-foreground hover:bg-accent/90 shadow-neo hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed w-2/3 h-11"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="overflow-hidden text-ellipsis">Memproses...</span>
                  </>
                ) : (
                  <>
                    <span className="overflow-hidden text-ellipsis">Lanjutkan & Isi Brief</span> 
                    <ShoppingCart className="ml-2 h-4 w-4"/> ({cart.length})
                  </>
                )}
              </Button>
            </div>
            {isProcessing && (
              <p className="text-xs text-muted-foreground text-center animate-pulse">
                Menyiapkan brief, mohon tunggu...
              </p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {(previewImage !== null) && (
        <ImagePreviewModal
          isOpen={previewImage !== null}
          onClose={handleClosePreview}
          imageUrl={previewImage.url}
          imageName={previewImage.name}
        />
      )}
    </>
  );
}
