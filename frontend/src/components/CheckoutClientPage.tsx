
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderById, updateOrderWithCustomerInfo, updateOrderStatus } from '@/services/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Phone, Send, Trash2, Home, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getAllProducts } from '@/lib/products';
import type { Order, Product } from '@/lib/types';

export function CheckoutClientPage({ orderIds }: { orderIds: string[] }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orderIds && orderIds.length > 0) {
      const fetchOrders = async () => {
        try {
          const fetchedOrders = await Promise.all(
            orderIds.map(id => getOrderById(id))
          );
          
          const validOrders = fetchedOrders.filter((order): order is Order => order !== null);
          
          if (validOrders.length === 0) {
            setError("Pesanan tidak ditemukan.");
            setLoading(false);
            return;
          }

          // Cek apakah ada order yang statusnya tidak valid
          for (const order of validOrders) {
            if (order.status === 'Dibatalkan') {
                setError(`Salah satu pesanan (ID: ...${order.id.slice(-4)}) telah dibatalkan.`);
                setLoading(false);
                return;
            }
             if (order.status !== 'Menunggu Pembayaran') {
                setError(`Pesanan ini sudah diproses. Anda akan diarahkan ke halaman pelacakan.`);
                setTimeout(() => {
                    // Hanya lacak pesanan pertama jika ada banyak
                    router.push(`/track?orderId=${validOrders[0].id}`);
                }, 3000);
                setLoading(false);
                return;
            }
          }
          
          setOrders(validOrders);
          // Isi form kontak dari pesanan pertama, jika ada, atau dari local storage
          const savedContact = JSON.parse(localStorage.getItem('contactInfo') || '{}');
          setName(validOrders[0].customerName || savedContact.name || '');
          setPhone(validOrders[0].customerPhone || savedContact.phone || '');
          setTelegram(validOrders[0].customerTelegram || savedContact.telegram || '');

        } catch (err) {
          setError("Gagal memuat data pesanan.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [orderIds, router]);
  
  const handleBackToEdit = () => {
    if (orders.length === 0) return;
    
    // Ambil semua briefs dari semua order, ubah menjadi format Product untuk keranjang
    const cartItems: Product[] = orders.flatMap(order => 
      order.briefs.map(brief => {
        const productDetails = getAllProducts().find(p => p.id === brief.productId);
        return {
          id: brief.productId,
          name: brief.productName,
          tier: brief.tier,
          price: productDetails?.price || 0,
          promoPrice: productDetails?.promoPrice,
          imageUrl: productDetails?.imageUrl,
          instanceId: brief.instanceId,
          // Bawa data brief yang sudah diisi
          briefDetails: brief.briefDetails,
          googleDriveAssetLinks: brief.googleDriveAssetLinks,
          width: brief.width,
          height: brief.height,
          unit: brief.unit,
        };
      })
    );

    // Simpan kembali keranjang ke sessionStorage
    sessionStorage.setItem('globalCart', JSON.stringify(cartItems));
    
    // Arahkan ke halaman brief untuk pengeditan
    router.push('/brief');
  };

  const handleProceedToPayment = async () => {
    if (orders.length === 0) return;

    setIsSubmitting(true);
    try {
        const contactInfo = { name, phone, telegram };
        // Update info kontak di semua pesanan
        await Promise.all(orders.map(order => 
            updateOrderWithCustomerInfo(order.id, contactInfo)
        ));
        
        // Simpan info kontak ke local storage untuk digunakan lagi nanti
        localStorage.setItem('contactInfo', JSON.stringify(contactInfo));

        toast({
            title: "Data Tersimpan!",
            description: "Informasi kontak Anda telah disimpan. Mengarahkan ke halaman instruksi pembayaran...",
        });
        
        const paymentOrderId = orders.map(o => o.id).join(',');
        router.push(`/payment/${paymentOrderId}`);

    } catch (e) {
        console.error("Payment process failed:", e);
        toast({
            variant: "destructive",
            title: "Penyimpanan Gagal",
            description: "Terjadi kesalahan saat menyimpan data Anda. Silakan coba lagi.",
        });
        setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (orders.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(orders.map(order => updateOrderStatus(order.id, "Dibatalkan")));
      toast({
        variant: "destructive",
        title: "Pesanan Dibatalkan",
        description: "Semua pesanan Anda dalam sesi ini telah berhasil dibatalkan.",
      });
      router.push(`/`);
    } catch (e) {
      console.error("Failed to cancel order:", e);
      toast({
        variant: "destructive",
        title: "Gagal Membatalkan",
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isFormValid = name.trim() !== '' && phone.trim() !== '' && telegram.trim() !== '' && telegram.trim().startsWith('@');

  const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat rincian pesanan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="bg-background border-b-2 border-foreground">
            <div className="container flex h-16 items-center justify-end" />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto w-full border-2 border-foreground shadow-neo">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Terjadi Kesalahan</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
             <CardFooter>
              <Button asChild className="w-full font-bold">
                <Link href="/">
                    <Home className="mr-2"/> Kembali ke Beranda
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="bg-background border-b-2 border-foreground">
            <div className="container flex h-16 items-center justify-end" />
        </header>
      <main className="flex-1 py-16 sm:py-24">
        <div className="container mx-auto max-w-xl px-4">
          <Card className="border-2 border-foreground shadow-neo overflow-hidden">
            <CardHeader className="text-center p-0">
                <div className="bg-primary text-primary-foreground p-6 border-b-2 border-foreground">
                    <CardTitle className="text-3xl font-bold tracking-tighter">Satu Langkah Lagi</CardTitle>
                    <CardDescription className="text-primary-foreground/90 mt-2">
                        Lengkapi data Anda untuk melanjutkan ke pembayaran.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent className="grid gap-8 px-6 pt-6">
              {/* Customer Info Form */}
              <div className="grid gap-4">
                <h3 className="font-semibold text-lg">Informasi Kontak Anda</h3>
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" required />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" placeholder="08123456789" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" required />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="telegram">Username Telegram</Label>
                     <div className="relative">
                        <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="telegram" placeholder="@username_telegram" value={telegram} onChange={(e) => setTelegram(e.target.value)} className="pl-9" required />
                    </div>
                    <p className="text-xs text-muted-foreground pt-1">
                      Wajib diawali dengan '@'. Semua notifikasi penting akan dikirimkan ke Admin kami melalui Telegram.
                    </p>
                </div>
              </div>
              
              <Separator/>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ringkasan Pesanan</h3>
                 {orders.map(order => (
                    <div key={order.id} className="text-sm border border-dashed border-foreground/30 p-3 rounded-md">
                        <p className="font-bold text-base">{order.tier}</p>
                        <p className="text-xs text-muted-foreground font-mono">ID: ...{order.id.slice(-6)}</p>
                        <Separator className="my-2"/>
                        <div className="space-y-1">
                            {order.briefs.map((brief, index) => {
                                const product = getAllProducts().find(p => p.id === brief.productId);
                                const price = product?.promoPrice ?? product?.price ?? 0;
                                return (
                                    <div key={brief.instanceId} className="flex justify-between items-center">
                                        <p className="text-muted-foreground">{index + 1}. {brief.productName}</p>
                                        <p className="font-medium">Rp {price.toLocaleString('id-ID')}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                 ))}
              </div>
              <Separator/>
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                    <span>Total Pembayaran</span>
                    <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
                 <p className="text-xs text-muted-foreground text-right">Termasuk biaya penanganan &amp; kode unik.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 p-6 mt-6">
                 <div className="flex w-full gap-3">
                    <Button 
                        variant="outline"
                        onClick={handleBackToEdit}
                        className="w-full h-12 text-sm md:text-base font-bold border-2 border-foreground hover:bg-accent/10 flex-grow"
                        disabled={isSubmitting}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Kembali &amp; Ubah
                    </Button>
                    <Button 
                        onClick={handleProceedToPayment} 
                        disabled={!isFormValid || isSubmitting}
                        className={cn(
                            "w-full h-12 text-sm md:text-base font-bold border-2 border-foreground hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:shadow-none disabled:text-muted-foreground disabled:cursor-not-allowed",
                            isSubmitting ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/90"
                        )}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin mr-2" />
                                Memproses...
                            </>
                        ) : 'Lanjutkan ke Pembayaran'}
                    </Button>
                 </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="link" className="text-destructive font-bold text-sm" disabled={isSubmitting}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Batalkan Semua Pesanan
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <div className="w-full flex justify-center pt-4">
                            <Image 
                              src="https://placehold.co/120x120.png" 
                              alt="Ilustrasi pembatalan pesanan"
                              width={120} 
                              height={120}
                              data-ai-hint="sad warning character"
                            />
                        </div>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-2xl">Anda yakin ingin membatalkan?</AlertDialogTitle>
                          <AlertDialogDescription className="mt-2 text-base">
                            Tindakan ini akan membatalkan **SEMUA** pesanan dalam sesi ini dan tidak dapat diurungkan. Anda harus membuat pesanan baru jika berubah pikiran.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel>Tidak, kembali</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelOrder}
                            className={buttonVariants({ variant: "destructive" })}
                          >
                            Ya, Batalkan Semua
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
