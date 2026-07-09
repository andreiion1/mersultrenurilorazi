// Statistici reale pentru o gară, calculate din orarul oficial (fără date inventate).
import { trains } from "@/data/trains";
import { stationBySlug, stationRank } from "@/data/stations";
import { operatorBySlug } from "@/data/operators";
import { timeToMin } from "@/lib/schedule";
import type { DayKey } from "@/lib/types";

const DAYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export interface StationStats {
  servingTrains: number;                    // trenuri distincte care opresc aici
  maxTrainsPerDay: number;                  // trenuri în cea mai aglomerată zi
  directDestinations: number;               // gări accesibile fără schimbare
  operators: string[];                      // nume operatori
  categories: { cat: string; count: number }[];
  firstTrain: string | null;                // primul tren al zilei (oră)
  lastTrain: string | null;                 // ultimul tren al zilei (oră)
  farthest: { name: string; km: number } | null;
  peakHour: number | null;                  // ora (0-23) cu cele mai multe treceri
  hasData: boolean;
}

export interface DestCount { slug: string; name: string; count: number; }

/**
 * Toate destinațiile directe dintr-o gară (orice gară în aval, pe orice tren care pleacă de aici),
 * ordonate: 1) după numărul de trenuri directe către ea (desc); apoi, la egalitate,
 * 2) gările mari întâi; 3) alfabetic. Un tren numără o singură dată per destinație.
 */
export function directDestinationsRanked(slug: string): DestCount[] {
  if (!stationBySlug(slug)) return [];
  const counts = new Map<string, number>();
  for (const t of trains) {
    const i = t.stops.findIndex((s) => s.stationSlug === slug);
    if (i === -1) continue;
    const seen = new Set<string>();
    for (let k = i + 1; k < t.stops.length; k++) {
      const ds = t.stops[k].stationSlug;
      if (ds === slug || seen.has(ds)) continue;
      seen.add(ds);
      counts.set(ds, (counts.get(ds) ?? 0) + 1);
    }
  }
  const arr: (DestCount & { rank: number })[] = [];
  for (const [ds, count] of counts) {
    const st = stationBySlug(ds);
    if (!st) continue;
    arr.push({ slug: ds, name: st.name, count, rank: stationRank(st) });
  }
  arr.sort((a, b) =>
    b.count - a.count ||
    a.rank - b.rank ||
    a.name.localeCompare(b.name, "ro"),
  );
  return arr.map(({ slug, name, count }) => ({ slug, name, count }));
}

export function stationStats(slug: string): StationStats {
  const here = stationBySlug(slug);
  const empty: StationStats = {
    servingTrains: 0, maxTrainsPerDay: 0, directDestinations: 0, operators: [],
    categories: [], firstTrain: null, lastTrain: null, farthest: null, peakHour: null, hasData: false,
  };
  if (!here) return empty;

  const servingSet = new Set<string>();
  const destSet = new Set<string>();
  const operatorSet = new Set<string>();
  const catCount = new Map<string, number>();
  const perDay = new Map<DayKey, number>(DAYS.map((d) => [d, 0]));
  const hourHist = new Array(24).fill(0);
  let firstMin = Infinity, lastMin = -Infinity;
  let firstStr: string | null = null, lastStr: string | null = null;
  let farthest: { name: string; km: number } | null = null;

  for (const t of trains) {
    const i = t.stops.findIndex((s) => s.stationSlug === slug);
    if (i === -1) continue;
    servingSet.add(t.slug);
    operatorSet.add(operatorBySlug(t.operatorSlug)?.name ?? t.operatorSlug);
    catCount.set(t.category, (catCount.get(t.category) ?? 0) + 1);

    const stop = t.stops[i];
    // Datele au adesea doar ora de sosire la gările de tranzit → folosim dep ?? arr.
    const time = stop.dep ?? stop.arr;

    // destinații directe + cea mai lungă rută directă (doar dacă trenul continuă)
    for (let k = i + 1; k < t.stops.length; k++) {
      const ds = t.stops[k];
      destSet.add(ds.stationSlug);
      const km = Math.abs(ds.km - stop.km);
      if (!farthest || km > farthest.km) {
        farthest = { name: stationBySlug(ds.stationSlug)?.name ?? ds.stationSlug, km };
      }
    }

    if (time) {
      // trenuri care opresc aici, pe zi
      for (const d of t.runsDays) perDay.set(d, (perDay.get(d) ?? 0) + 1);
      // primul/ultimul tren + oră de vârf
      const m = timeToMin(time);
      if (m < firstMin) { firstMin = m; firstStr = time; }
      if (m > lastMin) { lastMin = m; lastStr = time; }
      hourHist[Math.floor(m / 60) % 24]++;
    }
  }

  if (servingSet.size === 0) return empty;

  const maxTrainsPerDay = Math.max(0, ...Array.from(perDay.values()));
  const peakHour = hourHist.some((n) => n > 0) ? hourHist.indexOf(Math.max(...hourHist)) : null;
  const categories = Array.from(catCount.entries())
    .map(([cat, count]) => ({ cat, count }))
    .sort((a, b) => b.count - a.count);

  return {
    servingTrains: servingSet.size,
    maxTrainsPerDay,
    directDestinations: destSet.size,
    operators: Array.from(operatorSet),
    categories,
    firstTrain: firstStr,
    lastTrain: lastStr,
    farthest,
    peakHour,
    hasData: true,
  };
}
