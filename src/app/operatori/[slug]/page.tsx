import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { operatorBySlug } from "@/data/operators";
import { operatorInfo, operatorsWithTrains } from "@/lib/operatorData";
import { pageMeta } from "@/lib/seo";

const YEAR = new Date().getFullYear();
const CAT_LABEL: Record<string, string> = {
  R: "Regio", RE: "Regio Expres", IR: "InterRegio", IRN: "InterRegio Noapte", IC: "InterCity",
};

export function generateStaticParams() {
  return operatorsWithTrains().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const op = operatorBySlug(slug);
  if (!op) return pageMeta({ title: "Operator indisponibil", description: "", path: `/operatori/${slug}`, noindex: true });
  return pageMeta({
    title: `Trenuri ${op.name} — Orar, Rute și Bilete ${YEAR}`,
    description: `Trenurile ${op.name} din România: rute, orar, gări deservite și cumpărare bilete. Toate trenurile operatorului ${op.name}.`,
    path: `/operatori/${op.slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const op = operatorBySlug(slug);
  if (!op) notFound();
  const info = operatorInfo(op.slug);
  if (info.trainCount === 0) notFound();
  // URL de bilete curat: dacă pattern-ul are placeholdere (CFR), tăiem query-ul gol.
  const ticketUrl = op.ticketUrlPattern.includes("{") ? op.ticketUrlPattern.split("?")[0] : op.ticketUrlPattern;

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Operatori", href: "/operatori" }, { name: op.name }]} />
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: op.colorHex }} />
        <h1 className="text-2xl font-bold text-strong md:text-3xl">Trenuri {op.name}</h1>
      </div>
      <p className="mt-2 max-w-2xl text-body">
        {op.name} operează <strong>{info.trainCount}</strong> trenuri de călători în România, deservind <strong>{info.stationCount}</strong> gări.
        Mai jos vezi rutele principale și poți cumpăra bilet direct de la operator.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={ticketUrl} target="_blank" rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}>
          Cumpără bilet {op.shortName}
        </a>
        <a href={op.website} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          style={{ border: "1.5px solid var(--color-primary)", color: "var(--color-primary)" }}>
          Site oficial
        </a>
      </div>

      {info.categories.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tipuri de trenuri</div>
          <div className="flex flex-wrap gap-2">
            {info.categories.map((c) => (
              <span key={c.cat} className="rounded-full border border-line bg-card px-3 py-1 text-xs text-body">
                {CAT_LABEL[c.cat] ?? c.cat}: <strong className="text-strong">{c.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {info.topRoutes.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Rute operate de {op.name}</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {info.topRoutes.slice(0, 30).map((r) => (
              <Link key={r.slug} href={`/rute/${r.slug}`}
                className="flex items-center justify-between rounded-md border border-line bg-card px-3 py-2 text-sm hover:border-primary">
                <span className="font-medium text-strong">{r.fromCity} – {r.toCity}</span>
                <span className="text-xs text-muted">{r.count} tren.</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-muted">
        Orar din surse deschise <a href="/surse-de-date" className="text-primary hover:underline">data.gov.ro</a>.
        Prețurile și disponibilitatea se verifică pe platforma operatorului.
      </p>
    </Container>
  );
}
