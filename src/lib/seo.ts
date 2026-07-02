import type { Metadata } from "next";

export const SITE = {
  name: "Mersul Trenurilor la Zi",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mersultrenurilorlazi.ro",
  defaultDescription:
    "Caută mersul trenurilor între orice stații din România. Orar complet, întârzieri, trenuri azi și mâine, bilete. Rapid pe mobil.",
};

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = SITE.url + opts.path;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE.name,
      locale: "ro_RO",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function stationSchema(name: string, city: string, lat: number, lng: number) {
  return {
    "@context": "https://schema.org",
    "@type": "TrainStation",
    name,
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "RO" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url + "/",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/cautare?from={from}&to={to}`,
      "query-input": "required name=from",
    },
  };
}
