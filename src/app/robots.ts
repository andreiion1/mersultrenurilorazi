import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // "/*?" blochează orice URL cu parametri (?sort=, ?directe=, ?data=, ?tab= etc.) —
      // sunt variații de filtrare, duplicate. Paginile curate rămân crawlabile.
      { userAgent: "*", allow: "/", disallow: ["/api/", "/favorite", "/cautare", "/*?"] },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
