import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, SITE } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Mersul Trenurilor la Zi — Orar Trenuri CFR, Întârzieri și Bilete",
    template: "%s | Mersul Trenurilor la Zi",
  },
  description: SITE.defaultDescription,
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#061127" />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={websiteSchema()} />
        <Header />
        <main className="min-h-[60vh] pb-20 lg:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
