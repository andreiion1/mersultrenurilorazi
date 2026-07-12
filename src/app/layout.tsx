import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { CookieConsent } from "@/components/CookieConsent";
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
        {/* Google Consent Mode — implicit „denied", ÎNAINTE de AdSense/GA.
            CMP-ul certificat Google (via AdSense) actualizează consimțământul pentru UE. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}" +
              "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});" +
              "gtag('js',new Date());gtag('config','G-75E5MBPTYM',{anonymize_ip:true});",
          }}
        />
        {/* Google AdSense (include mesajul de consimțământ CMP pentru UE) */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3699715832199836"
          crossOrigin="anonymous"
        />
        {/* Google Analytics — respectă Consent Mode de mai sus */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-75E5MBPTYM" />
      </head>
      <body className="font-sans antialiased">
        <JsonLd data={websiteSchema()} />
        <Header />
        <main className="min-h-[60vh] pb-20 lg:pb-0">{children}</main>
        <Footer />
        <BottomNav />
        <CookieConsent />
      </body>
    </html>
  );
}