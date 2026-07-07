import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";
import { getAllDirectRoutes } from "@/data/routes";
import { stations } from "@/data/stations";
import { trains } from "@/data/trains";
import { operatorsWithTrains } from "@/lib/operatorData";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE.url;

  const staticPages = [
    "", "/mersul-trenurilor", "/trenuri-azi", "/trenuri-maine", "/rute", "/statii",
    "/intarzieri-trenuri", "/harta-trenuri-live", "/operatori", "/blog", "/despre", "/surse-de-date",
  ].map((p) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.8 }));

  const operatorPages = operatorsWithTrains().map((o) => ({
    url: `${base}/operatori/${o.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7,
  }));

  const routePages = getAllDirectRoutes().map((r) => ({
    url: `${base}/rute/${r.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: r.isPopular ? 0.9 : 0.6,
  }));

  const stationPages = stations.flatMap((s) => [
    { url: `${base}/statii/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    ...(s.isMajor ? [
      { url: `${base}/plecari/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.5 },
      { url: `${base}/sosiri/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.5 },
    ] : []),
  ]);

  const trainPages = trains.map((t) => ({
    url: `${base}/tren/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5,
  }));

  return [...staticPages, ...operatorPages, ...routePages, ...stationPages, ...trainPages];
}
