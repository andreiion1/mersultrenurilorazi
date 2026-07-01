import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Blog — ghiduri de călătorie cu trenul în România",
  description: "Ghiduri, sfaturi și rute de călătorie cu trenul în România.",
  path: "/blog",
});

// Conținut editorial — TODO: conectat la CMS / blog_posts (vezi docs/08).
const CATEGORIES = [
  "Ghiduri de călătorie", "Rute populare explicate", "Gări din România",
  "Întârzieri & status", "Bilete & reduceri", "Turism cu trenul",
];

export default function Page() {
  return (
    <Container className="py-2">
      <Breadcrumbs items={[{ name: "Acasă", href: "/" }, { name: "Blog" }]} />
      <h1 className="text-2xl font-bold text-strong md:text-3xl">Blog — călătorii cu trenul în România</h1>
      <p className="mt-2 max-w-2xl text-body">Secțiunea editorială este în pregătire. Vezi planul de conținut (500 idei, calendar 12 luni) în documentația proiectului.</p>
      <h2 className="mb-3 mt-6 text-lg font-bold text-strong">Categorii planificate</h2>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <span key={c} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-body">{c}</span>
        ))}
      </div>
    </Container>
  );
}
