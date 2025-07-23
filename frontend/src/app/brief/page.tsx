
import { Suspense } from 'react';

import { BriefForm } from '@/components/BriefForm';

// Halaman Brief sekarang menjadi Server Component yang sangat sederhana.
// Ia tidak lagi memerlukan logic untuk membaca searchParams karena
// semua data keranjang akan dibaca oleh BriefForm di sisi client
// dari sessionStorage.

export default function BriefPage(): JSX.Element {
    return (
        <Suspense fallback={<div className="flex min-h-screen w-full items-center justify-center">Memuat Form Brief...</div>}>
            <BriefForm />
        </Suspense>
    )
}
