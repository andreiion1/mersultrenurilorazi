import Link from "next/link";
import { JsonLd } from "./JsonLd";

export interface Crumb { name: string; href?: string; }

const SITE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://mersultrenurilorlazi.ro";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: SITE + c.href } : {}),
    })),
  };
  return (
    <>
      <nav aria-label="breadcrumb" className="py-3 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          {items.map((c, i) => (
            <li key={i} className="flex items-center gap-1">
              {c.href ? <Link href={c.href} className="hover:text-primary">{c.name}</Link> : <span className="text-body">{c.name}</span>}
              {i < items.length - 1 && <span className="text-muted">›</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={schema} />
    </>
  );
}
