
import { OrderTracker } from '@/components/OrderTracker';
import { Suspense } from 'react';

export default function TrackPage({ searchParams }: { searchParams?: { orderId?: string } }) {
  const orderId = searchParams?.orderId || '';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1">
        <Suspense fallback={<div className="container mx-auto max-w-xl py-12 px-4 text-center">Memuat pelacak...</div>}>
            <OrderTracker orderId={orderId} />
        </Suspense>
      </main>
    </div>
  );
}
