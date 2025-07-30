
import { Suspense } from "react";
import CheckoutClientPage from "@/components/CheckoutClientPage";
import { Container, Typography } from '@/components/ui/visual-consistency';
import { StaggerContainer } from '@/components/ui/micro-interactions';
import LoadingSkeleton from '@/components/ui/loading';

// Define the type for searchParams directly in the page component.
// This is the standard and safest way for Next.js 14 App Router.
interface CheckoutSummaryPageProps {
  searchParams?: Promise<{
    orderIds?: string;
  }>;
}

const CheckoutLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Container className="py-8">
      <div className="text-center mb-8">
        <LoadingSkeleton className="h-8 w-64 mx-auto mb-4" />
        <LoadingSkeleton className="h-4 w-96 mx-auto" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <LoadingSkeleton className="h-32 w-full" />
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-16 w-full" />
        </div>
        <div className="space-y-4">
          <LoadingSkeleton className="h-48 w-full" />
          <LoadingSkeleton className="h-12 w-full" />
        </div>
      </div>
    </Container>
  </div>
);

export default async function CheckoutSummaryPage({ searchParams }: CheckoutSummaryPageProps): Promise<JSX.Element> {
  const resolvedSearchParams = await (searchParams ?? Promise.resolve({ orderIds: undefined }));
  const orderIdsParam = resolvedSearchParams?.orderIds ?? "";

  if (!orderIdsParam || orderIdsParam === "") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Container className="py-8">
          <StaggerContainer>
            <div className="text-center max-w-md mx-auto">
              <div className="text-6xl mb-6">❌</div>
              <Typography 
                variant="h1" 
                className="text-3xl font-bold text-destructive mb-4"
              >
                ID Pesanan Tidak Ditemukan
              </Typography>
              <Typography 
                variant="body" 
                className="text-muted-foreground"
              >
                URL checkout Anda tidak lengkap. Silakan kembali ke beranda dan coba lagi.
              </Typography>
            </div>
          </StaggerContainer>
        </Container>
      </div>
    );
  }

  const orderIds = orderIdsParam.split(",");

  return (
    <Suspense fallback={<CheckoutLoadingFallback />}>
      <CheckoutClientPage orderIds={orderIds} />
    </Suspense>
  );
}
