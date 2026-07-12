"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Pos {
  trainSlug: string; number: string; category: string; name?: string;
  lat: number; lng: number; fromCity: string; toCity: string;
  nextStation: string; delayMin: number; state: "on_time" | "delayed"; bearing: number;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const AMBER = "#F5A000";
const WARN = "#D97706";
const INTERCITY = new Set(["IC", "IR", "IRN", "ICN"]);

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve();
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet"; link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null;
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const sc = document.createElement("script");
    sc.src = LEAFLET_JS; sc.async = true;
    sc.onload = () => resolve();
    sc.onerror = () => reject(new Error("Leaflet load failed"));
    document.head.appendChild(sc);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trainIcon(L: any, bearing: number, delayed: boolean) {
  const c = delayed ? WARN : AMBER;
  return L.divIcon({
    className: "hlt-arrow",
    iconSize: [24, 24], iconAnchor: [12, 12],
    html:
      `<div style="width:24px;height:24px;transform:rotate(${bearing}deg)">` +
      `<svg width="24" height="24" viewBox="0 0 24 24" style="display:block">` +
      `<path d="M12 2 L18 20 L12 16 L6 20 Z" fill="${c}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>` +
      `</svg></div>`,
  });
}

export function HomeLiveTrains() {
  const [positions, setPositions] = useState<Pos[]>([]);
  const [updated, setUpdated] = useState("");
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layerRef = useRef<any>(null);

  // Încarcă harta doar când secțiunea intră în ecran (performanță).
  useEffect(() => {
    if (!wrapRef.current || inView) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setInView(true); io.disconnect(); }
    }, { rootMargin: "200px" });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [inView]);

  // Fetch poziții (la intrare în ecran) + refresh la 30s.
  useEffect(() => {
    if (!inView) return;
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
        setUpdated(new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" }));
        if (pick.length === 0) setFailed(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [inView]);

  // Init hartă + (re)desenează markerele la fiecare update de poziții.
  useEffect(() => {
    if (!inView || positions.length === 0) return;
    let cancelled = false;
    loadLeaflet().then(() => {
      if (cancelled || !elRef.current) return;
      const L = window.L;
      if (!mapRef.current) {
        // Zoom din butoane (+/−). Fără pan/scroll/pinch — scroll-ul rămâne al paginii, nu fură degetul.
        const map = L.map(elRef.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false });
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 12 }).addTo(map);
        map.fitBounds([[43.6, 20.2], [48.3, 29.7]], { padding: [10, 10] });
        layerRef.current = L.layerGroup().addTo(map);
      }
      const layer = layerRef.current;
      layer.clearLayers();
      for (const p of positions) {
        const m = L.marker([p.lat, p.lng], { icon: trainIcon(L, p.bearing, p.state === "delayed") }).addTo(layer);
        m.bindTooltip(`${p.category} ${p.number} · ${p.fromCity} → ${p.toCity}`, { direction: "top" });
        m.on("click", () => { window.location.href = `/tren/${p.trainSlug}`; });
      }
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [inView, positions]);

  // Cleanup hartă la demontare.
  useEffect(() => () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } }, []);

  if (failed && positions.length === 0) return null; // fail-safe: nu afișăm nimic dacă nu avem date

  return (
    <div ref={wrapRef}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>Trenuri în mișcare acum</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Poziții estimate din orar, cu direcția de mers. {updated && <span className="tnum">Actualizat {updated}.</span>}
          </p>
        </div>
        <Link href="/harta-trenuri-live" className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
          Vezi toate pe hartă
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative overflow-hidden rounded-xl border border-line" style={{ isolation: "isolate" }}>
            <div ref={elRef} className="h-[280px] w-full bg-subtle md:h-[340px]" style={{ touchAction: "pan-y" }} />
            <div className="pointer-events-none absolute right-3 top-3 z-[400] flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ backgroundColor: "rgba(6,17,39,0.82)", color: "#fff" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ backgroundColor: AMBER, opacity: 0.7 }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: AMBER }} />
              </span>
              LIVE
            </div>
          </div>
        </div>

        <ul className="lg:col-span-2 space-y-2">
          {positions.map((p) => (
            <li key={p.trainSlug}>
              <Link href={`/tren/${p.trainSlug}`} className="flex items-center gap-2 rounded-md border border-line bg-card px-3 py-2 text-sm hover:border-primary">
                <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-bold" style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-strong)" }}>{p.category} {p.number}</span>
                <span className="min-w-0 flex-1 truncate text-strong">{p.fromCity} → {p.toCity}</span>
                {p.state === "delayed"
                  ? <span className="shrink-0 text-xs font-semibold" style={{ color: WARN }}>+{p.delayMin}m</span>
                  : <span className="shrink-0 text-xs" style={{ color: "var(--text-muted)" }}>spre {p.nextStation}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
