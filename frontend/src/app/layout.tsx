import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urgent Studio Official Final",
  description: "Dapatkan Desain Anda. Mendesak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={
          "min-h-screen bg-background font-body antialiased"
        }
      >
        {children}
      </body>
    </html>
  );
}
