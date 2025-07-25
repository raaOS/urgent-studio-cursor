import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk menangani permintaan ke /@vite/client dan /payment-client
 * @param request - Objek permintaan Next.js
 * @returns Respons Next.js yang sesuai berdasarkan jalur permintaan
 */
export function middleware(request: NextRequest): NextResponse {
  // Jika permintaan ke /@vite/client, kembalikan respons kosong
  if (request.nextUrl.pathname === '/@vite/client') {
    return new NextResponse(null, { status: 200 });
  }

  // Jika permintaan ke /payment-client, redirect ke halaman utama
  if (request.nextUrl.pathname === '/payment-client') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Lanjutkan dengan permintaan normal
  return NextResponse.next();
}

/**
 * Konfigurasi untuk menentukan jalur mana yang harus diproses oleh middleware
 */
export const config = {
  matcher: ['/@vite/client', '/payment-client', '/payment-client/:path*'],
};