import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { RouteCard } from "@/components/RouteCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { getPopularRoutes } from "@/data/routes";
import { majorStations } from "@/data/stations";
import { pageMeta, faqSchema } from "@/lib/seo";

const YEAR = new Date().getFullYear();

export const metadata: Metadata = pageMeta({
  title: `Mersul Trenurilor ${YEAR}: Orar Trenuri CFR Actualizat`,
  description: "Caută mersul trenurilor între orice stații din România. Orar complet, întârzieri, trenuri azi și mâine, bilete. Rapid pe mobil.",
  path: "/mersul-trenurilor",
});

const FAQ = [
  { q: "Ce este mersul trenurilor?", a: "Mersul trenurilor este orarul oficial al trenurilor de călători, publicat anual și valabil de la a doua duminică din decembrie. El conține orele de plecare și sosire pentru toate trenurile operatorilor licențiați din România." },
  { q: "Cum caut un tren între două orașe?", a: "Folosește caseta de căutare: alege stația de plecare, destinația și data. Vei vedea trenurile directe și cu schimbări, durata, prețul orientativ și statusul." },
  { q: "Datele de întârziere sunt în timp real?", a: "Nu. Statusul și întârzierile afișate aici sunt orientative, calculate din orar, nu sunt preluate în timp real. Pentru statusul oficial în timp real, verifică Infofer sau CFR Călători înainte de călătorie." },
  { q: "Pot cumpăra bilet de aici?", a: "Te direcționăm către platforma oficială CFR Călători pentru cumpărarea biletului, cu ruta și data precompletate acolo unde este posibil." },
];

export default function Page() {
  const routes = getPopularRoutes();
  const stations = majorStations();
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Mersul trenurilor" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Mersul trenurilor: orar trenuri CFR și toți operatorii {YEAR}</h1>
      <p className="mt-2 max-w-2xl text-body">
        Caută rapid mersul trenurilor între orice două stații din România. Vezi trenuri directe și cu schimbări,
        întârzieri, plecări și sosiri din gări, și ajungi direct la cumpărarea biletului.
      </p>

      <div className="mt-6 max-w-3xl"><SearchBox /></div>

      <h2 className="mb-4 mt-10 text-xl font-bold text-strong">Rute populare</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((r) => <RouteCard key={r.slug} r={r} />)}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold text-strong">Gări mari</h2>
      <div className="flex flex-wrap gap-2">
        {stations.map((s) => (
          <Link key={s.slug} href={`/statii/${s.slug}`} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm font-medium text-body hover:border-primary hover:text-primary">{s.name}</Link>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-bold text-strong">Întrebări frecvente</h2>
      <Faq items={FAQ} />
      <JsonLd data={faqSchema(FAQ)} />
    </Container>
  );
}
