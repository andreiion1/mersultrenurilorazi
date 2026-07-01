import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { TrainResultCard } from "@/components/TrainResultCard";
import { getPopularRoutes } from "@/data/routes";
import { search, tomorrowISO } from "@/lib/schedule";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic"; // conținut „mâine" — reîmprospătat zilnic

const dateLabel = () =>
  new Date(tomorrowISO() + "T00:00:00").toLocaleDateString("ro-RO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

export const metadata: Metadata = pageMeta({
  title: "Trenuri Mâine — Orar CFR pentru Ziua Următoare",
  description: "Ce trenuri circulă mâine în România: orar pe rutele principale, durată și bilete. Planifică-ți călătoria din timp.",
  path: "/trenuri-maine",
});

export default function Page() {
  const tomorrow = tomorrowISO();
  const routes = getPopularRoutes().slice(0, 6);
  const blocks = routes.map((r) => ({
    route: r,
    results: search(r.fromSlug, r.toSlug, tomorrow).all.slice(0, 3),
  }));

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Trenuri mâine" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Trenuri mâine — orar pentru ziua următoare</h1>
      <p className="mt-1 capitalize text-muted">{dateLabel()}</p>
      <p className="mt-2 max-w-2xl text-body">
        Trenuri reprezentative care circulă mâine pe rutele principale. Pentru orarul complet al unei rute,
        deschide pagina rutei și alege data. Cauți orarul de azi? Vezi{" "}
        <Link href="/trenuri-azi" className="font-medium text-primary hover:underline">trenuri azi</Link>.
      </p>

      <div className="mt-8 space-y-10">
        {blocks.map(({ route, results }) => (
          <section key={route.slug}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-strong">{route.fromCity} → {route.toCity}</h2>
              <Link href={`/rute/${route.slug}?data=${tomorrow}`} className="text-sm font-medium text-primary hover:underline">Vezi toate</Link>
            </div>
            <div className="space-y-3">
              {results.length ? results.map((r, i) => <TrainResultCard key={i} r={r} />) : (
                <p className="rounded-md border border-line bg-card p-4 text-sm text-muted">Nu circulă trenuri mâine pe această rută.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
