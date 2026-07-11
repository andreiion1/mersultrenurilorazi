import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { TrainResultCard } from "@/components/TrainResultCard";
import { TodayResults } from "@/components/TodayResults";
import { ResultsControls } from "@/components/ResultsControls";
import { stationBySlug } from "@/data/stations";
import { search, todayISO, formatDuration } from "@/lib/schedule";
import { applyView, parseSort, parseDirectOnly, parseDateParam, parseOperator } from "@/lib/resultsView";
import { operatorBySlug } from "@/data/operators";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Caută rută de tren, orar și bilete",
  description: "Caută trenuri între două stații din România: directe și cu schimbări, durată, preț și status.",
  path: "/cautare",
  noindex: true,
});

interface Props { searchParams: Promise<{ from?: string; to?: string; date?: string; sort?: string; directe?: string; op?: string }>; }

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const fromSlug = params.from ?? "";
  const toSlug = params.to ?? "";
  const today = todayISO();
  const date = parseDateParam(params.date, today);
  const sort = parseSort(params.sort);
  const directOnly = parseDirectOnly(params.directe);
  const operator = parseOperator(params.op);
  const from = stationBySlug(fromSlug);
  const to = stationBySlug(toSlug);

  const hasQuery = !!from && !!to;
  const result = hasQuery ? search(fromSlug, toSlug, date) : { direct: [], connections: [], all: [] };
  const operatorsPresent = Array.from(new Set(result.all.flatMap((x) => x.legs.map((l) => l.train.operatorSlug))))
    .map((s) => ({ slug: s, name: operatorBySlug(s)?.shortName ?? s }))
    .sort((a, b) => a.name.localeCompare(b.name, "ro"));
  const list = applyView(result.all, sort, directOnly, operator);
  const fastest = result.all.length ? Math.min(...result.all.map((r) => r.totalDurationMin)) : 0;
  const prices = result.all.map((r) => r.priceFrom.amount).filter((x): x is number => x != null);
  const cheapest = prices.length ? Math.min(...prices) : 0;
  const isDefaultView = sort === "plecare" && !directOnly && !operator;

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
              {result.direct.length === 0 && result.connections.length > 0 && (
                <div className="mb-3 flex items-start gap-2 rounded-md border p-3 text-sm" style={{ borderColor: "var(--color-warning)", backgroundColor: "var(--color-warning-bg, rgba(217,119,6,0.08))", color: "var(--text-body)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" />
                  </svg>
                  <p>
                    Nu există tren <strong>direct</strong> {from!.name} → {to!.name}, dar se poate ajunge {result.connections[0].changesCount === 1 ? "cu o schimbare" : `cu ${result.connections[0].changesCount} schimbări`}. Variantele de mai jos includ gările de schimb și timpul de așteptare.
                  </p>
                </div>
              )}
              <p className="mb-3 text-sm text-muted tnum">
                {result.direct.length} directe{result.connections.length ? ` · ${result.connections.length} cu schimbare` : ""} ·
                cel mai rapid {formatDuration(fastest)} · de la {cheapest.toFixed(1)} lei
              </p>
              <div className="mb-4">
                <ResultsControls basePath="/cautare"
                  baseParams={{ from: fromSlug, to: toSlug, date }}
                  sort={sort} directOnly={directOnly} operator={operator} operators={operatorsPresent}
                  directCount={result.direct.length} totalCount={result.all.length} />
              </div>
              <div className="space-y-3">
                {isDefaultView ? (
                  <TodayResults date={date} today={today}
                    direct={result.direct.map((x) => ({ depTime: x.depTime, node: <TrainResultCard r={x} date={date} /> }))}
                    connections={result.connections.map((x) => ({ depTime: x.depTime, node: <TrainResultCard r={x} date={date} /> }))} />
                ) : list.length > 0 ? (
                  <TodayResults date={date} today={today}
                    direct={list.map((x) => ({ depTime: x.depTime, node: <TrainResultCard r={x} date={date} /> }))} />
                ) : (
                  <p className="rounded-md border border-line bg-card p-6 text-center text-muted">
                    Nu există trenuri directe la această dată. Dezactivează filtrul ca să vezi variantele cu schimbare.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-md border border-line bg-card p-6 text-center">
              <p className="font-medium text-strong">Nu am găsit o legătură cu trenul în aceeași zi pe această rută.</p>
              <p className="mt-1 text-sm text-muted">Nici direct, nici cu schimbări rezonabile. Traseul poate necesita o oprire peste noapte sau altă zi. Încearcă altă dată sau ia în calcul autocarul.</p>
              <Link href="/rute" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Vezi rute disponibile</Link>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
