// Tipuri de date — aliniate la docs/03-database-design.md (versiune mock pentru MVP)

export type TrainCategory = "R" | "RE" | "IR" | "IRN" | "IC";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Operator {
  slug: string;
  name: string;
  shortName: string;
  website: string;
  ticketUrlPattern: string; // {from} {to} {date}
  colorHex: string;
}

export interface Station {
  id: number;
  name: string;
  slug: string;
  city: string;
  citySlug: string;
  county: string;
  region: string;
  lat: number;
  lng: number;
  isMajor: boolean;
  platformsCount?: number;
  aliases?: string[];
  mapQuery?: string; // interogare Google Maps pentru locul exact (ex. "Gara de Nord București")
}

export interface TrainStop {
  stationSlug: string;
  seq: number;
  arr: string | null; // "HH:mm"
  dep: string | null; // "HH:mm"
  platform?: string;
  km: number;
}

export interface Train {
  id: number;
  number: string;
  category: TrainCategory;
  operatorSlug: string;
  name?: string;
  slug: string; // "ir-1592"
  runsDays: DayKey[];
  stops: TrainStop[];
}

export interface RunStatus {
  delayMin: number;
  state: "on_time" | "delayed" | "cancelled" | "scheduled";
  observedAt: string | null;
  atStation?: string;
  source: "mock" | "official_xml" | "iris_semi_live";
}

export interface Leg {
  train: Pick<Train, "slug" | "category" | "number" | "name" | "operatorSlug">;
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  depTime: string;
  arrTime: string;
  durationMin: number;
}

export type ResultBadge = "fastest" | "cheapest" | "direct";

export interface SearchResult {
  type: "direct" | "connection";
  trainSlug?: string;
  legs: Leg[];
  depTime: string;
  arrTime: string;
  totalDurationMin: number;
  changesCount: number;
  distanceKm: number;
  operatorSlug: string;
  badges: ResultBadge[];
  priceFrom: { amount: number; currency: "RON"; estimated: true };
  ticketUrl: string;
  status: RunStatus;
}

export interface RouteInfo {
  slug: string;
  fromSlug: string;
  toSlug: string;
  fromName: string;
  toName: string;
  fromCity: string;
  toCity: string;
  distanceKm: number;
  minDurationMin: number;
  avgDurationMin: number;
  dailyTrainsCount: number;
  hasDirect: boolean;
  isPopular: boolean;
  operators: string[];
  inverseSlug: string;
}
