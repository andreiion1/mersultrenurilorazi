"use client";

import { useEffect, useRef } from "react";

interface Pt { lat: number; lng: number; name: string; }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { L?: any; }
}

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const AMBER = "#F5A000";
const NAVY = "#061127";
const STEP_MS = 31;   // 10% mai lent decât înainte (era 28ms)
const STEPS = 150;    // densitate totală a punctelor pe traseu

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

function bearingDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p1 = toRad(aLat), p2 = toRad(bLat), dl = toRad(bLng - aLng);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

// Densifică traseul prin toate waypoint-urile, cu puncte distribuite după lungimea segmentelor.
function densify(points: Pt[]): [number, number][] {
  const segLen: number[] = [];
  let total = 0;
  for (let k = 0; k < points.length - 1; k++) {
    const d = Math.hypot(points[k + 1].lat - points[k].lat, points[k + 1].lng - points[k].lng);
    segLen.push(d); total += d;
  }
  if (total === 0) return points.map((p) => [p.lat, p.lng]);
  const out: [number, number][] = [];
  for (let k = 0; k < points.length - 1; k++) {
    const steps = Math.max(1, Math.round(STEPS * (segLen[k] / total)));
    for (let s = 0; s < steps; s++) {
      const f = s / steps;
      out.push([points[k].lat + (points[k + 1].lat - points[k].lat) * f,
                points[k].lng + (points[k + 1].lng - points[k].lng) * f]);
    }
  }
  const last = points[points.length - 1];
  out.push([last.lat, last.lng]);
  return out;
}

export function RouteAnimatedMap({ points }: { points: Pt[] }) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (points.length < 2) return;
    let cancelled = false;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    loadLeaflet().then(() => {
      if (cancelled || !elRef.current || mapRef.current) return;
      const L = window.L;
      const map = L.map(elRef.current, {
        zoomControl: false, attributionControl: true,
        dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
        boxZoom: false, keyboard: false, touchZoom: false, tap: false,
      });
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap", maxZoom: 18,
      }).addTo(map);

      const latlngs: [number, number][] = points.map((p) => [p.lat, p.lng]);
      map.fitBounds(latlngs, { padding: [42, 42] });

      // opriri intermediare (puncte mici)
      for (let k = 1; k < points.length - 1; k++) {
        L.circleMarker([points[k].lat, points[k].lng], { radius: 3, color: AMBER, weight: 1.5, fillColor: "#fff", fillOpacity: 1 })
          .bindTooltip(points[k].name, { direction: "top" }).addTo(map);
      }
      // capete: plecare + sosire cu etichetă
      const first = points[0], last = points[points.length - 1];
      L.circleMarker([first.lat, first.lng], { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 })
        .bindTooltip(first.name, { permanent: true, direction: "left", className: "route-lbl" }).addTo(map);
      L.circleMarker([last.lat, last.lng], { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 })
        .bindTooltip(last.name, { permanent: true, direction: "right", className: "route-lbl" }).addTo(map);

      // traseul complet (fantomă) + linia animată
      L.polyline(latlngs, { color: AMBER, weight: 2, opacity: 0.22, dashArray: "4 6" }).addTo(map);
      const live = L.polyline([latlngs[0]], { color: AMBER, weight: 4, opacity: 0.95, lineCap: "round", lineJoin: "round" }).addTo(map);

      const path = densify(points);
      const mkArrow = (deg: number) => L.divIcon({
        html: `<div style="transform:rotate(${deg}deg);width:26px;height:26px">` +
              `<svg width="26" height="26" viewBox="0 0 24 24" style="display:block">` +
              `<path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="${AMBER}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>` +
              `</svg></div>`,
        className: "route-arrow", iconSize: [26, 26], iconAnchor: [13, 13],
      });
      const arrow = L.marker(path[0], { icon: mkArrow(0), interactive: false }).addTo(map);

      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        if (i > path.length - 1) {
          arrow.setLatLng(path[path.length - 1]);
          timer = setTimeout(() => {
            if (cancelled) return;
            i = 0;
            live.setLatLngs([path[0]]);
            arrow.setLatLng(path[0]);
            raf = requestAnimationFrame(tick);
          }, 1200);
          return;
        }
        live.setLatLngs(path.slice(0, i + 1));
        arrow.setLatLng(path[i]);
        const prev = path[i - 1] ?? path[0];
        const deg = (bearingDeg(prev[0], prev[1], path[i][0], path[i][1]) + 360) % 360;
        arrow.setIcon(mkArrow(deg));
        timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, STEP_MS);
      };
      raf = requestAnimationFrame(tick);
    }).catch(() => { /* harta e decorativă — ignorăm eșecul */ });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (points.length < 2) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <style>{`
        .route-arrow{background:transparent;border:none}
        .route-lbl{background:${NAVY};color:#fff;border:none;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.25)}
        .route-lbl::before{display:none}
      `}</style>
      <div ref={elRef} className="h-[240px] w-full bg-subtle md:h-[300px]" />
    </div>
  );
}
