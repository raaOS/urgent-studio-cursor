
"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ImageIcon, Loader2, X, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { getProductsForTier } from "@/lib/products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ProductListDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialTierName: string;
}

// 1. Image Preview Modal (improved with better event handling)
function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc, true);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      if (modalRef.current) {
        modalRef.current.focus();
      }

      return () => {
        document.removeEventListener("keydown", handleEsc, true);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return createPortal(
    <div
      ref={modalRef}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
        cursor: "pointer",
      }}
      onClick={handleBackdropClick}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <div
        style={{
          position: "relative",
          backgroundColor: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          maxWidth: "90vw",
          maxHeight: "90vh",
          cursor: "default",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
        onClick={handleContentClick}
      >
        <div
          style={{
            width: "min(500px, 90vw)",
            height: "min(500px, 90vh)",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={imageUrl}
            alt={imageName}
            fill
            sizes="(max-width: 768px) 90vw, 500px"
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

// 2. Komponen utama
export function ProductListDialog({
  isOpen,
  setIsOpen,
  initialTierName,
}: ProductListDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<Product[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string; } | null>(null);

  // Load cart from sessionStorage on mount and when dialog opens
  useEffect(() => {
    if (isOpen) {
      const cartFromSession = sessionStorage.getItem("globalCart");
      if (cartFromSession) {
        try {
          setCart(JSON.parse(cartFromSession));
        } catch (e) {
          console.error("Failed to parse cart from session storage:", e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  }, [isOpen]);

  const handleQuantityChange = (product: Product, change: number) => {
    let newCart = [...cart];
    const { name, tier, price, promoPrice, imageUrl } = product;
    const baseProduct = { id: product.id, name, tier, price, promoPrice, imageUrl };

    if (change > 0) {
      // Menambah produk
      newCart.push({ ...baseProduct, instanceId: `${product.id}-${Date.now()}` });
    } else if (change < 0) {
      // Mengurangi produk, hapus yang terakhir ditambahkan
      const lastIndex = newCart.map(item => item.id).lastIndexOf(product.id);
      if (lastIndex !== -1) {
        newCart.splice(lastIndex, 1);
      }
    }
    
    setCart(newCart);
    sessionStorage.setItem("globalCart", JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated')); // Kirim event
  };
  
  const handleContinue = () => {
    setIsProcessing(true);
    
    if (cart.length === 0) {
        toast({
            variant: "destructive",
            title: "Keranjang Kosong",
            description: "Pilih setidaknya satu produk untuk melanjutkan.",
        });
        setIsProcessing(false);
        return;
    }
    
    // Simpan keranjang final ke sessionStorage sebelum navigasi
    sessionStorage.setItem("globalCart", JSON.stringify(cart));
    
    router.push(`/brief`);
    
    // Kita tidak perlu menunggu, navigasi akan mengambil alih.
    // Tombol akan tetap loading sampai halaman baru dimuat.
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    if (product.imageUrl) {
      setPreviewImage({ url: product.imageUrl, name: product.name });
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleDialogClose = (open: boolean) => {
    if (isProcessing) return;
    if (!open) {
      setIsOpen(false);
    }
  };

  const renderPrice = (product: Product) => (
    <div className="text-sm">
      {product.promoPrice ? (
        <>
          <span className="line-through text-muted-foreground text-xs">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
          </span>
          <span className="block font-bold text-primary">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.promoPrice)}
          </span>
        </>
      ) : (
        <span className="font-bold">
          {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(product.price)}
        </span>
      )}
    </div>
  );
  
  const tiers = ["Budget Kaki Lima", "Budget UMKM", "Budget E-commerce"];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogClose}>
        <DialogContent
          className="max-w-3xl w-full border-2 border-foreground shadow-neo p-0"
          style={{ height: "90vh", maxHeight: "90vh", display: 'flex', flexDirection: 'column' }}
          onClick={() => {
            if (previewImage) handleClosePreview();
          }}
        >
          <DialogHeader className="p-4 bg-background flex flex-row items-center justify-between border-b-2 border-foreground">
            <DialogTitle className="text-foreground text-lg">
              Pilih Produk Desain
            </DialogTitle>
             <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
                <X className="h-5 w-5"/>
             </Button>
          </DialogHeader>

          <Tabs defaultValue={initialTierName} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-4">
                {tiers.map(tier => (
                    <TabsTrigger key={tier} value={tier}>{tier}</TabsTrigger>
                ))}
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className="p-4 sm:p-6">
                    {tiers.map(tier => (
                        <TabsContent key={tier} value={tier} className="mt-0">
                            <div className="space-y-4">
                            {getProductsForTier(tier).map((product) => {
                              const quantity = cart.filter(item => item.id === product.id).length;
                              const isPromo = Boolean(product.promoPrice && product.promoPrice < product.price);
                              
                              return (
                                <div
                                  key={product.id}
                                  className="relative border-2 border-foreground rounded-lg p-4 shadow-sm flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center bg-card transition-all"
                                >
                                  {isPromo && (
                                    <div className="starburst absolute -top-4 -left-4 w-16 h-16 bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold pointer-events-none" style={{ lineHeight: "1.1", zIndex: 10 }}>
                                      PROMO
                                    </div>
                                  )}

                                  <div className="flex items-start gap-4 flex-grow">
                                    <div
                                      className="w-16 h-16 bg-muted rounded-md overflow-hidden flex items-center justify-center shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={(e) => handleImageClick(e, product as Product)}
                                      role="button"
                                      tabIndex={0}
                                      aria-label={`View ${product.name} image`}
                                    >
                                      {product.imageUrl ? (
                                        <Image src={product.imageUrl} alt={product.name} width={64} height={64} className="object-cover w-full h-full" data-ai-hint="product design"/>
                                      ) : (
                                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold">{product.name}</span>
                                      {renderPrice(product as Product)}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 shrink-0">
                                    <Button type="button" size="icon" onClick={() => handleQuantityChange(product as Product, -1)} disabled={quantity === 0 || isProcessing} className="h-8 w-8 bg-[#ffe502] text-foreground hover:bg-[#ffe502]/90 border-2 border-foreground disabled:bg-muted disabled:text-muted-foreground">
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-6 text-center font-bold text-lg">{quantity}</span>
                                    <Button type="button" size="icon" className="h-8 w-8 border-2 border-foreground bg-primary hover:bg-primary/90" onClick={() => handleQuantityChange(product as Product, 1)} disabled={isProcessing}>
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

          <DialogFooter
            className="bg-background p-4 border-t-2 border-foreground"
          >
            <div className="flex items-center gap-2 w-full">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="font-bold border-2 border-foreground bg-muted text-muted-foreground w-1/3 h-11"
                disabled={isProcessing}
              >
                Tutup
              </Button>
              <Button
                onClick={handleContinue}
                disabled={cart.length === 0 || isProcessing}
                className="font-bold border-2 border-foreground bg-accent text-accent-foreground hover:bg-accent/90 shadow-neo hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed w-2/3 h-11"
              >
                {isProcessing ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                    </>
                ) : (
                    <>
                        Lanjutkan & Isi Brief <ShoppingCart className="ml-2 h-4 w-4"/> ({cart.length})
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

      {previewImage && (
        <ImagePreviewModal
          isOpen={!!previewImage}
          onClose={handleClosePreview}
          imageUrl={previewImage.url}
          imageName={previewImage.name}
        />
      )}
    </>
  );
}
