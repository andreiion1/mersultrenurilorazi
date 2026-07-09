"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export type BoardRowLite = { t: string; d: string; ds: string; c: string; n: string; s: string; op: string };
export type BoardStation = { slug: string; name: string; rows: BoardRowLite[] };

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// Panou de plecări din marile gări, cu plecările care urmează și countdown live.
export function DeparturesBoard({ stations }: { stations: BoardStation[] }) {
  const [active, setActive] = useState(0);
  const [nowMin, setNowMin] = useState<number | null>(null);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const upd = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
      setClock(d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }));
    };
    upd();
    const id = setInterval(upd, 30000);
    return () => clearInterval(id);
  }, []);

  const st = stations[active];
  if (!st) return null;

  const upcoming =
    nowMin == null ? st.rows.slice(0, 6) : st.rows.filter((r) => toMin(r.t) >= nowMin).slice(0, 6);

  function countdown(t: string): string {
    if (nowMin == null) return "";
    const diff = toMin(t) - nowMin;
    if (diff <= 0) return "acum";
    if (diff < 60) return `${diff} min`;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  return (
    <div>
      {/* Tab-uri gări */}
      <div className="mb-3 flex flex-wrap gap-2">
        {stations.map((s, i) => (
          <button
            key={s.slug}
            type="button"
            onClick={() => setActive(i)}
            className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all"
            style={
              i === active
                ? { backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }
                : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" }
            }
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Panou */}
      <div className="overflow-hidden rounded-xl" style={{ backgroundColor: "var(--color-navy)", boxShadow: "var(--shadow-card)" }}>
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "0.5px solid rgba(255,255,255,0.14)" }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: "var(--color-primary)", opacity: 0.6 }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#fff" }}>
              Plecări azi · {st.name}
            </span>
          </div>
          <span className="font-time text-sm font-bold tnum" style={{ color: "rgba(255,255,255,0.75)" }}>
            {clock || "--:--"}
          </span>
        </div>

        <div>
          {upcoming.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              Nu mai sunt plecări azi din {st.name}.
            </div>
          ) : (
            upcoming.map((r, i) => (
              <Link
                key={`${r.s}-${i}`}
                href={`/tren/${r.s}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors"
                style={{ borderTop: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <span className="font-time text-lg font-bold tnum" style={{ color: "var(--color-primary)", minWidth: 58 }}>
                  {r.t}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: "#fff" }}>
                    {r.d}
                  </span>
                  <span className="block truncate text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {r.c} {r.n}
                  </span>
                </span>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tnum"
                  style={{ backgroundColor: "rgba(245,160,0,0.14)", color: "var(--color-primary)" }}
                >
                  {countdown(r.t) || " "}
                </span>
              </Link>
            ))
          )}
        </div>

        <Link
          href={`/plecari/${st.slug}`}
          className="flex items-center justify-center gap-1 px-4 py-3 text-xs font-semibold transition-colors"
          style={{ borderTop: "0.5px solid rgba(255,255,255,0.14)", color: "var(--color-primary)" }}
        >
          Toate plecările din {st.name}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
