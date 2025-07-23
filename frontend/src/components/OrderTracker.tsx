
'use client';

import { CheckCircle, Clock, Loader2, PackageCheck, PencilRuler, ShieldCheck, Wallet, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getOrderById } from '@/services/orderService';

// Interfaces
interface OrderTrackerProps {
  orderId: string;
}

interface Order {
  id: string;
  status: string;
  statusHistory?: Record<string, string>;
}

interface TimelineItem {
  status: string;
  date: string | null;
  icon: JSX.Element;
  isComplete: boolean;
}

// Constants
const STATUS_ICONS: Record<string, JSX.Element> = {
  'Menunggu Pembayaran': <Wallet className="h-5 w-5 text-primary" />,
  'Pembayaran Sedang Diverifikasi': <ShieldCheck className="h-5 w-5 text-primary" />,
  'Pesanan Diterima': <CheckCircle className="h-5 w-5 text-primary" />,
  'Brief Sedang Ditinjau': <PackageCheck className="h-5 w-5 text-primary" />,
  'Desain Sedang Dikerjakan': <PencilRuler className="h-5 w-5 text-primary" />,
  'Pesanan Selesai': <CheckCircle className="h-5 w-5 text-green-600" />,
  'Dibatalkan': <XCircle className="h-5 w-5 text-destructive" />,
} as const;

// Status order from end to beginning for timeline
const ALL_STATUSES: readonly string[] = [
  'Pesanan Selesai',
  'Desain Sedang Dikerjakan',
  'Brief Sedang Ditinjau',
  'Pesanan Diterima',
  'Pembayaran Sedang Diverifikasi',
  'Menunggu Pembayaran'
] as const;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as const;

// Helper functions
function isValidOrder(data: unknown): data is Order {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const order = data as Record<string, unknown>;
  return (
    typeof order.id === 'string' &&
    typeof order.status === 'string' &&
    (order.statusHistory === undefined || typeof order.statusHistory === 'object')
  );
}

function formatDate(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', DATE_FORMAT_OPTIONS) + ' WIB';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Tanggal tidak valid';
  }
}

function getStatusesToShow(orderStatus: string): readonly string[] {
  if (orderStatus === 'Dibatalkan') {
    // If cancelled, only show initial status and cancellation status
    return ['Dibatalkan', 'Menunggu Pembayaran'] as const;
  }
  return ALL_STATUSES;
}

// Main Component
export function OrderTracker({ orderId: initialOrderId }: OrderTrackerProps): JSX.Element {
  const router = useRouter();
  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId || '');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleTrackOrder = useCallback(async (idToTrack: string): Promise<void> => {
    if (!idToTrack) {
      setError('Silakan masukkan ID Pesanan.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackedOrder(null);
    
    // Update URL without full page reload
    void router.replace(`/track?orderId=${idToTrack}`, { scroll: false });

    try {
      const orderData: unknown = await getOrderById(idToTrack);
      if (isValidOrder(orderData)) {
        setTrackedOrder(orderData);
      } else {
        setError('Pesanan tidak ditemukan. Silakan periksa kode dan coba lagi.');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Gagal mengambil data pesanan. Silakan coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  useEffect((): void => {
    if (initialOrderId) {
      void handleTrackOrder(initialOrderId);
    }
  }, [initialOrderId, handleTrackOrder]);

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    void handleTrackOrder(orderIdInput);
  };

  const getTimeline = (): TimelineItem[] => {
    if (!trackedOrder) {
      return [];
    }
    
    // Determine which statuses to show based on current status
    const statusesToShow = getStatusesToShow(trackedOrder.status);

    return statusesToShow.map((status: string): TimelineItem => {
      const historyTimestamp = trackedOrder.statusHistory?.[status];
      
      // A status is considered "complete" if it exists in history
      const isComplete = Boolean(historyTimestamp);
      
      const date = historyTimestamp ? formatDate(historyTimestamp) : null;
      
      const icon = isComplete 
        ? (STATUS_ICONS[status] || <Clock className="h-5 w-5 text-muted-foreground" />) 
        : <Clock className="h-5 w-5 text-muted-foreground" />;

      return { status, date, icon, isComplete };
    }).reverse(); // Reverse so "Menunggu Pembayaran" is at the bottom
  };
  
  const timeline = getTimeline();

  return (
    <div className="container mx-auto max-w-xl py-12 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-center">
        Lacak Pesanan Anda
      </h1>
      <p className="text-muted-foreground text-center mt-2 mb-8 max-w-md mx-auto text-sm">
        Masukkan kode pesanan Anda untuk melihat status saat ini.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Masukkan ID Pesanan lengkap..."
          value={orderIdInput}
          onChange={(e): void => setOrderIdInput(e.target.value)}
          className="h-11 text-base transition-shadow"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="h-11 text-base font-bold border-2 border-foreground bg-primary text-primary-foreground hover:bg-primary/90 shadow-neo hover:shadow-neo-hover active:shadow-neo-sm transition-all" 
          disabled={isLoading}
        >
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
            <CardDescription className="font-mono text-sm pt-1">
              ID: {trackedOrder.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
              {/* Vertical timeline line */}
              <div className="absolute left-[35px] top-5 h-[calc(100%-2.5rem)] w-0.5 bg-foreground/20 -translate-x-1/2" />
              <ul className="space-y-8">
                {timeline.map((item: TimelineItem, index: number): JSX.Element => (
                  <li key={index} className="flex items-start gap-4">
                    <div 
                      className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                        item.isComplete 
                          ? (item.status === 'Dibatalkan' 
                              ? 'border-destructive bg-background' 
                              : 'border-primary bg-background'
                            ) 
                          : 'border-foreground/20 bg-muted'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="pt-2">
                      <p className={`font-bold text-base ${!item.isComplete && 'text-muted-foreground'}`}>
                        {item.status}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.date || 'Menunggu pembaruan...'}
                      </p>
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
