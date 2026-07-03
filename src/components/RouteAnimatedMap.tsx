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

function bearingDeg(a: Pt, b: Pt): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const p1 = toRad(a.lat), p2 = toRad(b.lat), dl = toRad(b.lng - a.lng);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function RouteAnimatedMap({ from, to }: { from: Pt; to: Pt }) {
  const elRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  useEffect(() => {
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

      const A: [number, number] = [from.lat, from.lng];
      const B: [number, number] = [to.lat, to.lng];
      map.fitBounds([A, B], { padding: [42, 42] });

      // capete: plecare + sosire (cerc navy cu contur alb) + etichete
      L.circleMarker(A, { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 })
        .bindTooltip(from.name, { permanent: true, direction: "left", className: "route-lbl" }).addTo(map);
      L.circleMarker(B, { radius: 6, color: "#fff", weight: 2, fillColor: NAVY, fillOpacity: 1 })
        .bindTooltip(to.name, { permanent: true, direction: "right", className: "route-lbl" }).addTo(map);

      // linie „fantomă" (traseul complet, subțire) + linia animată portocalie
      L.polyline([A, B], { color: AMBER, weight: 2, opacity: 0.25, dashArray: "4 6" }).addTo(map);
      const live = L.polyline([A], { color: AMBER, weight: 4, opacity: 0.95, lineCap: "round" }).addTo(map);

      const bearing = (bearingDeg(from, to) + 360) % 360;
      const arrowHtml =
        `<div style="transform:rotate(${bearing}deg);width:26px;height:26px">` +
        `<svg width="26" height="26" viewBox="0 0 24 24" style="display:block">` +
        `<path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="${AMBER}" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>` +
        `</svg></div>`;
      const arrowIcon = L.divIcon({ html: arrowHtml, className: "route-arrow", iconSize: [26, 26], iconAnchor: [13, 13] });
      const arrow = L.marker(A, { icon: arrowIcon, interactive: false }).addTo(map);

      // interpolare liniară (rute domestice scurte → suficient vizual)
      const STEPS = 120;
      const pts: [number, number][] = [];
      for (let i = 0; i <= STEPS; i++) {
        const f = i / STEPS;
        pts.push([A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f]);
      }

      let i = 0;
      const tick = () => {
        if (cancelled) return;
        i += 1;
        if (i > STEPS) {
          // pauză la capăt, apoi reset (loop lent)
          arrow.setLatLng(B);
          timer = setTimeout(() => {
            if (cancelled) return;
            i = 0;
            live.setLatLngs([A]);
            arrow.setLatLng(A);
            raf = requestAnimationFrame(tick);
          }, 1100);
          return;
        }
        live.setLatLngs(pts.slice(0, i + 1));
        arrow.setLatLng(pts[i]);
        timer = setTimeout(() => { raf = requestAnimationFrame(tick); }, 28);
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
