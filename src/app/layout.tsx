import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ControL-D - AI Health Companion",
  description: "A comprehensive healthcare management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-black text-white relative overflow-x-hidden" suppressHydrationWarning>
        {/* Luxury Monochrome Background Canvas (Optimized for performance) */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 25% 0%, rgba(63, 63, 70, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 100%, rgba(63, 63, 70, 0.1) 0%, transparent 50%), #000000'
          }}
          suppressHydrationWarning
        />

        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
