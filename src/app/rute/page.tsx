import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RouteCard } from "@/components/RouteCard";
import { getAllDirectRoutes } from "@/data/routes";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Rute de tren în România — orar și bilete",
  description: "Toate rutele de tren disponibile: orar, durată, distanță și bilete între gările din România.",
  path: "/rute",
});

export default function Page() {
  const routes = getAllDirectRoutes();
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Rute" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Rute de tren în România</h1>
      <p className="mt-2 max-w-2xl text-body">Alege o rută pentru orar complet, durată, preț orientativ și bilete.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((r) => <RouteCard key={r.slug} r={r} />)}
      </div>
    </Container>
  );
}
