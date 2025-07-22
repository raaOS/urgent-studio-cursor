
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderById, confirmPayment } from '@/services/orderService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Order } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function PaymentClientPage({ orderIds }: { orderIds: string[] }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bankDetails = {
    name: "PT URGENT STUDIO KREATIF",
    accountNumber: "1234567890",
    bank: "BCA"
  };

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
          } else {
            // Cek apakah ada pesanan yang statusnya tidak lagi 'Menunggu Pembayaran'
            const alreadyProcessed = validOrders.some(o => o.status !== 'Menunggu Pembayaran');
            if (alreadyProcessed) {
                setError("Pesanan ini sudah diproses. Anda akan diarahkan ke halaman pelacakan.");
                setTimeout(() => {
                    router.push(`/track?orderId=${orderIds[0]}`);
                }, 3000);
            } else {
                setOrders(validOrders);
            }
          }
        } catch (err) {
          setError("Gagal memuat data pesanan.");
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    } else {
        setError("ID Pesanan tidak ditemukan di URL.");
        setLoading(false);
    }
  }, [orderIds, router]);

  const handlePaymentConfirmation = async () => {
    setIsConfirming(true);
    try {
        await confirmPayment(orderIds);
        toast({
            title: "Konfirmasi Terkirim!",
            description: "Tim kami akan segera memverifikasi pembayaran Anda. Status pesanan telah diperbarui.",
        });
        router.push(`/track?orderId=${orderIds[0]}`);
    } catch(e) {
        console.error("Gagal mengonfirmasi pembayaran:", e);
        toast({
            variant: "destructive",
            title: "Konfirmasi Gagal",
            description: "Terjadi kesalahan. Silakan coba lagi atau hubungi bantuan.",
        });
        setIsConfirming(false);
    }
  };

  const totalAmount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat instruksi pembayaran...</p>
      </div>
    );
  }

  if (error || orders.length === 0) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="bg-background border-b-2 border-foreground">
            <div className="container flex h-16 items-center justify-end" />
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md mx-auto w-full border-2 border-foreground shadow-neo">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Terjadi Kesalahan</CardTitle>
              <CardDescription>{error || "Pesanan tidak dapat ditampilkan."}</CardDescription>
            </CardHeader>
             <CardFooter>
              <Button asChild className="w-full font-bold">
                <Link href="/">
                    Kembali ke Beranda
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="bg-background border-b-2 border-foreground">
            <div className="container flex h-16 items-center justify-end" />
        </header>
      <main className="flex-1 py-16 sm:py-24">
        <div className="container mx-auto max-w-xl px-4">
          <Card className="border-2 border-foreground shadow-neo">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold tracking-tighter">Selesaikan Pembayaran</CardTitle>
              <CardDescription className="text-sm mt-2">
                Silakan transfer sejumlah total pembayaran ke rekening berikut.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="rounded-lg border-2 border-dashed border-foreground p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">TOTAL PEMBAYARAN</p>
                    <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-bold text-primary tracking-tight">Rp {totalAmount.toLocaleString('id-ID')}</p>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">
                        Jumlah ini adalah total dari {orders.length} pesanan Anda.
                    </p>
                </div>
                
                <div className="bg-muted p-3 rounded-lg flex items-start gap-3 text-sm">
                    <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-muted-foreground">Pastikan Anda mentransfer **dengan nominal yang sama persis** agar pembayaran Anda dapat diverifikasi secara otomatis oleh sistem kami.</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Bank</Label>
                        <p className="font-bold text-lg">{bankDetails.bank}</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <Label className="text-base">Nama Penerima</Label>
                        <p className="font-bold text-lg">{bankDetails.name}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Nomor Rekening</Label>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-lg">{bankDetails.accountNumber}</p>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="text-center space-y-2">
                    <h3 className="font-semibold">Perlu Bantuan?</h3>
                    <p className="text-sm text-muted-foreground">
                        Jika Anda sudah transfer namun status belum berubah dalam 1x24 jam, silakan hubungi kami via Telegram.
                    </p>
                    <Button asChild className="w-full sm:w-auto font-bold border-2 border-foreground bg-[#2AABEE] text-white hover:bg-[#259cd1] shadow-neo-sm">
                        <a href="https://t.me/your_telegram_bot" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2"/>
                            Hubungi Bantuan
                        </a>
                    </Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 p-6">
                <Button 
                    onClick={handlePaymentConfirmation}
                    disabled={isConfirming}
                    className={cn(
                        "w-full h-12 text-base font-bold border-2 border-foreground hover:shadow-neo-hover active:shadow-neo-sm transition-all disabled:bg-muted disabled:shadow-none disabled:text-muted-foreground disabled:cursor-not-allowed",
                        "bg-accent text-accent-foreground hover:bg-accent/90"
                    )}>
                    {isConfirming ? (
                        <>
                            <Loader2 className="animate-spin mr-2"/>
                            Mengonfirmasi...
                        </>
                    ) : (
                         <>
                            <ShieldCheck className="mr-2"/>
                            Saya Sudah Transfer, Konfirmasi Sekarang
                         </>
                    )}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
