import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FavoritesList } from "@/components/FavoritesList";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Favorite",
  description: "Rutele, gările și trenurile tale salvate.",
  path: "/favorite",
  noindex: true,
});

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Favorite" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Favoritele tale</h1>
      <FavoritesList />
    </Container>
  );
}
