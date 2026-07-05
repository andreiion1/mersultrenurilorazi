import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { CookieConsent } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { websiteSchema, SITE } from "@/lib/seo";

// Font self-hosted (fără request blocant către fonts.googleapis.com) + display swap.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Mersul Trenurilor la Zi: Orar Trenuri CFR, Întârzieri și Bilete",
    template: "%s | Mersul Trenurilor la Zi",
  },
  description: SITE.defaultDescription,
  applicationName: SITE.name,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={inter.variable} suppressHydrationWarning>
      <head>
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