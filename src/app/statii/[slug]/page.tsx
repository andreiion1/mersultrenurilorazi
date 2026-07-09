import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Board } from "@/components/Board";
import { StationMap } from "@/components/StationMap";
import { StationStats } from "@/components/StationStats";
import { StationWeather } from "@/components/StationWeather";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { stationBySlug, majorStations } from "@/data/stations";
import { departures, arrivals, todayISO } from "@/lib/schedule";
import { stationStats, popularDestinations } from "@/lib/stationStats";
import { routeSlug } from "@/lib/slug";
import { pageMeta, faqSchema, stationSchema } from "@/lib/seo";

export function generateStaticParams() {
  return majorStations().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  // Varianta ?tab=sosiri e duplicat al paginii de gară → noindex; canonical rămâne curat.
  const hasFilter = !!sp.tab;
  const s = stationBySlug(slug);
  if (!s) return pageMeta({ title: "Gară indisponibilă", description: "", path: `/statii/${slug}`, noindex: true });
  return pageMeta({
    title: `Gara ${s.name}: Plecări, Sosiri şi Orar Trenuri Azi`,
    description: `Orar gara ${s.name}: plecări şi sosiri azi, peroane şi trenuri spre toate destinațiile. Informații actualizate.`,
    path: `/statii/${s.slug}`,
    noindex: hasFilter,
  });
}

export default async function Page({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const s = stationBySlug(slug);
  if (!s) notFound();
  const today = todayISO();
  const tab = tabParam === "sosiri" ? "sosiri" : "plecari";
  const dep = departures(s.slug, today);
  const arr = arrivals(s.slug, today);

  // Destinații populare → doar orașele mari, ca destinație finală, ordonate după numărul de trenuri directe.
  const dests = popularDestinations(s.slug);
  const faq = [
    { q: `De unde văd plecările din Gara ${s.name}?`, a: `Toate plecările de azi sunt în tabelul de mai sus, cu ora, destinația, peronul şi statusul trenului.` },
    { q: `Câte peroane are Gara ${s.name}?`, a: s.platformsCount ? `Gara ${s.name} are aproximativ ${s.platformsCount} peroane.` : `Informația despre peroane va fi adăugată în curând.` },
  ];

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Gări", href: "/statii" }, { name: s.name }]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-strong md:text-3xl">Gara {s.name}: plecări, sosiri şi orar trenuri</h1>
          <p className="mt-1 text-muted">{s.city}, județul {s.county}</p>
        </div>
        <FavoriteButton item={{ kind: "station", slug: s.slug, label: `Gara ${s.name}`, sub: s.city, href: `/statii/${s.slug}` }} />
      </div>

      <div className="mt-5 inline-flex rounded-md border border-line bg-card p-1">
        <Link href={`/statii/${s.slug}?tab=plecari`} className={`rounded px-4 py-1.5 text-sm font-medium ${tab === "plecari" ? "bg-primary text-white" : "text-body"}`}>Plecări</Link>
        <Link href={`/statii/${s.slug}?tab=sosiri`} className={`rounded px-4 py-1.5 text-sm font-medium ${tab === "sosiri" ? "bg-primary text-white" : "text-body"}`}>Sosiri</Link>
      </div>

      <div className="mt-4">
        <Board rows={tab === "plecari" ? dep : arr} mode={tab === "plecari" ? "departures" : "arrivals"} />
      </div>

      <div className="mt-4 flex gap-3 text-sm">
        <Link href={`/plecari/${s.slug}`} className="font-medium text-primary hover:underline">Toate plecările →</Link>
        <Link href={`/sosiri/${s.slug}`} className="font-medium text-primary hover:underline">Toate sosirile →</Link>
      </div>

      <StationStats name={s.name} stats={stationStats(s.slug)} />

      {s.lat !== 0 && s.lng !== 0 && <StationWeather lat={s.lat} lng={s.lng} city={s.city} />}

      {dests.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Destinații populare din {s.name}</h2>
          <div className="flex flex-wrap gap-2">
            {dests.map((d) => (
              <Link key={d.slug} href={`/rute/${routeSlug(s.slug, d.slug)}`} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-body hover:border-primary hover:text-primary">{d.name}</Link>
            ))}
          </div>
        </>
      )}

      <StationMap name={s.name} city={s.city} county={s.county} mapQuery={s.mapQuery} />

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Întrebări frecvente</h2>
      <Faq items={faq} />
      <JsonLd data={faqSchema(faq)} />
      <JsonLd data={stationSchema(s.name, s.city, s.lat, s.lng)} />
    </Container>
  );
}
    