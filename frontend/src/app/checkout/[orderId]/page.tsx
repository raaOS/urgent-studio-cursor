
"use client";
// This file is intentionally left blank. 
// The checkout logic has been moved to /checkout/summary/page.tsx to handle multiple order IDs via searchParams.
// This prevents conflicts with Next.js dynamic routing and provides a clearer URL structure for the user.

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DeprecatedCheckoutPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main page or a more appropriate fallback.
    // This page should ideally not be reached.
    router.replace('/');
  }, [router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Mengarahkan ulang...</p>
    </div>
  );
}
