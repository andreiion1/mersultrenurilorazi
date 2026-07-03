import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { stations, majorStations, stationRank } from "@/data/stations";
import { pageMeta } from "@/lib/seo";
import { PinIcon } from "@/components/Icons";

export const metadata: Metadata = pageMeta({
  title: "Gări din România: plecări, sosiri și orar",
  description: "Lista gărilor din România. Vezi plecările, sosirile și orarul trenurilor pentru fiecare gară.",
  path: "/statii",
});

export default function Page() {
  const majors = majorStations().sort((a, b) => a.name.localeCompare(b.name, "ro"));
  // gări „reale" (fără halte mici, fără cele majore deja afișate), grupate alfabetic
  const others = stations
    .filter((s) => stationRank(s) === 1)
    .sort((a, b) => a.name.localeCompare(b.name, "ro"));
  const groups = others.reduce<Record<string, typeof others>>((acc, s) => {
    const L = s.name[0].toUpperCase();
    (acc[L] ??= []).push(s);
    return acc;
  }, {});
  const halts = stations.filter((s) => stationRank(s) === 2).length;

  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Gări" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Gări din România</h1>
      <p className="mt-2 max-w-2xl text-body">
        {stations.length} de stații și halte în total. Mai jos: gările principale și gările importante.
        Haltele mici ({halts}) sunt accesibile prin căutare.
      </p>

      <h2 className="mb-3 mt-8 text-xl font-bold text-strong">Gări principale</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {majors.map((s) => (
          <Link key={s.slug} href={`/statii/${s.slug}`} className="flex items-center gap-2 rounded-md border border-line bg-card p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
            <span className="text-primary"><PinIcon width={18} height={18} /></span>
            <span className="font-semibold text-strong">{s.name}</span>
            {s.county && <span className="ml-auto text-xs text-muted">{s.county}</span>}
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-xl font-bold text-strong">Toate gările</h2>
      <div className="space-y-5">
        {Object.entries(groups).map(([letter, list]) => (
          <section key={letter}>
            <h3 className="mb-2 text-sm font-bold uppercase text-muted">{letter}</h3>
            <div className="flex flex-wrap gap-2">
              {list.map((s) => (
                <Link key={s.slug} href={`/statii/${s.slug}`} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-body hover:border-primary hover:text-primary">{s.name}</Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </Container>
  );
}
