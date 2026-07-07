import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { operatorsWithTrains } from "@/lib/operatorData";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Operatori feroviari din România — trenuri și rute",
  description: "Toți operatorii de transport feroviar de călători din România: CFR Călători și companiile private. Trenuri, rute și bilete pentru fiecare.",
  path: "/operatori",
});

export default function Page() {
  const ops = operatorsWithTrains();
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Operatori" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Operatori feroviari din România</h1>
      <p className="mt-2 max-w-2xl text-body">
        Trenurile din România sunt operate de mai multe companii — CFR Călători (de stat) și operatori privați.
        Vezi trenurile, rutele și biletele fiecăruia.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ops.map((o) => (
          <Link key={o.slug} href={`/operatori/${o.slug}`}
            className="rounded-xl border border-line bg-card p-4 transition-all hover:border-primary">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: o.colorHex }} />
              <span className="font-bold text-strong">{o.name}</span>
            </div>
            <div className="mt-2 text-sm text-muted">{o.trainCount} trenuri</div>
          </Link>
        ))}
      </div>
    </Container>
  );
}
