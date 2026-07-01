import { trains, trainBySlug } from "@/data/trains";
import { stationBySlug } from "@/data/stations";
import { operatorBySlug } from "@/data/operators";
import { tariffPrice } from "@/data/tariff";
import type {
  Train, TrainStop, DayKey, SearchResult, Leg, RunStatus, ResultBadge,
} from "@/lib/types";

// ---------- Helpers timp ----------
export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minToTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Diferență în minute între dep și arr, gestionând trecerea peste miezul nopții. */
export function durationBetween(dep: string, arr: string): number {
  let d = timeToMin(arr) - timeToMin(dep);
  if (d < 0) d += 1440;
  return d;
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m}m`;
}

const DAY_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
export function dayKeyOf(dateISO: string): DayKey {
  const d = new Date(dateISO + "T00:00:00");
  return DAY_KEYS[d.getDay()];
}

// Data „azi"/„mâine" pe fusul României (nu UTC — altfel între 00:00 și 02:00/03:00
// ora locală site-ul ar afișa trenurile de ieri).
const RO_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest", year: "numeric", month: "2-digit", day: "2-digit" });

export function todayISO(): string {
  return RO_DATE.format(new Date());
}
export function tomorrowISO(): string {
  return RO_DATE.format(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

// ---------- Preț standard clasa 2 (grila oficială CFR) ----------
// Folosește grila de tarife din src/data/tariff.ts (preț standard, degresiv pe distanță).
// Reducerile/promoțiile nu sunt incluse — pentru tariful exact, butonul „Cumpără bilet" → CFR.
export function estimatePrice(km: number, category: Train["category"]): number {
  return tariffPrice(km, category);
}

// ---------- Status tren ----------
// IMPLICIT (onest): afișăm doar orarul programat, FĂRĂ a inventa întârzieri.
// Statusul real vine din IRIS (vezi src/lib/iris.ts) — async, doar unde e nevoie.
// Pentru demonstrații cu întârzieri simulate, setează NEXT_PUBLIC_DEMO_DELAYS=1.
const DEMO_DELAYS = process.env.NEXT_PUBLIC_DEMO_DELAYS === "1";

export function mockStatus(trainSlug: string, dateISO: string): RunStatus {
  if (!DEMO_DELAYS) {
    return { delayMin: 0, state: "scheduled", observedAt: null, source: "official_xml" };
  }
  const seed = [...(trainSlug + dateISO)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = seed % 100;
  if (r < 62) return { delayMin: 0, state: "on_time", observedAt: nowHHmm(), source: "mock" };
  if (r < 92) return { delayMin: (seed % 25) + 3, state: "delayed", observedAt: nowHHmm(), source: "mock" };
  return { delayMin: 0, state: "cancelled", observedAt: nowHHmm(), source: "mock" };
}
function nowHHmm(): string {
  return new Date().toISOString().slice(11, 16);
}

// ---------- Deep-link bilet ----------
export function ticketUrl(operatorSlug: string, fromName: string, toName: string, dateISO: string): string {
  const op = operatorBySlug(operatorSlug);
  if (!op) return "https://bilete.cfrcalatori.ro/";
  return op.ticketUrlPattern
    .replace("{from}", encodeURIComponent(fromName))
    .replace("{to}", encodeURIComponent(toName))
    .replace("{date}", dateISO);
}

// ---------- Indexare opriri ----------
function stopIndex(t: Train, slug: string): number {
  return t.stops.findIndex((s) => s.stationSlug === slug);
}

function legFromTrain(t: Train, fromSlug: string, toSlug: string): Leg | null {
  const i = stopIndex(t, fromSlug);
  const j = stopIndex(t, toSlug);
  if (i === -1 || j === -1 || i >= j) return null;
  const fromStop = t.stops[i];
  const toStop = t.stops[j];
  const dep = fromStop.dep ?? fromStop.arr!;
  const arr = toStop.arr ?? toStop.dep!;
  return {
    train: { slug: t.slug, category: t.category, number: t.number, name: t.name, operatorSlug: t.operatorSlug },
    fromSlug, toSlug,
    fromName: stationBySlug(fromSlug)?.name ?? fromSlug,
    toName: stationBySlug(toSlug)?.name ?? toSlug,
    depTime: dep,
    arrTime: arr,
    durationMin: durationBetween(dep, arr),
  };
}

function kmBetween(t: Train, fromSlug: string, toSlug: string): number {
  const i = stopIndex(t, fromSlug);
  const j = stopIndex(t, toSlug);
  return Math.abs((t.stops[j]?.km ?? 0) - (t.stops[i]?.km ?? 0));
}

// ---------- Căutare directe ----------
export function searchDirect(fromSlug: string, toSlug: string, dateISO: string): SearchResult[] {
  const day = dayKeyOf(dateISO);
  const out: SearchResult[] = [];
  for (const t of trains) {
    if (!t.runsDays.includes(day)) continue;
    const leg = legFromTrain(t, fromSlug, toSlug);
    if (!leg) continue;
    const km = kmBetween(t, fromSlug, toSlug);
    out.push({
      type: "direct",
      trainSlug: t.slug,
      legs: [leg],
      depTime: leg.depTime,
      arrTime: leg.arrTime,
      totalDurationMin: leg.durationMin,
      changesCount: 0,
      distanceKm: km,
      operatorSlug: t.operatorSlug,
      badges: ["direct"],
      priceFrom: { amount: estimatePrice(km, t.category), currency: "RON", estimated: true },
      ticketUrl: ticketUrl(t.operatorSlug, leg.fromName, leg.toName, dateISO),
      status: mockStatus(t.slug, dateISO),
    });
  }
  return out.sort((a, b) => timeToMin(a.depTime) - timeToMin(b.depTime));
}

// ---------- Căutare cu 1 schimbare ----------
const MIN_CONNECTION_MIN = 8;
const MAX_CONNECTION_MIN = 180;

export function searchConnections(fromSlug: string, toSlug: string, dateISO: string): SearchResult[] {
  const day = dayKeyOf(dateISO);
  const out: SearchResult[] = [];

  // Pre-indexare într-o singură trecere prin toate trenurile:
  // legsFrom[hub] = toate leg-urile fromSlug→hub din ziua respectivă
  // legsTo[hub]   = toate leg-urile hub→toSlug din ziua respectivă
  const legsFrom = new Map<string, Leg[]>();
  const legsTo   = new Map<string, Leg[]>();

  for (const t of trains) {
    if (!t.runsDays.includes(day)) continue;
    const i = stopIndex(t, fromSlug);
    if (i !== -1) {
      // toate stațiile după fromSlug sunt hub-uri potențiale
      for (let k = i + 1; k < t.stops.length; k++) {
        const hubSlug = t.stops[k].stationSlug;
        if (hubSlug === toSlug || hubSlug === fromSlug) continue;
        const leg = legFromTrain(t, fromSlug, hubSlug);
        if (leg) {
          const arr = legsFrom.get(hubSlug) ?? [];
          arr.push(leg);
          legsFrom.set(hubSlug, arr);
        }
      }
    }
    const j = stopIndex(t, toSlug);
    if (j > 0) {
      // toate stațiile înainte de toSlug sunt hub-uri potențiale
      for (let k = 0; k < j; k++) {
        const hubSlug = t.stops[k].stationSlug;
        if (hubSlug === fromSlug || hubSlug === toSlug) continue;
        const leg = legFromTrain(t, hubSlug, toSlug);
        if (leg) {
          const arr = legsTo.get(hubSlug) ?? [];
          arr.push(leg);
          legsTo.set(hubSlug, arr);
        }
      }
    }
  }

  // Joinuim doar hub-urile care apar în ambele indexuri
  for (const [hub, first] of legsFrom) {
    const second = legsTo.get(hub);
    if (!second) continue;
    for (const a of first) {
      for (const b of second) {
        if (a.train.slug === b.train.slug) continue;
        const wait = timeToMin(b.depTime) - timeToMin(a.arrTime);
        if (wait < MIN_CONNECTION_MIN || wait > MAX_CONNECTION_MIN) continue;
        const total = durationBetween(a.depTime, b.arrTime);
        const t1 = trainBySlug(a.train.slug)!;
        const t2 = trainBySlug(b.train.slug)!;
        const km = kmBetween(t1, fromSlug, hub) + kmBetween(t2, hub, toSlug);
        out.push({
          type: "connection",
          legs: [a, b],
          depTime: a.depTime,
          arrTime: b.arrTime,
          totalDurationMin: total,
          changesCount: 1,
          distanceKm: km,
          operatorSlug: a.train.operatorSlug,
          badges: [],
          priceFrom: { amount: estimatePrice(km, "IR"), currency: "RON", estimated: true },
          ticketUrl: ticketUrl(a.train.operatorSlug, a.fromName, b.toName, dateISO),
          status: mockStatus(a.train.slug, dateISO),
        });
      }
    }
  }

  // dedup pe (train1+train2) păstrând cel mai scurt
  const seen = new Map<string, SearchResult>();
  for (const r of out) {
    const key = r.legs.map((l) => l.train.slug).join(">");
    const prev = seen.get(key);
    if (!prev || r.totalDurationMin < prev.totalDurationMin) seen.set(key, r);
  }
  return [...seen.values()].sort((a, b) => a.totalDurationMin - b.totalDurationMin).slice(0, 6);
}

// ---------- Căutare combinată + badge-uri ----------
export function search(fromSlug: string, toSlug: string, dateISO: string) {
  if (fromSlug === toSlug) return { direct: [], connections: [], all: [] };
  const direct = searchDirect(fromSlug, toSlug, dateISO);
  const connections = direct.length >= 3 ? [] : searchConnections(fromSlug, toSlug, dateISO);
  const all = [...direct, ...connections];
  if (all.length) {
    // fastest
    const fastest = all.reduce((m, r) => (r.totalDurationMin < m.totalDurationMin ? r : m));
    if (!fastest.badges.includes("fastest")) fastest.badges.push("fastest");
    // cheapest
    const cheapest = all.reduce((m, r) => (r.priceFrom.amount < m.priceFrom.amount ? r : m));
    if (!cheapest.badges.includes("cheapest")) cheapest.badges.push("cheapest");
  }
  return { direct, connections, all };
}

// ---------- Plecări / sosiri ----------
export interface BoardRow {
  time: string;
  trainSlug: string;
  category: Train["category"];
  number: string;
  towardsName: string;
  fromName: string;
  platform?: string;
  operatorSlug: string;
  status: RunStatus;
}

export function departures(stationSlug: string, dateISO: string): BoardRow[] {
  const day = dayKeyOf(dateISO);
  const rows: BoardRow[] = [];
  for (const t of trains) {
    if (!t.runsDays.includes(day)) continue;
    const i = stopIndex(t, stationSlug);
    if (i === -1 || i === t.stops.length - 1) continue; // nu e plecare dacă e ultima stație
    const stop = t.stops[i];
    if (!stop.dep) continue;
    const dest = t.stops[t.stops.length - 1];
    rows.push({
      time: stop.dep,
      trainSlug: t.slug, category: t.category, number: t.number,
      towardsName: stationBySlug(dest.stationSlug)?.name ?? dest.stationSlug,
      fromName: stationBySlug(stationSlug)?.name ?? stationSlug,
      platform: stop.platform, operatorSlug: t.operatorSlug,
      status: mockStatus(t.slug, dateISO),
    });
  }
  return rows.sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
}

export function arrivals(stationSlug: string, dateISO: string): BoardRow[] {
  const day = dayKeyOf(dateISO);
  const rows: BoardRow[] = [];
  for (const t of trains) {
    if (!t.runsDays.includes(day)) continue;
    const i = stopIndex(t, stationSlug);
    if (i <= 0) continue; // nu e sosire dacă e prima stație
    const stop = t.stops[i];
    if (!stop.arr) continue;
    const origin = t.stops[0];
    rows.push({
      time: stop.arr,
      trainSlug: t.slug, category: t.category, number: t.number,
      towardsName: stationBySlug(stationSlug)?.name ?? stationSlug,
      fromName: stationBySlug(origin.stationSlug)?.name ?? origin.stationSlug,
      platform: stop.platform, operatorSlug: t.operatorSlug,
      status: mockStatus(t.slug, dateISO),
    });
  }
  return rows.sort((a, b) => timeToMin(a.time) - timeToMin(b.time));
}

// ---------- Întârzieri live (mock) ----------
export interface LiveDelay {
  trainSlug: string; category: Train["category"]; number: string;
  routeLabel: string; delayMin: number; atStation: string; observedAt: string; operatorSlug: string;
}
export function liveDelays(dateISO: string): LiveDelay[] {
  const out: LiveDelay[] = [];
  for (const t of trains) {
    const st = mockStatus(t.slug, dateISO);
    if (st.state !== "delayed") continue;
    const origin = stationBySlug(t.stops[0].stationSlug)?.name ?? "";
    const dest = stationBySlug(t.stops[t.stops.length - 1].stationSlug)?.name ?? "";
    const mid = t.stops[Math.floor(t.stops.length / 2)];
    out.push({
      trainSlug: t.slug, category: t.category, number: t.number,
      routeLabel: `${origin} – ${dest}`,
      delayMin: st.delayMin,
      atStation: stationBySlug(mid.stationSlug)?.name ?? "",
      observedAt: st.observedAt ?? "",
      operatorSlug: t.operatorSlug,
    });
  }
  return out.sort((a, b) => b.delayMin - a.delayMin);
}

// ---------- Istoric întârziere (mock) ----------
export function delayHistory(trainSlug: string) {
  const seed = [...trainSlug].reduce((a, c) => a + c.charCodeAt(0), 0);
  const avg = (seed % 12) + 2;
  const onTime = 95 - avg * 2;
  const risk = avg < 6 ? 1 : avg < 10 ? 2 : 3;
  return { avgDelayMin: avg, onTimePct: Math.max(40, onTime), riskLevel: risk as 1 | 2 | 3 };
}
