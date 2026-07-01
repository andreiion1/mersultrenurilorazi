import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryTag } from "@/components/Badges";
import { MapLive } from "@/components/MapLive";
import { geoStations } from "@/data/stations";
import { liveTrainPositions } from "@/lib/live";
import { trainMapData } from "@/lib/trainMap";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Hartă Trenuri Live — Trenurile pe Hartă în Timp Real",
  description: "Urmărește trenurile din România pe hartă, în timp real. Poziție aproximativă, întârzieri și status pe rutele principale.",
  path: "/harta-trenuri-live",
});

export default async function Page({ searchParams }: { searchParams: Promise<{ tren?: string }> }) {
  const { tren } = await searchParams;
  const stations = geoStations().map((s) => ({ slug: s.slug, name: s.name, lat: s.lat, lng: s.lng }));
  const active = liveTrainPositions(); // listă SSR indexabilă

  const focusData = tren ? trainMapData(tren) : null;
  const focus = focusData && focusData.found && focusData.route.length >= 2 ? focusData : null;
  const focusUnavailable = !!tren && !focus;

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Hartă live" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Harta trenurilor live</h1>
      <p className="mt-1 text-sm text-muted">
        Poziții aproximative, interpolate din orar (mock/semi-live). <strong>TODO producție:</strong> poziții reale din parteneriat/IRIS.
      </p>

      {focus && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-primary bg-primary-soft p-3 text-sm">
          <CategoryTag category={focus.category} />
          <span className="font-semibold text-strong">{focus.number}{focus.name ? ` · ${focus.name}` : ""}</span>
          <span className="text-muted">
            {focus.position ? "— afișat pe hartă (în mișcare acum)" : focus.runsToday ? "— nu e activ acum; traseul e afișat pe hartă" : "— nu circulă azi; traseul e afișat pe hartă"}
          </span>
          <Link href="/harta-trenuri-live" className="ml-auto text-primary hover:underline">Vezi toate trenurile</Link>
        </div>
      )}
      {focusUnavailable && (
        <div className="mt-3 rounded-md border border-line bg-card p-3 text-sm text-muted">
          Traseul acestui tren nu poate fi afișat pe hartă (gări fără coordonate încă). Vezi toate trenurile pe hartă mai jos.
        </div>
      )}

      <div className="mt-4">
        <MapLive stations={stations} focus={focus} />
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Trenuri active acum ({active.length})</h2>
      {active.length === 0 ? (
        <p className="rounded-md border border-line bg-card p-6 text-center text-muted">Nu sunt trenuri active de afișat acum.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.map((a) => (
            <div key={a.trainSlug} className="flex items-center justify-between rounded-md border border-line bg-card p-3">
              <div>
                <Link href={`/tren/${a.trainSlug}`} className="inline-flex items-center gap-1.5 font-semibold text-strong hover:text-primary">
                  <CategoryTag category={a.category} /> {a.number}
                </Link>
                <div className="text-sm text-muted">{a.fromCity} → {a.toCity} · spre {a.nextStation}</div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.delayMin > 0 ? "bg-warning-bg text-warning" : "bg-success-bg text-success"}`}>
                {a.delayMin > 0 ? `+${a.delayMin} min` : "la timp"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
