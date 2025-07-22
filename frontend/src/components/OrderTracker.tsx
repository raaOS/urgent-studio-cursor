
"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, Loader2, PackageCheck, PencilRuler, Wallet, XCircle, ShieldCheck } from "lucide-react";
import { getOrderById } from "@/services/orderService";
import type { Order } from "@/lib/types";

interface OrderTrackerProps {
  orderId: string;
}

const statusIcons: { [key: string]: JSX.Element } = {
  "Menunggu Pembayaran": <Wallet className="h-5 w-5 text-primary" />,
  "Pembayaran Sedang Diverifikasi": <ShieldCheck className="h-5 w-5 text-primary" />,
  "Pesanan Diterima": <CheckCircle className="h-5 w-5 text-primary" />,
  "Brief Sedang Ditinjau": <PackageCheck className="h-5 w-5 text-primary" />,
  "Desain Sedang Dikerjakan": <PencilRuler className="h-5 w-5 text-primary" />,
  "Pesanan Selesai": <CheckCircle className="h-5 w-5 text-green-600" />,
  "Dibatalkan": <XCircle className="h-5 w-5 text-destructive" />,
};

// Urutan status dari akhir ke awal untuk timeline
const allStatuses = ["Pesanan Selesai", "Desain Sedang Dikerjakan", "Brief Sedang Ditinjau", "Pesanan Diterima", "Pembayaran Sedang Diverifikasi", "Menunggu Pembayaran"];

interface TimelineItem {
    status: string;
    date: string | null;
    icon: JSX.Element;
    isComplete: boolean;
}

export function OrderTracker({ orderId: initialOrderId }: OrderTrackerProps) {
  const router = useRouter();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = useCallback(async (idToTrack: string) => {
    if (!idToTrack) {
      setError("Silakan masukkan ID Pesanan.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackedOrder(null);
    
    // Update URL tanpa reload halaman penuh
    router.replace(`/track?orderId=${idToTrack}`, { scroll: false });

    try {
      const orderData = await getOrderById(idToTrack);
      if (orderData) {
        setTrackedOrder(orderData);
      } else {
        setError("Pesanan tidak ditemukan. Silakan periksa kode dan coba lagi.");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Gagal mengambil data pesanan. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  useEffect(() => {
    if (initialOrderId) {
      handleTrackOrder(initialOrderId);
    }
  }, [initialOrderId, handleTrackOrder]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleTrackOrder(orderIdInput);
  };

  const getTimeline = (): TimelineItem[] => {
    if (!trackedOrder) return [];
    
    // Tentukan status mana yang akan ditampilkan berdasarkan status saat ini
    let statusesToShow = allStatuses;
    if (trackedOrder.status === 'Dibatalkan') {
      // Jika dibatalkan, hanya tampilkan status awal dan status pembatalan
      statusesToShow = ["Dibatalkan", "Menunggu Pembayaran"];
    }

    return statusesToShow.map((status) => {
        const historyTimestamp = trackedOrder.statusHistory?.[status];
        
        // Sebuah status dianggap "selesai" jika ada di dalam history.
        const isComplete = !!historyTimestamp;
        
        const date = historyTimestamp 
          ? new Date(historyTimestamp).toLocaleDateString("id-ID", {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }) + ' WIB'
          : null;
        
        const icon = isComplete ? statusIcons[status] : <Clock className="h-5 w-5 text-muted-foreground" />;

        return { status, date, icon, isComplete };
    }).reverse(); // Dibalik agar "Menunggu Pembayaran" ada di paling bawah
  }
  
  const timeline = getTimeline();

  return (
    <div className="container mx-auto max-w-xl py-12 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-center">Lacak Pesanan Anda</h1>
      <p className="text-muted-foreground text-center mt-2 mb-8 max-w-md mx-auto text-sm">Masukkan kode pesanan Anda untuk melihat status saat ini.</p>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Masukkan ID Pesanan lengkap..."
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
          className="h-11 text-base transition-shadow"
          disabled={isLoading}
        />
        <Button type="submit" className="h-11 text-base font-bold border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 shadow-neo hover:shadow-neo-hover active:shadow-neo-sm transition-all" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin"/> : 'Lacak'}
        </Button>
      </form>

      {error && !isLoading && (
        <Card className="border-2 border-destructive bg-destructive/10 text-destructive-foreground shadow-neo">
          <CardContent className="p-4">
            <p className="font-semibold text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {trackedOrder && (
        <Card className="border-2 border-foreground shadow-neo">
          <CardHeader>
            <CardTitle className="text-2xl">Riwayat Pesanan</CardTitle>
            <CardDescription className="font-mono text-sm pt-1">ID: {trackedOrder.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {/* Garis vertikal timeline */}
              <div className="absolute left-[35px] top-5 h-[calc(100%-2.5rem)] w-0.5 bg-foreground/20 -translate-x-1/2" />
              <ul className="space-y-8">
                {timeline.map((item, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${item.isComplete ? (item.status === 'Dibatalkan' ? 'border-destructive bg-background' : 'border-primary bg-background') : 'border-foreground/20 bg-muted'}`}>
                      {item.icon}
                    </div>
                    <div className="pt-2">
                      <p className={`font-bold text-base ${!item.isComplete && 'text-muted-foreground'}`}>{item.status}</p>
                      <p className="text-sm text-muted-foreground">{item.date || 'Menunggu pembaruan...'}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
