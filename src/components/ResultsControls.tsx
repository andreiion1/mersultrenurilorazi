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

/**
 * Controale de sortare (plecare / cel mai rapid / cel mai ieftin) și filtrul „doar directe".
 * `baseParams` = parametrii de păstrat în URL (ex: from/to/date sau data).
 */
export function ResultsControls({ basePath, baseParams, sort, directOnly, directCount, totalCount }: {
  basePath: string;
  baseParams: Record<string, string | undefined>;
  sort: SortKey;
  directOnly: boolean;
  directCount: number;
  totalCount: number;
}) {
  const href = (s: SortKey, d: boolean) =>
    buildHref(basePath, {
      ...baseParams,
      sort: s === "plecare" ? undefined : s,
      directe: d ? "1" : undefined,
    });

  const hasConnections = totalCount > directCount;

  return (
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
  );
}
