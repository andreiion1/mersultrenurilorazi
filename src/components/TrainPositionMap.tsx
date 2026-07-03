"use client";

import { useEffect, useRef, useState } from "react";

interface Pt { lat: number; lng: number; name: string; }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const AMBER = "#F5A000";
const NAVY = "#061127";

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

interface Pos { trainSlug: string; lat: number; lng: number; bearing: number; nextStation: string; delayMin: number; state: string; }

export function TrainPositionMap({ route, slug, category, number }: {
  route: Pt[]; slug: string; category: string; number: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [note, setNote] = useState("Se încarcă poziția…");

  useEffect(() => {
    if (route.length < 2) return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval>;

    const arrowIcon = (L: unknown, bearing: number) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (L as any).divIcon({
        html: `<div style="transform:rotate(${bearing}deg);width:30px;height:30px">` +
              `<svg width="30" height="30" viewBox="0 0 24 24" style="display:block">` +
              `<path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="${AMBER}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>` +
              `</svg></div>`,
        className: "train-pos-arrow", iconSize: [30, 30], iconAnchor: [15, 15],
      });

    loadLeaflet().then(() => {
      if (cancelled || !elRef.current || mapRef.current) return;
      const L = window.L;
      const map = L.map(elRef.current, { scrollWheelZoom: false });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap", maxZoom: 18 }).addTo(map);

      const latlngs = route.map((p) => [p.lat, p.lng]);
      map.fitBounds(latlngs, { padding: [36, 36] });

      L.polyline(latlngs, { color: AMBER, weight: 3, opacity: 0.85 }).addTo(map);
      for (let k = 1; k < route.length - 1; k++) {
        L.circleMarker([route[k].lat, route[k].lng], { radius: 3, color: AMBER, weight: 1.5, fillColor: "#fff", fillOpacity: 1 })
          .bindTooltip(route[k].name, { direction: "top" }).addTo(map);
      }
      const first = route[0], last = route[route.length - 1];
      L.circleMarker([first.lat, first.lng], { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 }).bindTooltip(`Plecare: ${first.name}`).addTo(map);
      L.circleMarker([last.lat, last.lng], { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 }).bindTooltip(`Sosire: ${last.name}`).addTo(map);

      const refresh = async () => {
        try {
          const res = await fetch("/api/v1/map/positions", { cache: "no-store" });
          const json = await res.json();
          const pos: Pos | undefined = (json.data || []).find((p: Pos) => p.trainSlug === slug);
          if (cancelled) return;
          if (!pos) {
            if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
            setNote("Trenul nu circulă în acest moment. Mai jos e traseul complet.");
            map.fitBounds(latlngs, { padding: [36, 36] });
            return;
          }
          const ll: [number, number] = [pos.lat, pos.lng];
          if (markerRef.current) {
            markerRef.current.setLatLng(ll).setIcon(arrowIcon(L, pos.bearing));
          } else {
            markerRef.current = L.marker(ll, { icon: arrowIcon(L, pos.bearing), zIndexOffset: 1000 }).addTo(map);
          }
          markerRef.current.bindPopup(
            `<strong>${category} ${number}</strong><br/>spre ${pos.nextStation}` +
            (pos.delayMin > 0 ? `<br/><span style="color:#F59E0B">+${pos.delayMin} min</span>` : `<br/><span style="color:#16A34A">conform orarului</span>`)
          );
          map.setView(ll, 9, { animate: true });
          setNote(pos.delayMin > 0
            ? `Poziție aproximativă acum · spre ${pos.nextStation} · +${pos.delayMin} min`
            : `Poziție aproximativă acum · spre ${pos.nextStation} · conform orarului`);
        } catch {
          if (!cancelled) setNote("Poziția nu a putut fi încărcată.");
        }
      };
      refresh();
      timer = setInterval(refresh, 30000);
    }).catch(() => setNote("Harta nu a putut fi încărcată."));

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markerRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (route.length < 2) return null;

  return (
    <div>
      <div className="relative z-0 overflow-hidden rounded-lg border border-line" style={{ isolation: "isolate" }}>
        <style>{`.train-pos-arrow{background:transparent;border:none}`}</style>
        <div ref={elRef} className="h-[300px] w-full bg-subtle md:h-[360px]" />
      </div>
      <p className="mt-2 text-xs text-muted">{note} Poziția e calculată din orar (nu în timp real). Pentru status oficial, vezi butonul „Stat