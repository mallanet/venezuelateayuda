import type { Metadata } from "next";
import { Nunito, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_OPEN_GRAPH_IMAGE, SITE_URL } from "@/lib/site";
import "./globals.css";

// Alineado con Mallanet.org: Nunito (display) + Source Sans 3 (cuerpo).
const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const display = Nunito({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Mapa de ayuda mutua en Venezuela`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Mallanet", url: "https://mallanet.org" }],
  creator: "Mallanet",
  publisher: "Mallanet",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Buscar y ofrecer ayuda en Venezuela`,
    description: SITE_DESCRIPTION,
    images: [SITE_OPEN_GRAPH_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Mapa de ayuda mutua`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "humanitarian",
  themeColor: "#0055AA",
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
      className={`${body.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans">
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
          <main id="contenido-principal" className="flex flex-1 flex-col" tabIndex={-1}>
            {children}
          </main>
          <SiteFooter />
          <Toaster richColors position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
