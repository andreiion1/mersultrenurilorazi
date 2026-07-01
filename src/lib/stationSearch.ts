// Cautare gari 100% client-side, din index compact (src/data/stations-index.json).
// Fara API/server -> autocomplete-ul "de unde/unde" merge mereu, instant.
// Indexul are doar slug/nume/oras/rang (~88KB), NU datele mari de orar.

import indexData from "@/data/stations-index.json";

export interface StationOpt { slug: string; name: string; city: string; }
interface Entry { s: string; n: string; c: string; r: number } // slug, name, city, rank(0 mare,1 normal,2 halta)

const INDEX = indexData as Entry[];

// Normalizare pentru potrivire (fara diacritice).
const DIA: Record<string, string> = { "ă":"a","â":"a","î":"i","ș":"s","ş":"s","ț":"t","ţ":"t","Ă":"a","Â":"a","Î":"i","Ș":"s","Ş":"s","Ț":"t","Ţ":"t" };
const norm = (s: string) =>
  s.split("").map((c) => DIA[c] ?? c).join("").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// Precalculam formele normalizate o singura data.
const PREP = INDEX.map((e) => ({ e, nn: norm(e.n), nc: norm(e.c) }));

const toOpt = (e: Entry): StationOpt => ({ slug: e.s, name: e.n, city: e.c });

/** Gari mari pentru starea goala a dropdown-ului. */
export const majorOptions: StationOpt[] = INDEX.filter((e) => e.r === 0).map(toOpt);

/**
 * Cautare gari (sincron). Fara text -> gari mari. Cu text -> potriviri,
 * cu garile mari si potrivirile pe prefix prioritizate.
 */
export function searchStations(q: string, limit = 8): StationOpt[] {
  const n = norm(q);
  if (!n) return majorOptions.slice(0, limit);
  const scored: { e: Entry; score: number }[] = [];
  for (const { e, nn, nc } of PREP) {
    const inName = nn.includes(n);
    const inCity = nc.includes(n);
    if (!inName && !inCity) continue;
    const starts = nn.startsWith(n) || nc.startsWith(n);
    scored.push({ e, score: (starts ? 0 : 100) + e.r * 10 + Math.min(9, Math.floor(e.n.length / 6)) });
  }
  scored.sort((a, b) => a.score - b.score || a.e.n.localeCompare(b.e.n, "ro"));
  return scored.slice(0, limit).map((x) => toOpt(x.e));
}
