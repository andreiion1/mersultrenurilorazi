import { trains } from "@/data/trains";
import { stationBySlug } from "@/data/stations";
import { mockStatus, timeToMin, dayKeyOf, todayISO } from "@/lib/schedule";

export interface TrainPosition {
  trainSlug: string;
  number: string;
  category: string;
  name?: string;
  lat: number;
  lng: number;
  fromCity: string;
  toCity: string;
  nextStation: string;
  delayMin: number;
  state: "on_time" | "delayed";
}

/**
 * Poziții aproximative ale trenurilor active acum, interpolate între gările cu coordonate
 * cunoscute, pe baza orarului. MOCK / semi-live. TODO: înlocuit cu poziții reale (parteneriat/IRIS).
 */
export function liveTrainPositions(nowMin?: number, dateISO?: string): TrainPosition[] {
  const date = dateISO ?? todayISO();
  const day = dayKeyOf(date);
  const now = nowMin ?? (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); })();
  const out: TrainPosition[] = [];

  for (const t of trains) {
    if (!t.runsDays.includes(day)) continue;

    // opriri cu coordonate cunoscute + timpul lor
    const pts = t.stops
      .map((s) => {
        const st = stationBySlug(s.stationSlug);
        const time = s.arr ?? s.dep;
        if (!st || st.lat === 0 || st.lng === 0 || !time) return null;
        return { lat: st.lat, lng: st.lng, min: timeToMin(time), name: st.name };
      })
      .filter((x): x is { lat: number; lng: number; min: number; name: string } => x !== null)
      // monoton crescător (ignoră trecerea peste miezul nopții)
      .filter((p, i, arr) => i === 0 || p.min > arr[i - 1].min);

    if (pts.length < 2) continue;
    const first = pts[0], last = pts[pts.length - 1];
    if (now < first.min || now > last.min) continue;

    let a = pts[0], b = pts[1];
    for (let i = 0; i < pts.length - 1; i++) {
      if (now >= pts[i].min && now <= pts[i + 1].min) { a = pts[i]; b = pts[i + 1]; break; }
    }
    const span = b.min - a.min || 1;
    const f = Math.min(1, Math.max(0, (now - a.min) / span));
    const lat = a.lat + (b.lat - a.lat) * f;
    const lng = a.lng + (b.lng - a.lng) * f;

    const status = mockStatus(t.slug, date);
    if (status.state === "cancelled") continue;

    const origin = stationBySlug(t.stops[0].stationSlug);
    const dest = stationBySlug(t.stops[t.stops.length - 1].stationSlug);

    out.push({
      trainSlug: t.slug,
      number: t.number,
      category: t.category,
      name: t.name,
      lat, lng,
      fromCity: origin?.city ?? "",
      toCity: dest?.city ?? "",
      nextStation: b.name,
      delayMin: status.state === "delayed" ? status.delayMin : 0,
      state: status.state === "delayed" ? "delayed" : "on_time",
    });
  }
  return out;
}
