import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Board } from "@/components/Board";
import { stations, stationBySlug } from "@/data/stations";
import { arrivals, todayISO } from "@/lib/schedule";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return stations.filter((s) => s.isMajor).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = stationBySlug(slug);
  if (!s) return pageMeta({ title: "Indisponibil", description: "", path: `/sosiri/${slug}`, noindex: true });
  return pageMeta({
    title: `Sosiri Gara ${s.name} — Orar Trenuri Azi și Întârzieri`,
    description: `Toate sosirile în Gara ${s.name} azi: ore, proveniență, peroane, întârzieri și status.`,
    path: `/sosiri/${s.slug}`,
    noindex: !s.isMajor,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = stationBySlug(slug);
  if (!s) notFound();
  const rows = arrivals(s.slug, todayISO());
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Gări", href: "/statii" }, { name: s.name, href: `/statii/${s.slug}` }, { name: "Sosiri" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Sosiri trenuri în Gara {s.name} — azi</h1>
      <div className="mt-4"><Board rows={rows} mode="arrivals" /></div>
    </Container>
  );
}
