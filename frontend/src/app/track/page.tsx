
import { Suspense } from 'react';

import { OrderTracker } from '@/components/OrderTracker';

export default async function TrackPage({ searchParams }: { searchParams?: Promise<{ orderId?: string }> }): Promise<JSX.Element> {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams?.orderId ?? '';

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
