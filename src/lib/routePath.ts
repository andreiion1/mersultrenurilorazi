// Waypoint-urile geografice ale unei rute: toate opririle (cu coordonate) de la plecare la sosire.
import { trains } from "@/data/trains";
import { stationBySlug } from "@/data/stations";

export interface Waypoint { lat: number; lng: number; name: string; }

/**
 * Traseul real from→to: alege trenul direct cu cele mai multe opriri între cele două gări
 * și întoarce opririle care au coordonate cunoscute, în ordine. Capetele sunt gări majore
 * (mereu geocodate); opririle intermediare fără coordonate sunt omise.
 */
export function routeWaypoints(fromSlug: string, toSlug: string): Waypoint[] {
  let best: { stationSlug: string }[] | null = null;
  let bestCount = -1;

  for (const t of trains) {
    const i = t.stops.findIndex((s) => s.stationSlug === fromSlug);
    if (i === -1) continue;
    const j = t.stops.findIndex((s, idx) => idx > i && s.stationSlug === toSlug);
    if (j === -1) continue;
    const slice = t.stops.slice(i, j + 1);
    if (slice.length > bestCount) { bestCount = slice.length; best = slice; }
  }
  if (!best) return [];

  const out: Waypoint[] = [];
  for (const s of best) {
    const st = stationBySlug(s.stationSlug);
    if (st && st.lat && st.lng) out.push({ lat: st.lat, lng: st.lng, name: st.name });
  }
  return out;
}
