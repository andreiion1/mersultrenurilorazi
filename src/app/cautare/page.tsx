import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { TrainResultCard } from "@/components/TrainResultCard";
import { ResultsControls } from "@/components/ResultsControls";
import { stationBySlug } from "@/data/stations";
import { search, todayISO, formatDuration } from "@/lib/schedule";
import { applyView, parseSort, parseDirectOnly, parseDateParam } from "@/lib/resultsView";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Caută rută de tren — orar și bilete",
  description: "Caută trenuri între două stații din România: directe și cu schimbări, durată, preț și status.",
  path: "/cautare",
  noindex: true,
});

interface Props { searchParams: Promise<{ from?: string; to?: string; date?: string; sort?: string; directe?: string }>; }

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const fromSlug = params.from ?? "";
  const toSlug = params.to ?? "";
  const date = parseDateParam(params.date, todayISO());
  const sort = parseSort(params.sort);
  const directOnly = parseDirectOnly(params.directe);
  const from = stationBySlug(fromSlug);
  const to = stationBySlug(toSlug);

  const hasQuery = !!from && !!to;
  const result = hasQuery ? search(fromSlug, toSlug, date) : { direct: [], connections: [], all: [] };
  const list = applyView(result.all, sort, directOnly);
  const fastest = result.all.length ? Math.min(...result.all.map((r) => r.totalDurationMin)) : 0;
  const cheapest = result.all.length ? Math.min(...result.all.map((r) => r.priceFrom.amount)) : 0;
  const isDefaultView = sort === "plecare" && !directOnly;

  const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });

  return (
    <Container className="py-6">
      <div className="mx-auto max-w-3xl">
        <SearchBox
          initialFrom={from ? { slug: from.slug, name: from.name, city: from.city } : null}
          initialTo={to ? { slug: to.slug, name: to.name, city: to.city } : null}
          initialDate={date}
        />
      </div>

      {!hasQuery && (
        <p className="mx-auto mt-8 max-w-3xl rounded-md border border-line bg-card p-6 text-center text-muted">
          Alege stația de plecare și destinația ca să vezi trenurile disponibile.
        </p>
      )}

      {hasQuery && (
        <div className="mx-auto mt-6 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-xl font-bold text-strong">{from!.name} → {to!.name}</h1>
            <span className="text-sm capitalize text-muted">{dateLabel}</span>
          </div>

          {result.all.length > 0 ? (
            <>
              <p className="mb-3 text-sm text-muted tnum">
                {result.direct.length} directe{result.connections.length ? ` · ${result.connections.length} cu schimbare` : ""} ·
                cel mai rapid {formatDuration(fastest)} · de la {cheapest.toFixed(1)} lei
              </p>
              <div className="mb-4">
                <ResultsControls basePath="/cautare"
                  baseParams={{ from: fromSlug, to: toSlug, date }}
                  sort={sort} directOnly={directOnly}
                  directCount={result.direct.length} totalCount={result.all.length} />
              </div>
              <div className="space-y-3">
                {isDefaultView ? (
                  <>
                    {result.direct.map((r, i) => <TrainResultCard key={`d${i}`} r={r} />)}
                    {result.connections.length > 0 && (
                      <>
                        <h2 className="pt-4 text-sm font-bold uppercase text-muted">Cu schimbare</h2>
                        {result.connections.map((r, i) => <TrainResultCard key={`c${i}`} r={r} />)}
                      </>
                    )}
                  </>
                ) : list.length > 0 ? (
                  list.map((r, i) => <TrainResultCard key={i} r={r} />)
                ) : (
                  <p className="rounded-md border border-line bg-card p-6 text-center text-muted">
                    Nu există trenuri directe la această dată — dezactivează filtrul ca să vezi variantele cu schimbare.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-line bg-card p-6 text-center">
              <p className="font-medium text-strong">Nu am găsit trenuri pentru această rută la data aleasă.</p>
              <p className="mt-1 text-sm text-muted">Încearcă altă dată sau verifică o rută din apropiere. Alternativ, poți lua în calcul autocarul.</p>
              <Link href="/rute" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Vezi rute disponibile</Link>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
