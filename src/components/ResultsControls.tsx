// Bara de sortare/filtrare pentru rezultate — link-uri server-side (fără JS).
import Link from "next/link";
import { buildHref, type SortKey } from "@/lib/resultsView";

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
      style={
        active
          ? { backgroundColor: "var(--color-primary)", color: "var(--color-navy)", border: "1px solid var(--color-primary)" }
          : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
      }
    >
      {children}
    </Link>
  );
}

export function ResultsControls({ basePath, baseParams, sort, directOnly, operator, operators, directCount, totalCount }: {
  basePath: string;
  baseParams: Record<string, string | undefined>;
  sort: SortKey;
  directOnly: boolean;
  operator?: string;
  operators?: { slug: string; name: string }[];
  directCount: number;
  totalCount: number;
}) {
  // Href care păstrează operatorul curent, schimbând sort/directe.
  const href = (s: SortKey, d: boolean) =>
    buildHref(basePath, {
      ...baseParams,
      sort: s === "plecare" ? undefined : s,
      directe: d ? "1" : undefined,
      op: operator,
    });
  // Href care schimbă operatorul, păstrând sort/directe.
  const opHref = (op: string | undefined) =>
    buildHref(basePath, {
      ...baseParams,
      sort: sort === "plecare" ? undefined : sort,
      directe: directOnly ? "1" : undefined,
      op,
    });

  const hasConnections = totalCount > directCount;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Sortare și filtrare rezultate">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          Sortare:
        </span>
        <Chip href={href("plecare", directOnly)} active={sort === "plecare"}>Ora plecării</Chip>
        <Chip href={href("rapid", directOnly)} active={sort === "rapid"}>Cel mai rapid</Chip>
        <Chip href={href("ieftin", directOnly)} active={sort === "ieftin"}>Cel mai ieftin</Chip>
        {hasConnections && (
          <>
            <span className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--border)" }} aria-hidden="true" />
            <Chip href={href(sort, !directOnly)} active={directOnly}>
              Doar directe ({directCount})
            </Chip>
          </>
        )}
      </div>

      {operators && operators.length > 1 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrare după operator">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Operator:
          </span>
          <Chip href={opHref(undefined)} active={!operator}>Toți</Chip>
          {operators.map((o) => (
            <Chip key={o.slug} href={opHref(o.slug)} active={operator === o.slug}>{o.name}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}
