import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venezuela Te Ayuda — Mapa de ayuda mutua",
  description:
    "Plataforma que conecta a personas que ofrecen ayuda con personas que la necesitan en Venezuela, a través de un mapa de ayuda mutua verificado.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-731PM4G1GS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-731PM4G1GS');
          `}
        </Script>
        <SessionProvider session={session}>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <SiteFooter />
          <Toaster richColors position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
