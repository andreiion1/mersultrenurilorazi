import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrainResultCard } from "@/components/TrainResultCard";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { getRouteBySlug, getAllDirectRoutes } from "@/data/routes";
import { search, todayISO, formatDuration } from "@/lib/schedule";
import { pageMeta, faqSchema } from "@/lib/seo";

const YEAR = new Date().getFullYear();

export function generateStaticParams() {
  return getAllDirectRoutes().slice(0, 100).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = getRouteBySlug(slug);
  if (!r) return pageMeta({ title: "Rută indisponibilă", description: "", path: `/rute/${slug}`, noindex: true });
  return pageMeta({
    title: `Tren ${r.fromCity} ${r.toCity} — Orar, Preț Bilet și Durată ${YEAR}`,
    description: `Toate trenurile ${r.fromCity}–${r.toCity} azi. ${r.dailyTrainsCount} trenuri/zi, durată de la ${formatDuration(r.minDurationMin)}, ${r.distanceKm} km. Directe și cu schimbări. Cumpără bilet.`,
    path: `/rute/${r.slug}`,
    noindex: !r.hasDirect,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRouteBySlug(slug);
  if (!r) notFound();
  const today = todayISO();
  const result = search(r.fromSlug, r.toSlug, today);
  const fastest = result.all.length ? Math.min(...result.all.map((x) => x.totalDurationMin)) : 0;

  const faq = [
    { q: `Cât durează trenul ${r.fromCity}–${r.toCity}?`, a: `Cel mai rapid tren parcurge ruta în aproximativ ${formatDuration(r.minDurationMin)}. Durata medie este de circa ${formatDuration(r.avgDurationMin)}.` },
    { q: `Câte trenuri sunt pe zi pe ruta ${r.fromCity}–${r.toCity}?`, a: `Circulă aproximativ ${r.dailyTrainsCount} trenuri directe pe zi. Distanța este de ${r.distanceKm} km.` },
    { q: `Există trenuri directe ${r.fromCity}–${r.toCity}?`, a: r.hasDirect ? "Da, există trenuri directe pe această rută." : "Nu există trenuri directe; ruta necesită cel puțin o schimbare." },
    { q: "De unde cumpăr biletul?", a: "Apasă „Cumpără bilet” pe oricare tren pentru a fi direcționat către platforma oficială CFR Călători." },
  ];

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Rute", href: "/rute" }, { name: `${r.fromCity}–${r.toCity}` }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Tren {r.fromCity} – {r.toCity}: orar, durată și bilete</h1>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Trenuri/zi" value={`${r.dailyTrainsCount}`} />
        <Stat label="Cel mai rapid" value={formatDuration(r.minDurationMin)} />
        <Stat label="Distanță" value={`${r.distanceKm} km`} />
        <Stat label="Operatori" value={r.operators.join(", ") || "—"} />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-strong">Trenuri azi</h2>
        <span className="text-sm text-muted tnum">{fastest ? `cel mai rapid ${formatDuration(fastest)}` : ""}</span>
      </div>
      <div className="mt-3 space-y-3">
        {result.direct.map((x, i) => <TrainResultCard key={`d${i}`} r={x} />)}
        {result.connections.length > 0 && (
          <>
            <h3 className="pt-2 text-sm font-bold uppercase text-muted">Cu schimbare</h3>
            {result.connections.map((x, i) => <TrainResultCard key={`c${i}`} r={x} />)}
          </>
        )}
        {result.all.length === 0 && (
          <p className="rounded-md border border-line bg-card p-6 text-center text-muted">Azi nu circulă trenuri pe această rută. Verifică altă dată.</p>
        )}
      </div>

      <div className="mt-8 rounded-md border border-line bg-card p-5">
        <h2 className="text-lg font-bold text-strong">Despre ruta {r.fromCity}–{r.toCity}</h2>
        <p className="mt-2 text-sm text-body">
          Pe ruta {r.fromCity}–{r.toCity} circulă zilnic aproximativ {r.dailyTrainsCount} trenuri, pe o distanță de {r.distanceKm} km.
          Cel mai rapid tren acoperă traseul în {formatDuration(r.minDurationMin)}. Poți vedea și
          {" "}<Link href={`/rute/${r.inverseSlug}`} className="text-primary hover:underline">ruta inversă {r.toCity}–{r.fromCity}</Link>,
          sau gările de capăt: <Link href={`/statii/${r.fromSlug}`} className="text-primary hover:underline">{r.fromName}</Link> și
          {" "}<Link href={`/statii/${r.toSlug}`} className="text-primary hover:underline">{r.toName}</Link>.
        </p>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Întrebări frecvente</h2>
      <Faq items={faq} />
      <JsonLd data={faqSchema(faq)} />
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-card p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-bold text-strong">{value}</div>
    </div>
  );
}
