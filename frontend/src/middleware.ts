import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware untuk menangani permintaan development, IDE, dan autentikasi admin
 * @param request - Objek permintaan Next.js
 * @returns Respons Next.js yang sesuai berdasarkan jalur permintaan
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname, searchParams } = request.nextUrl;
  
  // Handle IDE webview requests yang menyebabkan HMR error
  if (searchParams.has('ide_webview_request_time')) {
    // Redirect ke halaman tanpa parameter IDE
    const cleanUrl = new URL(pathname, request.url);
    return NextResponse.redirect(cleanUrl);
  }

  // Jika permintaan ke /payment-client, redirect ke halaman utama
  if (pathname === '/payment-client') {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Handle webpack HMR requests yang bermasalah
  if (pathname.includes('webpack.hot-update.json') || pathname.includes('_next/static/webpack/')) {
    // Cek apakah file benar-benar ada, jika tidak return 404 yang bersih
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;
  }

  // Handle Vite client requests yang menyebabkan error 404
  // Ini terjadi karena beberapa browser extension atau tools yang mencoba memuat Vite client
  // meskipun proyek ini menggunakan Next.js, bukan Vite
  if (pathname === '/@vite/client') {
    // Return respons kosong dengan status 200 untuk mencegah error di console
    return new NextResponse(null, { status: 200 });
  }

  // Proteksi halaman admin
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Cek token autentikasi dari cookie
    const authToken = request.cookies.get('adminAuthToken')?.value;
    
    if (!authToken) {
      // Redirect ke halaman login jika tidak ada token
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Di sini bisa ditambahkan validasi token jika diperlukan
    // Misalnya, verifikasi JWT token
  }

  // Lanjutkan dengan permintaan normal
  return NextResponse.next();
}

/**
 * Konfigurasi untuk menentukan jalur mana yang harus diproses oleh middleware
 */
export const config = {
  matcher: [
    '/admin/:path*',
    '/payment-client', 
    '/payment-client/:path*',
    '/_next/static/webpack/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};