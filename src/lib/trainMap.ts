import { trainBySlug } from "@/data/trains";
import { stationBySlug } from "@/data/stations";
import { mockStatus, timeToMin, dayKeyOf, todayISO } from "@/lib/schedule";

export interface TrainMapData {
  slug: string;
  number: string;
  category: string;
  name?: string;
  route: { lat: number; lng: number; name: string }[]; // gările cu coordonate, în ordine
  position: { lat: number; lng: number; nextStation: string; delayMin: number; state: "on_time" | "delayed" } | null;
  runsToday: boolean;
  found: boolean;
}

/** Date pentru focusarea unui tren pe hartă: traseul (prin gările geocodate) + poziția aproximativă acum. */
export function trainMapData(slug: string, nowMin?: number, dateISO?: string): TrainMapData {
  const t = trainBySlug(slug);
  const empty: TrainMapData = { slug, number: "", category: "", route: [], position: null, runsToday: false, found: false };
  if (!t) return empty;

  const date = dateISO ?? todayISO();
  const day = dayKeyOf(date);
  const now = nowMin ?? (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
  const runsToday = t.runsDays.includes(day);

  const pts = t.stops
    .map((s) => {
      const st = stationBySlug(s.stationSlug);
      const time = s.arr ?? s.dep;
      if (!st || st.lat === 0 || st.lng === 0 || !time) return null;
      return { lat: st.lat, lng: st.lng, name: st.name, min: timeToMin(time) };
    })
    .filter((x): x is { lat: number; lng: number; name: string; min: number } => x !== null)
    .filter((p, i, arr) => i === 0 || p.min > arr[i - 1].min);

  const route = pts.map(({ lat, lng, name }) => ({ lat, lng, name }));

  let position: TrainMapData["position"] = null;
  if (runsToday && pts.length >= 2 && now >= pts[0].min && now <= pts[pts.length - 1].min) {
    let a = pts[0], b = pts[1];
    for (let i = 0; i < pts.length - 1; i++) {
      if (now >= pts[i].min && now <= pts[i + 1].min) { a = pts[i]; b = pts[i + 1]; break; }
    }
    const f = Math.min(1, Math.max(0, (now - a.min) / (b.min - a.min || 1)));
    const status = mockStatus(t.slug, date);
    if (status.state !== "cancelled") {
      position = {
        lat: a.lat + (b.lat - a.lat) * f,
        lng: a.lng + (b.lng - a.lng) * f,
        nextStation: b.name,
        delayMin: status.state === "delayed" ? status.delayMin : 0,
        state: status.state === "delayed" ? "delayed" : "on_time",
      };
    }
  }

  return {
    slug: t.slug, number: t.number, category: t.category, name: t.name,
    route, position, runsToday, found: true,
  };
}
