import { Suspense } from 'react';
import MayarPaymentPage from '@/components/MayarPaymentPage';

interface MayarPaymentPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function MayarPaymentRoute({ params }: MayarPaymentPageProps): Promise<JSX.Element> {
  const { orderId } = await params;
  
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Memuat halaman pembayaran...</p>
      </div>
    }>
      <MayarPaymentPage orderId={orderId} />
    </Suspense>
  );
}