"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BoardRow } from "@/lib/schedule";
import type { RunStatus } from "@/lib/types";
import { BoardClock } from "./BoardClock";

// Panou de plecări/sosiri în stilul clasic CFR (albastru, monospace, majuscule).
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const BOARD_BG = "linear-gradient(180deg,#0c1e8a 0%,#0a1670 100%)";
const HEAD_BG = "#0a1566";
const HEAD_COL = "#8ea6ff"; // culoare capete coloane
const TXT = "#e8efff";
const AMBER = "#ffce3a";

// Fereastra implicită pe pagina de gară: de la 2h în urmă până la 4h în față.
const PAST_MIN = 120;
const AHEAD_MIN = 240;
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function StatusCell({ status }: { status: RunStatus }) {
  if (status.state === "cancelled") {
    return <span style={{ color: "#ff6b6b", fontFamily: MONO, fontWeight: 700 }}>ANULAT</span>;
  }
  if (status.state === "delayed" && status.delayMin > 0) {
    return <span style={{ color: AMBER, fontFamily: MONO, fontWeight: 700 }}>+{status.delayMin} MIN</span>;
  }
  return <span style={{ color: "#57d9a3", fontFamily: MONO, fontSize: "0.72rem" }}>CONFORM ORARULUI</span>;
}

function MoreBar({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-white/5"
      style={{ fontFamily: MONO, color: AMBER, background: HEAD_BG, borderTop: "1px solid rgba(255,255,255,0.12)" }}
    >
      {label}
    </button>
  );
}

export function Board({ rows, mode, windowed = false }: { rows: BoardRow[]; mode: "departures" | "arrivals"; windowed?: boolean }) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  const [showEarlier, setShowEarlier] = useState(false);
  const [showLater, setShowLater] = useState(false);

  useEffect(() => {
    if (!windowed) return;
    const upd = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    upd();
    const id = setInterval(upd, 60000);
    return () => clearInterval(id);
  }, [windowed]);

  const titleRo = mode === "departures" ? "PLECĂRI" : "SOSIRI";
  const titleEn = mode === "departures" ? "DEPARTURES" : "ARRIVALS";
  const dirLabel = mode === "departures" ? "PLEACĂ LA" : "SOSEȘTE DE LA";
  const kind = mode === "departures" ? "plecări" : "sosiri";

  // Fereastra de timp: activă doar pe pagina de gară (windowed) și după montare.
  let visible = rows;
  let earlierCount = 0;
  let laterCount = 0;
  let windowActive = false;
  if (windowed && nowMin != null) {
    const lo = nowMin - PAST_MIN;
    const hi = nowMin + AHEAD_MIN;
    const earlier = rows.filter((r) => toMin(r.time) < lo);
    const later = rows.filter((r) => toMin(r.time) > hi);
    const win = rows.filter((r) => {
      const m = toMin(r.time);
      return m >= lo && m <= hi;
    });
    if (win.length > 0) {
      windowActive = true;
      earlierCount = earlier.length;
      laterCount = later.length;
      visible = [
        ...(showEarlier ? earlier : []),
        ...win,
        ...(showLater ? later : []),
      ];
    }
    // dacă nu e nimic în fereastră (ex. noaptea târziu) → arătăm tot, fără colapsare.
  }

  return (
    <div className="overflow-hidden rounded-lg" style={{ background: BOARD_BG, border: "1px solid #1b2fa0", boxShadow: "0 8px 30px rgba(6,12,60,0.35)" }}>
      {/* Bara de titlu bilingvă + ceas */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: HEAD_BG, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="flex items-baseline gap-2" style={{ fontFamily: MONO }}>
          <span className="text-base font-bold tracking-wider" style={{ color: "#fff" }}>{titleRo}</span>
          <span className="text-xs tracking-widest" style={{ color: HEAD_COL }}>/ {titleEn}</span>
        </div>
        <div className="text-sm"><BoardClock /></div>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-8 text-center" style={{ color: HEAD_COL, fontFamily: MONO }}>
          Nu sunt {kind} programate pentru această zi.
        </p>
      ) : (
        <>
          {windowActive && earlierCount > 0 && (
            <MoreBar
              label={showEarlier ? "▲ Ascunde cursele trecute" : `▲ Vezi mai devreme (${earlierCount})`}
              onClick={() => setShowEarlier((v) => !v)}
            />
          )}

          <div className="relative">
            <table className="w-full" style={{ fontFamily: MONO, borderCollapse: "collapse" }}>
              <thead className="hidden md:table-header-group">
                <tr style={{ color: HEAD_COL }}>
                  <th className="px-4 py-2 text-left text-[11px] tracking-widest">ORA</th>
                  <th className="px-4 py-2 text-left text-[11px] tracking-widest">TREN</th>
                  <th className="px-4 py-2 text-left text-[11px] tracking-widest">{dirLabel}</th>
                  <th className="px-4 py-2 text-left text-[11px] tracking-widest">LINIA</th>
                  <th className="px-4 py-2 text-left text-[11px] tracking-widest">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => {
                  const departed = windowActive && nowMin != null && toMin(r.time) < nowMin;
                  return (
                    <tr key={`${r.trainSlug}-${r.time}-${i}`}
                      className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-4 py-2.5 md:table-row md:py-0"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.07)", backgroundColor: i % 2 ? "rgba(255,255,255,0.03)" : "transparent", opacity: departed ? 0.5 : 1 }}>
                      <td className="md:px-4 md:py-2.5">
                        <span className="text-lg font-bold md:text-base" style={{ color: AMBER, fontVariantNumeric: "tabular-nums" }}>{r.time}</span>
                      </td>
                      <td className="md:px-4 md:py-2.5">
                        <Link href={`/tren/${r.trainSlug}`} className="inline-flex items-center gap-1.5" style={{ color: TXT }}>
                          <span style={{ color: AMBER, fontWeight: 700 }}>{r.category}</span>
                          <span style={{ fontWeight: 700 }}>{r.number}</span>
                        </Link>
                      </td>
                      <td className="w-full md:w-auto md:px-4 md:py-2.5">
                        <Link href={`/statii/${mode === "departures" ? r.towardsSlug : r.fromSlug}`}
                          className="font-bold uppercase tracking-wide hover:underline"
                          style={{ color: TXT }}>
                          {mode === "departures" ? r.towardsName : r.fromName}
                        </Link>
                      </td>
                      <td className="md:px-4 md:py-2.5">
                        <span style={{ color: HEAD_COL, fontVariantNumeric: "tabular-nums" }}>{r.platform ?? "-"}</span>
                      </td>
                      <td className="md:px-4 md:py-2.5">
                        <StatusCell status={r.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* textură LED subtilă (scanlines) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0"
              style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)" }} />
          </div>

          {windowActive && laterCount > 0 && (
            <MoreBar
              label={showLater ? "▼ Arată mai puțin" : `▼ Vezi mai târziu (${laterCount})`}
              onClick={() => setShowLater((v) => !v)}
            />
          )}
        </>
      )}
    </div>
  );
}
