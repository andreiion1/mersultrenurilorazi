import Link from "next/link";
import type { BoardRow } from "@/lib/schedule";
import { CategoryTag } from "./Badges";
import { StatusBadge } from "./StatusBadge";

export function Board({ rows, mode }: { rows: BoardRow[]; mode: "departures" | "arrivals" }) {
  if (rows.length === 0) {
    return <p className="rounded-md border border-line bg-card p-6 text-center text-muted">Nu sunt {mode === "departures" ? "plecări" : "sosiri"} programate în intervalul selectat.</p>;
  }
  const dirLabel = mode === "departures" ? "Spre" : "De la";
  return (
    <div className="overflow-hidden rounded-md border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="hidden bg-subtle text-left text-xs uppercase text-muted md:table-header-group">
          <tr>
            <th className="px-4 py-2">Ora</th>
            <th className="px-4 py-2">{dirLabel}</th>
            <th className="px-4 py-2">Tren</th>
            <th className="px-4 py-2">Peron</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 md:table-row md:py-2">
              <td className="md:py-2">
                <span className="font-time text-lg font-bold tnum md:text-base" style={{ color: "var(--text-strong)" }}>{r.time}</span>
              </td>
              <td className="w-full font-medium text-strong md:w-auto">{mode === "departures" ? r.towardsName : r.fromName}</td>
              <td>
                <Link href={`/tren/${r.trainSlug}`} className="inline-flex items-center gap-1 text-body hover:text-primary">
                  <CategoryTag category={r.category} /> {r.number}
                </Link>
              </td>
              <td className="text-muted">{r.platform ? `Peron ${r.platform}` : "—"}</td>
              <td><StatusBadge status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
