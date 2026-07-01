import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Favorite",
  description: "Rutele și gările tale salvate.",
  path: "/favorite",
  noindex: true,
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Favorite" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Favoritele tale</h1>
      <p className="mt-4 rounded-md border border-line bg-card p-6 text-center text-muted">
        Salvarea rutelor și gărilor favorite va fi disponibilă în curând (localStorage → cont).
        <br /><strong>TODO:</strong> implementare favorite (vezi docs/01 Epic 7).
      </p>
    </Container>
  );
}
