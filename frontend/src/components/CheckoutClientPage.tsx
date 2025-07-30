
'use client';

import { ArrowLeft, Home, Loader2, Phone, Send, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { getAllProducts, ProductMaster } from '@/lib/products';
import { cn } from '@/lib/utils';
import { getOrderById, updateOrderWithCustomerInfo, deleteOrder } from '@/services/orderService';

interface CheckoutClientPageProps {
  orderIds: string[];
}

interface OrderData {
  id: string;
  tier: string;
  totalAmount: number;
  briefs: BriefData[];
}

interface BriefData {
  instanceId: string;
  productId: string;
  productName: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  telegram: string;
}

const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  PHONE_MIN_LENGTH: 10,
  TELEGRAM_PREFIX: '@',
} as const;

function validateCustomerInfo(customerInfo: CustomerInfo): boolean {
  const { name, phone, telegram } = customerInfo;
  
  return (
    name.trim().length >= VALIDATION_RULES.NAME_MIN_LENGTH &&
    phone.trim().length >= VALIDATION_RULES.PHONE_MIN_LENGTH &&
    telegram.trim().startsWith(VALIDATION_RULES.TELEGRAM_PREFIX) &&
    telegram.trim().length > 1
  );
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('id-ID');
}

function getOrderIdSuffix(orderId: string): string {
  return orderId.slice(-6);
}

export default function CheckoutClientPage({ orderIds }: CheckoutClientPageProps): JSX.Element | null {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Customer form state
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [telegram, setTelegram] = useState<string>('');

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function loadOrders(): Promise<void> {
      try {
        setLoading(true);
        setError('');

        if (!orderIds || orderIds.length === 0) {
          setError('Tidak ada pesanan yang ditemukan.');
          return;
        }

        const orderPromises = orderIds.map(async (orderId): Promise<OrderData | null> => {
          try {
            const order = await getOrderById(orderId);
            if (order === null || order === undefined) {
              return null;
            }

            return {
              id: order.id,
              tier: order.tier || 'standard',
              totalAmount: order.totalAmount,
              briefs: order.briefs.map((brief): BriefData => ({
                instanceId: brief.instanceId,
                productId: brief.productId,
                productName: brief.productName,
              })),
            };
          } catch (orderError) {
            console.error(`Failed to load order ${orderId}:`, orderError);
            return null;
          }
        });

        const orderResults = await Promise.all(orderPromises);
        const validOrders = orderResults.filter((order): order is OrderData => order !== null);

        if (validOrders.length === 0) {
          setError('Tidak ada pesanan yang valid ditemukan.');
          return;
        }

        setOrders(validOrders);
      } catch (loadError) {
        console.error('Failed to load orders:', loadError);
        setError('Gagal memuat pesanan. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, [orderIds]);

  async function handleProceedToPayment(): Promise<void> {
    const customerInfo: CustomerInfo = { name, phone, telegram };
    
    if (!validateCustomerInfo(customerInfo)) {
      toast({
        variant: 'destructive',
        title: 'Data Tidak Valid',
        description: 'Pastikan semua field diisi dengan benar.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const updatePromises = orders.map(async (order): Promise<void> => {
        await updateOrderWithCustomerInfo(order.id, customerInfo);
      });

      await Promise.all(updatePromises);

      const orderIdsParam = orders.map((order): string => order.id).join(',');
      router.push(`/payment?orders=${orderIdsParam}`);
    } catch (updateError) {
      console.error('Failed to update orders:', updateError);
      toast({
        variant: 'destructive',
        title: 'Gagal Memproses',
        description: 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBackToEdit(): void {
    const orderIdsParam = orders.map((order): string => order.id).join(',');
    router.push(`/brief?orders=${orderIdsParam}`);
  }

  async function handleCancelOrder(): Promise<void> {
    try {
      setIsSubmitting(true);

      const deletePromises = orders.map(async (order): Promise<void> => {
        await deleteOrder(order.id);
      });

      await Promise.all(deletePromises);

      toast({
        title: 'Pesanan Dibatalkan',
        description: 'Semua pesanan telah berhasil dibatalkan.',
      });

      router.push('/');
    } catch (cancelError) {
      console.error('Failed to cancel order:', cancelError);
      toast({
        variant: 'destructive',
        title: 'Gagal Membatalkan',
        description: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const customerInfo: CustomerInfo = { name, phone, telegram };
  const isFormValid = validateCustomerInfo(customerInfo);
  const totalAmount = orders.reduce((acc, order): number => acc + order.totalAmount, 0);

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
                  <Home className="mr-2" /> Kembali ke Beranda
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
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={name} 
                      onChange={(e): void => setName(e.target.value)} 
                      className="pl-9" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor Telepon (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      placeholder="08123456789" 
                      value={phone} 
                      onChange={(e): void => setPhone(e.target.value)} 
                      className="pl-9" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telegram">Username Telegram</Label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="telegram" 
                      placeholder="@username_telegram" 
                      value={telegram} 
                      onChange={(e): void => setTelegram(e.target.value)} 
                      className="pl-9" 
                      required 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Wajib diawali dengan &apos;@&apos;. Semua notifikasi penting akan dikirimkan ke Admin kami melalui Telegram.
                  </p>
                </div>
              </div>
              
              <Separator />

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Ringkasan Pesanan</h3>
                {orders.map((order): JSX.Element => (
                  <div key={order.id} className="text-sm border border-dashed border-foreground/30 p-3 rounded-md">
                    <p className="font-bold text-base">{order.tier}</p>
                    <p className="text-xs text-muted-foreground font-mono">ID: ...{getOrderIdSuffix(order.id)}</p>
                    <Separator className="my-2" />
                    <div className="space-y-1">
                      {order.briefs.map((brief, index): JSX.Element => {
                        const product = getAllProducts().find((p: ProductMaster): boolean => p.id === brief.productId);
                        const price = product?.price ?? 0;
                        return (
                          <div key={brief.instanceId} className="flex justify-between items-center">
                            <p className="text-muted-foreground">{index + 1}. {brief.productName}</p>
                            <p className="font-medium">Rp {formatCurrency(price)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Pembayaran</span>
                  <span>Rp {formatCurrency(totalAmount)}</span>
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
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali &amp; Ubah
                </Button>
                <Button 
                  onClick={(): void => { void handleProceedToPayment(); }} 
                  disabled={!isFormValid || isSubmitting}
                  className={cn(
                    "w-full h-12 text-sm md:text-base font-bold border-2 border-foreground hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:shadow-none disabled:text-muted-foreground disabled:cursor-not-allowed",
                    isSubmitting ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground hover:bg-accent/90"
                  )}
                >
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
                      onClick={(): void => { void handleCancelOrder(); }}
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
