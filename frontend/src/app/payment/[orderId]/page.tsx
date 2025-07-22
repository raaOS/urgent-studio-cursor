
import { PaymentClientPage } from "@/components/PaymentClientPage";
import { Suspense } from "react";

// Halaman Pembayaran sekarang menerima beberapa orderId melalui parameter dinamis.
// Ini diperlukan untuk alur "Keranjang Global" di mana satu sesi checkout
// bisa menghasilkan beberapa pesanan terpisah (satu per tier).

function PaymentPageComponent({ params }: { params: { orderId: string } }) {
    const orderIdsParam = params.orderId || '';

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
    const orderIds = orderIdsParam.split(',');

    return <PaymentClientPage orderIds={orderIds} />;
}


export default function PaymentPage({ params }: { params: { orderId: string } }) {
    return (
        <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center">Memuat Halaman Pembayaran...</div>}>
            <PaymentPageComponent params={params} />
        </Suspense>
    )
}
