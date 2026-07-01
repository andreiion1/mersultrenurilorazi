import type { Station } from "@/lib/types";
import generated from "./generated.json";
import { GEO } from "./geo";

// Fallback minimal când nu există import real (generated.json gol).
const MOCK_STATIONS: Station[] = [
  { id: 1, name: "București Nord", slug: "bucuresti-nord", city: "București", citySlug: "bucuresti", county: "București", region: "Muntenia", lat: 44.4460, lng: 26.0739, isMajor: true, platformsCount: 14, aliases: ["Gara de Nord"] },
  { id: 6, name: "Brașov", slug: "brasov", city: "Brașov", citySlug: "brasov", county: "Brașov", region: "Transilvania", lat: 45.6520, lng: 25.5910, isMajor: true, platformsCount: 10 },
  { id: 10, name: "Constanța", slug: "constanta", city: "Constanța", citySlug: "constanta", county: "Constanța", region: "Dobrogea", lat: 44.1730, lng: 28.6380, isMajor: true, platformsCount: 8 },
];

interface GenStation {
  id: number; name: string; slug: string; city: string; citySlug: string;
  county: string; region: string; lat: number; lng: number; isMajor: boolean; aliases: string[];
}
const gen = generated as { stations: GenStation[] };

// Corectează diacriticele cu sedilă (ş/ţ) în cele cu virgulă (ș/ț) — standardul corect românesc.
function fixDia(s: string): string {
  return s.replace(/ş/g, "ș").replace(/ţ/g, "ț").replace(/Ş/g, "Ș").replace(/Ţ/g, "Ț");
}
function slugifyCity(s: string) {
  const map: Record<string, string> = { "ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t","Ă":"a","Â":"a","Î":"i","Ș":"s","Ş":"s","Ț":"t","Ţ":"t" };
  return s.split("").map((c) => map[c] ?? c).join("").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/** Tip gară: 0 = gară mare, 1 = gară normală, 2 = haltă (h./Hm./hc.). Pentru sortare în căutare. */
export function stationRank(s: Station): 0 | 1 | 2 {
  if (s.isMajor) return 0;
  if (/\b(h|hm|hc|hcv)\.?$/i.test(s.name)) return 2;
  return 1;
}

export const stations: Station[] =
  gen.stations.length > 0
    ? gen.stations.map((g) => {
        const geo = GEO[g.slug];
        const name = fixDia(geo?.name ?? g.name);
        const city = fixDia(geo?.city ?? g.city);
        return {
          ...g,
          name,
          city,
          citySlug: slugifyCity(city),
          county: geo?.county ?? fixDia(g.county),
          region: geo?.region ?? g.region,
          lat: geo?.lat ?? g.lat,
          lng: geo?.lng ?? g.lng,
          isMajor: geo?.isMajor ?? g.isMajor,
          aliases: geo?.aliases ?? g.aliases,
          mapQuery: geo?.mapQuery,
        } as Station;
      })
    : MOCK_STATIONS;

const bySlug = new Map(stations.map((s) => [s.slug, s]));
export const stationBySlug = (slug: string): Station | undefined => bySlug.get(slug);

// Ordinea de importanță a orașelor mari (după mărime/trafic) — pentru footer, homepage etc.
const CITY_PRIORITY = [
  "bucuresti-nord-gr-a", "cluj-napoca", "timisoara-nord", "iasi", "constanta", "brasov",
  "craiova", "galati", "ploiesti-vest", "oradea", "braila", "arad", "sibiu", "bacau",
  "targu-mures", "baia-mare", "buzau", "botosani", "satu-mare", "piatra-neamt",
  "ramnicu-valcea", "suceava", "pitesti", "focsani",
];
const cityPrio = (slug: string) => {
  const i = CITY_PRIORITY.indexOf(slug);
  return i === -1 ? 999 : i;
};

// Gările mari, ordonate după mărimea orașului (cele mai importante primele).
export const majorStations = (): Station[] =>
  stations
    .filter((s) => s.isMajor)
    .sort((a, b) => cityPrio(a.slug) - cityPrio(b.slug) || a.name.localeCompare(b.name, "ro"));
export const geoStations = (): Station[] => stations.filter((s) => s.lat !== 0 && s.lng !== 0);
