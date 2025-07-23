import type { Metadata } from "next";

import "./globals.css";
import { poppins } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Urgent Studio Official Final",
  description: "Dapatkan Desain Anda. Mendesak.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="id" suppressHydrationWarning className={poppins.variable}>
      <head />
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
