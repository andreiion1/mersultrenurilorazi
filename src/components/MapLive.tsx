"use client";

import { useEffect, useRef, useState } from "react";

interface GeoStation { slug: string; name: string; lat: number; lng: number; }
interface Pos { trainSlug: string; number: string; category: string; name?: string; lat: number; lng: number; fromCity: string; toCity: string; nextStation: string; delayMin: number; state: string; bearing: number; }
interface Focus {
  slug: string; number: string; category: string; name?: string;
  route: { lat: number; lng: number; name: string }[];
  position: { lat: number; lng: number; nextStation: string; delayMin: number; state: string } | null;
  runsToday: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

// Marker-săgeată care indică direcția de mers (rotit după bearing).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function trainArrowIcon(L: any, bearing: number, color: string, focused: boolean) {
  const size = focused ? 32 : 26;
  const html =
    `<div style="transform:rotate(${bearing}deg);width:${size}px;height:${size}px;">` +
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" style="display:block">` +
    `<path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>` +
    `</svg></div>`;
  return L.divIcon({ html, className: "train-arrow", iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

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

export function MapLive({ stations, focus }: { stations: GeoStation[]; focus?: Focus | null }) {
  const mapEl = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const trainLayer = useRef<any>(null);
  const [count, setCount] = useState<number | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let cancelled = false;

    loadLeaflet().then(() => {
      if (cancelled || !mapEl.current || mapRef.current) return;
      const L = window.L;
      const map = L.map(mapEl.current, { scrollWheelZoom: true }).setView([45.85, 25.0], 6);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap · linii: OpenRailwayMap/OSM", maxZoom: 18,
      }).addTo(map);

      // Rețeaua feroviară reală (OSM, simplificată) — o singură polilinie multi-segment (performant).
      // Adăugată sub gări/trenuri prin bringToBack.
      fetch("/rail-lines.json", { cache: "force-cache" })
        .then((r) => r.json())
        .then((lines) => {
          if (cancelled || !mapRef.current) return;
          const rail = L.polyline(lines, { color: "#D97706", weight: 2, opacity: 0.75, interactive: false }).addTo(map);
          rail.bringToBack();
        })
        .catch(() => { /* harta merge și fără liniile feroviare */ });

      // gări (markere mici)
      stations.forEach((s) => {
        L.circleMarker([s.lat, s.lng], { radius: 4, color: "#667085", weight: 1, fillColor: "#cbd5e1", fillOpacity: 0.9 })
          .bindTooltip(s.name, { direction: "top" })
          .addTo(map);
      });

      // === Focus pe un tren: traseu + capete + zoom ===
      if (focus && focus.route.length >= 2) {
        const latlngs = focus.route.map((p) => [p.lat, p.lng]);
        L.polyline(latlngs, { color: "#F5A000", weight: 4, opacity: 0.85 }).addTo(map);
        const start = focus.route[0], end = focus.route[focus.route.length - 1];
        L.circleMarker([start.lat, start.lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#061127", fillOpacity: 1 }).bindTooltip(`Plecare: ${start.name}`).addTo(map);
        L.circleMarker([end.lat, end.lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#061127", fillOpacity: 1 }).bindTooltip(`Sosire: ${end.name}`).addTo(map);

        if (focus.position) {
          const color = focus.position.state === "delayed" ? "#F59E0B" : "#16A34A";
          L.circleMarker([focus.position.lat, focus.position.lng], { radius: 10, color: "#F5A000", weight: 3, fillColor: color, fillOpacity: 1 })
            .bindPopup(`<strong>${focus.category} ${focus.number}</strong>${focus.name ? " · " + focus.name : ""}<br/>spre ${focus.position.nextStation}` +
              (focus.position.delayMin > 0 ? `<br/><span style="color:#F59E0B">+${focus.position.delayMin} min</span>` : `<br/><span style="color:#16A34A">la timp</span>`))
            .addTo(map).openPopup();
          map.setView([focus.position.lat, focus.position.lng], 9);
        } else {
          map.fitBounds(latlngs, { padding: [40, 40] });
        }
      }

      trainLayer.current = L.layerGroup().addTo(map);
      refresh(L);
      timer = setInterval(() => refresh(L), 30000);
    }).catch(() => setErr(true));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function refresh(L: any) {
      try {
        const res = await fetch("/api/v1/map/positions", { cache: "no-store" });
        const json = await res.json();
        const positions: Pos[] = json.data || [];
        if (!trainLayer.current) return;
        trainLayer.current.clearLayers();
        positions.forEach((p) => {
          const focused = !!(focus && p.trainSlug === focus.slug);
          const color = p.state === "delayed" ? "#F59E0B" : "#16A34A";
          const m = L.marker([p.lat, p.lng], {
            icon: trainArrowIcon(L, p.bearing, color, focused),
            zIndexOffset: focused ? 1000 : 0,
          });
          m.bindTooltip(`${p.category} ${p.number}`, { direction: "top", offset: [0, -10] });
          m.bindPopup(
            `<strong>${p.category} ${p.number}</strong>${p.name ? " · " + p.name : ""}<br/>${p.fromCity} → ${p.toCity}<br/>spre ${p.nextStation}` +
            (p.delayMin > 0 ? `<br/><span style="color:#F59E0B">+${p.delayMin} min</span>` : `<br/><span style="color:#16A34A">la timp</span>`) +
            `<br/><a href="/tren/${p.trainSlug}">Detalii tren →</a>`
          );
          m.addTo(trainLayer.current);
        });
        setCount(positions.length);
      } catch {
        setErr(true);
      }
    }

    return () => { cancelled = true; clearInterval(timer); if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative z-0 overflow-hidden rounded-lg border border-line" style={{ isolation: "isolate" }}>
      <style>{`.train-arrow{background:transparent;border:none;}`}</style>
      <div ref={mapEl} className="h-[420px] w-full bg-subtle md:h-[560px]" />
      <div className="flex items-center justify-between gap-2 border-t border-line bg-card px-3 py-2 text-xs text-muted">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#16A34A" }} /> la timp</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#F59E0B" }} /> întârziat</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#cbd5e1" }} /> gară</span>
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="#16A34A" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            direcție mers
          </span>
        </span>
        <span>{err ? "Hartă indisponibilă" : count !== null ? `${count} trenuri active · actualizare la 30s` : "se încarcă..."}</span>
      </div>
    </div>
  );
}
