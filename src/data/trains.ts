import type { Train, DayKey } from "@/lib/types";
import generated from "./generated.json";

const ALL: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// Fallback minimal când nu există import real (generated.json gol).
const MOCK_TRAINS: Train[] = [
  {
    id: 1, number: "1592", category: "IR", operatorSlug: "cfr-calatori", name: "Transilvania", slug: "ir-1592", runsDays: ALL,
    stops: [
      { stationSlug: "bucuresti-nord", seq: 1, arr: null, dep: "07:45", platform: "3", km: 0 },
      { stationSlug: "brasov", seq: 2, arr: "10:21", dep: null, platform: "4", km: 166 },
    ],
  },
];

type GeneratedTrain = Omit<Train, "name"> & { name?: string | null };

const gen = generated as unknown as { trains: GeneratedTrain[] };
export const trains: Train[] = gen.trains.length > 0
  ? gen.trains.map((t) => ({ ...t, name: t.name ?? undefined }))
  : MOCK_TRAINS;

const bySlug = new Map(trains.map((t) => [t.slug, t]));
export const trainBySlug = (slug: string) => bySlug.get(slug);
