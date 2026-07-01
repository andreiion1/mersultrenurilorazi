import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryTag } from "@/components/Badges";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { trains, trainBySlug } from "@/data/trains";
import { stationBySlug } from "@/data/stations";
import { operatorBySlug } from "@/data/operators";
import { mockStatus, delayHistory, todayISO, formatDuration, durationBetween } from "@/lib/schedule";
import { pageMeta, faqSchema } from "@/lib/seo";

const DAY_LABEL: Record<string, string> = { mon: "Lu", tue: "Ma", wed: "Mi", thu: "Jo", fri: "Vi", sat: "S\u00e2", sun: "Du" };

export function generateStaticParams() {
  return trains.slice(0, 80).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = trainBySlug(slug);
  if (!t) return pageMeta({ title: "Tren indisponibil", description: "", path: `/tren/${slug}`, noindex: true });
  const op = operatorBySlug(t.operatorSlug);
  return pageMeta({
    title: `Tren ${t.category} ${t.number} \u2014 Traseu, Orar Opriri \u015fi Status`,
    description: `Trenul ${t.category} ${t.number}${t.name ? ` (${t.name})` : ""}: traseu complet, opriri cu ore, durat\u0103 \u015fi \u00eent\u00e2rziere azi. Operator ${op?.name ?? ""}.`,
    path: `/tren/${t.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = trainBySlug(slug);
  if (!t) notFound();
  const op = operatorBySlug(t.operatorSlug);
  const today = todayISO();
  const status = mockStatus(t.slug, today);
  const hist = delayHistory(t.slug);
  const origin = stationBySlug(t.stops[0].stationSlug)!;
  const dest = stationBySlug(t.stops[t.stops.length - 1].stationSlug)!;
  const depFirst = t.stops[0].dep ?? t.stops[0].arr!;
  const arrLast = t.stops[t.stops.length - 1].arr ?? t.stops[t.stops.length - 1].dep!;
  const total = durationBetween(depFirst, arrLast);
  const riskLabel = hist.riskLevel === 1 ? "mic" : hist.riskLevel === 2 ? "mediu" : "mare";

  const faq = [
    { q: `Pe ce rut\u0103 circul\u0103 trenul ${t.category} ${t.number}?`, a: `Trenul circul\u0103 pe ruta ${origin.name} \u2013 ${dest.name}, cu durata de aproximativ ${formatDuration(total)}.` },
    { q: `\u00cent\u00e2rzie des trenul ${t.category} ${t.number}?`, a: `Istoric (estimativ), trenul are o \u00eent\u00e2rziere medie de ~${hist.avgDelayMin} min \u015fi o punctualitate de ~${hist.onTimePct}%. Risc de \u00eent\u00e2rziere: ${riskLabel}.` },
  ];

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acas\u0103", href: "/" }, { name: "Trenuri", href: "/rute" }, { name: `${t.category} ${t.number}` }]} />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-strong md:text-3xl">Tren <CategoryTag category={t.category} /> {t.number}</h1>
        <StatusBadge status={status} />
        <Link
          href={`/harta-trenuri-live?tren=${t.slug}`}
          className="ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
          </svg>
          Vezi pe hart\u0103
        </Link>
      </div>
      {t.name && <p className="mt-1 text-muted">\u201e{t.name}\u201d \u00b7 {op?.name}</p>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Rut\u0103" value={`${origin.city} \u2192 ${dest.city}`} />
        <Stat label="Durat\u0103" value={formatDuration(total)} />
        <Stat label="Punctualitate" value={`~${hist.onTimePct}%`} />
        <Stat label="Risc \u00eent\u00e2rziere" value={riskLabel} />
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Traseu \u015fi opriri</h2>
      <ol className="relative space-y-0 border-l-2 border-line pl-6">
        {t.stops.map((stop, i) => {
          const st = stationBySlug(stop.stationSlug);
          return (
            <li key={i} className="relative pb-5">
              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-base" />
              <div className="flex flex-wrap items-center gap-x-3">
                <span className="text-time font-bold text-strong tnum">{stop.arr ?? stop.dep}</span>
                {stop.arr && stop.dep && stop.arr !== stop.dep && <span className="text-xs text-muted tnum">\u2192 {stop.dep}</span>}
                <Link href={`/statii/${stop.stationSlug}`} className="font-medium text-strong hover:text-primary">{st?.name ?? stop.stationSlug}</Link>
                {stop.platform && <span className="text-xs text-muted">Peron {stop.platform}</span>}
                <span className="text-xs text-muted tnum">{stop.km} km</span>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-md border border-line bg-card p-4 text-sm text-body">
        Zile de circula\u021bie: <strong>{t.runsDays.map((d) => DAY_LABEL[d]).join(", ")}</strong>.
        {" "}Vezi \u015fi ruta <Link href={`/rute/${origin.slug}-${dest.slug}`} className="text-primary hover:underline">{origin.city}\u2013{dest.city}</Link>.
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">\u00centreb\u0103ri frecvente</h2>
      <Faq items={faq} />
      <JsonLd data={faqSchema(faq)} />
    </Container>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-card p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-bold capitalize text-strong">{value}</div>
    </div>
  );
}
