"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Pos {
  trainSlug: string; number: string; category: string; name?: string;
  lat: number; lng: number; fromCity: string; toCity: string;
  nextStation: string; delayMin: number; state: "on_time" | "delayed"; bearing: number;
}

// Contur simplificat al României (lng, lat) — sursă: johan/world.geo.json (ROU).
const RO_OUTLINE: [number, number][] = [
  [22.710531, 47.882194], [23.142236, 48.096341], [23.760958, 47.985598], [24.402056, 47.981878],
  [24.866317, 47.737526], [25.207743, 47.891056], [25.945941, 47.987149], [26.19745, 48.220881],
  [26.619337, 48.220726], [26.924176, 48.123264], [27.233873, 47.826771], [27.551166, 47.405117],
  [28.12803, 46.810476], [28.160018, 46.371563], [28.054443, 45.944586], [28.233554, 45.488283],
  [28.679779, 45.304031], [29.149725, 45.464925], [29.603289, 45.293308], [29.626543, 45.035391],
  [29.141612, 44.82021], [28.837858, 44.913874], [28.558081, 43.707462], [27.970107, 43.812468],
  [27.2424, 44.175986], [26.065159, 43.943494], [25.569272, 43.688445], [24.100679, 43.741051],
  [23.332302, 43.897011], [22.944832, 43.823785], [22.65715, 44.234923], [22.474008, 44.409228],
  [22.705726, 44.578003], [22.459022, 44.702517], [22.145088, 44.478422], [21.562023, 44.768947],
  [21.483526, 45.18117], [20.874313, 45.416375], [20.762175, 45.734573], [20.220192, 46.127469],
  [21.021952, 46.316088], [21.626515, 46.994238], [22.099768, 47.672439], [22.710531, 47.882194],
];

const MIN_LNG = 20.22, MAX_LNG = 29.63, MIN_LAT = 43.69, MAX_LAT = 48.23;
const COS = 0.695; // corecție proporție la latitudinea RO (~46°)
const SCALE = 200 / ((MAX_LNG - MIN_LNG) * COS);
const VB_W = 200;
const VB_H = Math.round((MAX_LAT - MIN_LAT) * SCALE);
function project(lng: number, lat: number): [number, number] {
  return [(lng - MIN_LNG) * COS * SCALE, (MAX_LAT - lat) * SCALE];
}
const OUTLINE_PATH =
  "M " + RO_OUTLINE.map(([lng, lat]) => project(lng, lat).map((n) => n.toFixed(1)).join(" ")).join(" L ") + " Z";

function MiniMap({ p }: { p: Pos }) {
  const [x, y] = project(p.lng, p.lat);
  const color = p.state === "delayed" ? "#D97706" : "#F5A000";
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block w-full" role="img" aria-label={`Poziția trenului ${p.category} ${p.number}`}>
      <path d={OUTLINE_PATH} fill="var(--bg-subtle)" stroke="var(--border)" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={x} cy={y} r={10} fill={color} opacity={0.14} />
      <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${Math.round(p.bearing)})`}>
        <path d="M0 -8 L5.5 6.5 L0 3.2 L-5.5 6.5 Z" fill={color} stroke="#fff" strokeWidth={1.3} strokeLinejoin="round" />
      </g>
    </svg>
  );
}

const INTERCITY = new Set(["IC", "IR", "IRN", "ICN"]);

export function HomeLiveTrains() {
  const [positions, setPositions] = useState<Pos[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch("/api/v1/map/positions");
        const j = await r.json();
        if (cancelled) return;
        const all: Pos[] = Array.isArray(j?.data) ? j.data : [];
        const inter = all.filter((p) => INTERCITY.has(p.category) && p.fromCity && p.toCity);
        const pick = (inter.length >= 6 ? inter : all.filter((p) => p.fromCity && p.toCity)).slice(0, 10);
        setPositions(pick);
        if (pick.length === 0) setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (failed && positions.length === 0) return null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>Trenuri în mișcare acum</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Poziții estimate din orar, cu direcția de mers.
          </p>
        </div>
        <Link href="/harta-trenuri-live" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          Vezi toate pe hartă
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {positions.map((p) => (
          <Link key={p.trainSlug} href={`/tren/${p.trainSlug}`}
            className="rounded-xl border border-line bg-card p-2.5 transition-colors hover:border-primary">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-strong)" }}>{p.category} {p.number}</span>
              {p.state === "delayed" && <span className="text-[10px] font-semibold" style={{ color: "#D97706" }}>+{p.delayMin}m</span>}
            </div>
            <div className="mb-1.5 truncate text-xs font-semibold" style={{ color: "var(--text-strong)" }}>{p.fromCity} → {p.toCity}</div>
            <div className="overflow-hidden rounded-md" style={{ backgroundColor: "var(--bg-card)" }}>
              <MiniMap p={p} />
            </div>
            <div className="mt-1 truncate text-[10px]" style={{ color: "var(--text-muted)" }}>spre {p.nextStation}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
