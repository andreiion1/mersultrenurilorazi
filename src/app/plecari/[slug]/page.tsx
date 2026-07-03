import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Board } from "@/components/Board";
import { stations, stationBySlug } from "@/data/stations";
import { departures, todayISO } from "@/lib/schedule";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return stations.filter((s) => s.isMajor).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = stationBySlug(slug);
  if (!s) return pageMeta({ title: "Indisponibil", description: "", path: `/plecari/${slug}`, noindex: true });
  return pageMeta({
    title: `Plecări Gara ${s.name}: Orar Trenuri Azi și Întârzieri`,
    description: `Toate plecările din Gara ${s.name} azi: ore, destinații, peroane, întârzieri și status.`,
    path: `/plecari/${s.slug}`,
    noindex: !s.isMajor,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = stationBySlug(slug);
  if (!s) notFound();
  const rows = departures(s.slug, todayISO());
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Gări", href: "/statii" }, { name: s.name, href: `/statii/${s.slug}` }, { name: "Plecări" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Plecări trenuri azi din Gara {s.name}</h1>
      <div className="mt-4"><Board rows={rows} mode="departures" /></div>
    </Container>
  );
}
