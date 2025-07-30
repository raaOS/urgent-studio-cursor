import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/providers/auth-provider";
import { LoggerProvider } from "@/providers/LoggerProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ui/visual-consistency";

import { ClientLayout } from "@/components/layout/client-layout";

import "./globals.css";
import { poppins } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Urgent Studio Official - Desain Profesional & Cepat",
  description: "Dapatkan desain profesional berkualitas tinggi dengan layanan cepat dan terpercaya. Spesialis logo, branding, dan desain grafis.",
  keywords: "desain grafis, logo, branding, desain profesional, jasa desain",
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {

  return (
    <html lang="id" suppressHydrationWarning className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={
          "min-h-screen bg-background font-body antialiased"
        }
      >
        <LoggerProvider
          config={{
            enableConsole: process.env.NODE_ENV === 'development',
            enableRemote: process.env.NODE_ENV === 'production',
            level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          }}
        >
          <ErrorBoundary>
            <ThemeProvider>
              <AuthProvider>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </AuthProvider>
            </ThemeProvider>
          </ErrorBoundary>
        </LoggerProvider>
      </body>
    </html>
  );
}
