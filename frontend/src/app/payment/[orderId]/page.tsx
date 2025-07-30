
import { Suspense } from "react";

import PaymentClientPage from "@/components/PaymentClientPage";

// Halaman Pembayaran sekarang menerima beberapa orderId melalui parameter dinamis.
// Ini diperlukan untuk alur "Keranjang Global" di mana satu sesi checkout
// bisa menghasilkan beberapa pesanan terpisah (satu per tier).

async function PaymentPageComponent({ params }: { params: Promise<{ orderId: string }> }): Promise<JSX.Element> {
    const resolvedParams = await params;
    const orderIdsParam = resolvedParams.orderId || '';

    if (!orderIdsParam) {
        // Handle case where orderId is missing.
        return (
            <div className="flex min-h-screen w-full items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold text-destructive">ID Pesanan Tidak Valid.</h1>
                <p className="text-muted-foreground">Silakan kembali ke beranda dan coba lagi.</p>
            </div>
        );
    }
    
    // Pisahkan string menjadi array ID
    const _orderIds = orderIdsParam.split(',');

    return <PaymentClientPage orderIds={_orderIds} />;
}


export default async function PaymentPage({ params }: { params: Promise<{ orderId: string }> }) {
    return (
        <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center">Memuat Halaman Pembayaran...</div>}>
            <PaymentPageComponent params={params} />
        </Suspense>
    )
}
