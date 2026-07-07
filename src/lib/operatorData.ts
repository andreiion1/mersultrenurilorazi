// Date agregate per operator: câte trenuri, ce categorii, ce rute majore, câte gări.
import { trains } from "@/data/trains";
import { stationBySlug, majorStations } from "@/data/stations";
import { operators } from "@/data/operators";
import { routeSlug } from "@/lib/slug";

export interface OperatorRoute { slug: string; fromCity: string; toCity: string; count: number; }
export interface OperatorInfo {
  trainCount: number;
  stationCount: number;
  categories: { cat: string; count: number }[];
  topRoutes: OperatorRoute[];
}

/** Operatori care au cel puțin un tren în date (pentru pagini/index). */
export function operatorsWithTrains() {
  const counts = new Map<string, number>();
  for (const t of trains) counts.set(t.operatorSlug, (counts.get(t.operatorSlug) ?? 0) + 1);
  return operators
    .filter((o) => (counts.get(o.slug) ?? 0) > 0)
    .map((o) => ({ ...o, trainCount: counts.get(o.slug) ?? 0 }))
    .sort((a, b) => b.trainCount - a.trainCount);
}

export function operatorInfo(slug: string): OperatorInfo {
  const opTrains = trains.filter((t) => t.operatorSlug === slug);
  const cats = new Map<string, number>();
  const stationSet = new Set<string>();
  const majorSet = new Set(majorStations().map((s) => s.slug));
  const routes = new Map<string, OperatorRoute>();

  for (const t of opTrains) {
    cats.set(t.category, (cats.get(t.category) ?? 0) + 1);
    const majorsOnRoute: string[] = [];
    for (const s of t.stops) {
      stationSet.add(s.stationSlug);
      if (majorSet.has(s.stationSlug)) majorsOnRoute.push(s.stationSlug);
    }
    for (let a = 0; a < majorsOnRoute.length; a++) {
      for (let b = a + 1; b < majorsOnRoute.length; b++) {
        const from = majorsOnRoute[a], to = majorsOnRoute[b];
        if (from === to) continue;
        const rs = routeSlug(from, to);
        if (!routes.has(rs)) {
          routes.set(rs, {
            slug: rs,
            fromCity: stationBySlug(from)?.city ?? from,
            toCity: stationBySlug(to)?.city ?? to,
            count: 0,
          });
        }
        routes.get(rs)!.count++;
      }
    }
  }

  return {
    trainCount: opTrains.length,
    stationCount: stationSet.size,
    categories: Array.from(cats.entries()).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count),
    topRoutes: Array.from(routes.values()).sort((a, b) => b.count - a.count),
  };
}
