import { trains } from "@/data/trains";
import { stationBySlug, majorStations } from "@/data/stations";
import { operatorBySlug } from "@/data/operators";
import { durationBetween } from "@/lib/schedule";
import { routeSlug } from "@/lib/slug";
import type { RouteInfo } from "@/lib/types";

function statsFor(fromSlug: string, toSlug: string) {
  let count = 0, minDur = Infinity, sumDur = 0, dist = 0;
  const ops = new Set<string>();
  for (const t of trains) {
    const i = t.stops.findIndex((s) => s.stationSlug === fromSlug);
    if (i === -1) continue;
    const j = t.stops.findIndex((s) => s.stationSlug === toSlug);
    if (j === -1 || i >= j) continue;
    const dep = t.stops[i].dep ?? t.stops[i].arr!;
    const arr = t.stops[j].arr ?? t.stops[j].dep!;
    const d = durationBetween(dep, arr);
    count++; sumDur += d;
    if (d < minDur) minDur = d;
    dist = Math.abs(t.stops[j].km - t.stops[i].km);
    ops.add(t.operatorSlug);
  }
  return { count, minDur: count ? minDur : 0, avgDur: count ? Math.round(sumDur / count) : 0, dist, operators: [...ops] };
}

// Construiește RouteInfo FĂRĂ a calcula isPopular (evită recursia cu getAllDirectRoutes).
function buildInfo(fromSlug: string, toSlug: string): RouteInfo | null {
  const from = stationBySlug(fromSlug);
  const to = stationBySlug(toSlug);
  if (!from || !to) return null;
  const s = statsFor(fromSlug, toSlug);
  return {
    slug: routeSlug(fromSlug, toSlug),
    fromSlug, toSlug,
    fromName: from.name, toName: to.name,
    fromCity: from.city, toCity: to.city,
    distanceKm: s.dist,
    minDurationMin: s.minDur,
    avgDurationMin: s.avgDur,
    dailyTrainsCount: s.count,
    hasDirect: s.count > 0,
    isPopular: false,
    operators: s.operators.map((o) => operatorBySlug(o)?.name ?? o),
    inverseSlug: routeSlug(toSlug, fromSlug),
  };
}

export function getRouteInfo(fromSlug: string, toSlug: string): RouteInfo | null {
  const info = buildInfo(fromSlug, toSlug);
  if (!info) return null;
  info.isPopular = popularSlugs().has(info.slug);
  return info;
}

export function getRouteBySlug(slug: string): RouteInfo | null {
  const parts = slug.split("-");
  for (let i = 1; i < parts.length; i++) {
    const fromSlug = parts.slice(0, i).join("-");
    const toSlug = parts.slice(i).join("-");
    if (stationBySlug(fromSlug) && stationBySlug(toSlug)) {
      const info = getRouteInfo(fromSlug, toSlug);
      if (info) return info;
    }
  }
  return null;
}

// ---------- Rute directe între gări MAJORE (din date reale) ----------
let _allMajorRoutes: RouteInfo[] | null = null;

export function getAllDirectRoutes(): RouteInfo[] {
  if (_allMajorRoutes) return _allMajorRoutes;
  const majorSet = new Set(majorStations().map((s) => s.slug));
  const pairs = new Set<string>();
  for (const t of trains) {
    const idx = t.stops.filter((s) => majorSet.has(s.stationSlug)).map((s) => s.stationSlug);
    for (let a = 0; a < idx.length; a++) {
      for (let b = a + 1; b < idx.length; b++) {
        if (idx[a] !== idx[b]) pairs.add(`${idx[a]}>${idx[b]}`);
      }
    }
  }
  const out: RouteInfo[] = [];
  for (const p of pairs) {
    const [f, t] = p.split(">");
    const info = buildInfo(f, t); // FĂRĂ isPopular -> fără recursie
    if (info && info.hasDirect) out.push(info);
  }
  _allMajorRoutes = out.sort((a, b) => b.dailyTrainsCount - a.dailyTrainsCount);
  return _allMajorRoutes;
}

// ---------- Top rute populare ----------
let _popularSlugs: Set<string> | null = null;

export function getPopularRoutes(limit = 12): RouteInfo[] {
  return getAllDirectRoutes().slice(0, limit);
}

function popularSlugs(): Set<string> {
  if (!_popularSlugs) {
    _popularSlugs = new Set(getAllDirectRoutes().slice(0, 24).map((r) => r.slug));
  }
  return _popularSlugs;
}

export const POPULAR_PAIRS: [string, string][] = []; // depreciat — calculăm dinamic
