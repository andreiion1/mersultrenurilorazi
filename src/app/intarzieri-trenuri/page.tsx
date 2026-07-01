import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryTag } from "@/components/Badges";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { liveDelays, todayISO } from "@/lib/schedule";
import { IRIS_ENABLED } from "@/lib/iris";
import { operatorBySlug } from "@/data/operators";
import { pageMeta, faqSchema } from "@/lib/seo";
import { AlertIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMeta({
  title: "Întârzieri Trenuri Azi — Status Live CFR",
  description: "Întârzierile trenurilor din România. Trenuri cu întârziere azi pe rute principale, cu status actualizat.",
  path: "/intarzieri-trenuri",
});

const FAQ = [
  { q: "Cum verific întârzierea unui tren?", a: "Caută trenul după numărul lui (ex. IR 1592) și deschide pagina trenului. Când statusul live este conectat, întârzierea apare acolo și pe pagina gării." },
  { q: "De ce nu apar întârzieri acum?", a: "Statusul în timp real provine din sistemul IRIS și se activează după validare tehnică și juridică. Până atunci afișăm orarul oficial, fără a inventa întârzieri. Verifică mereu sursa oficială înainte de călătorie." },
];

export default function Page() {
  const delays = IRIS_ENABLED ? liveDelays(todayISO()) : [];
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Întârzieri" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Întârzieri trenuri în România — status azi</h1>

      {!IRIS_ENABLED && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-warning bg-warning-bg/40 p-3 text-sm text-body">
          <span className="text-warning"><AlertIcon width={18} height={18} /></span>
          <p>Statusul live al trenurilor (din IRIS) este în curs de conectare. Momentan afișăm orarul oficial, fără întârzieri estimate. Pentru status în timp real, verifică și sursa oficială CFR/Infofer.</p>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {delays.length === 0 ? (
          <p className="rounded-md border border-line bg-card p-6 text-center text-muted">Status live indisponibil momentan. Caută un tren după număr pentru detalii de orar.</p>
        ) : (
          delays.map((d) => (
            <div key={d.trainSlug} className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-card p-4">
              <div>
                <Link href={`/tren/${d.trainSlug}`} className="inline-flex items-center gap-1.5 font-semibold text-strong hover:text-primary">
                  <CategoryTag category={d.category} /> {d.number}
                </Link>
                <div className="text-sm text-muted">{d.routeLabel} · la {d.atStation} · {operatorBySlug(d.operatorSlug)?.name}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-warning tnum">+{d.delayMin} min</div>
                <div className="text-xs text-muted tnum">observat {d.observedAt}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Întrebări frecvente</h2>
      <Faq items={FAQ} />
      <JsonLd data={faqSchema(FAQ)} />
    </Container>
  );
}
