#!/usr/bin/env node
/**
 * Importer orar XML (data.gov.ro „Mers tren", schema XmlIf / trnIfSchema_v4) -> date pentru site.
 *
 * UTILIZARE:
 *   1. Pune fisierul in:  app/data-sources/mers-tren.xml
 *   2. Ruleaza:           npm run import:xml
 *   3. Se genereaza:      src/data/generated.json  (folosit automat de site)
 *
 * Structura reala a fisierului:
 *   XmlIf > XmlMts > Mt > Trenuri > Tren[@Numar,@CategorieTren,@Operator]
 *     > Trase > Trasa[@Tip="Implicita"] > ElementTrasa[@DenStaOrigine,@DenStaDestinatie,@OraP,@OraS,@Km,@StationareSecunde,@Secventa]
 *   Orele (OraP/OraS) sunt in SECUNDE de la miezul noptii. Km este lungimea segmentului in metri.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const XML_PATH = process.env.XML_PATH || resolve(ROOT, "data-sources", "mers-tren.xml");
const OUT_PATH = process.env.OUT_PATH || resolve(ROOT, "src", "data", "generated.json");
const INSPECT = process.argv.includes("--inspect");

// ---------- slug (identic cu src/lib/slug.ts) ----------
const DIA = { "ă":"a","â":"a","î":"i","ş":"s","ș":"s","ţ":"t","ț":"t",
              "Ă":"a","Â":"a","Î":"i","Ş":"s","Ș":"s","Ţ":"t","Ț":"t" };
const slugify = (s) => String(s ?? "")
  .split("").map((c) => DIA[c] ?? c).join("")
  .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ---------- mapping categorii oficiale -> categoriile site-ului ----------
const CAT_MAP = { "R": "R", "R-E": "RE", "R-M": "R", "IC": "IC", "IR": "IR", "IR-N": "IRN" };

// ---------- operatori cunoscuti (cod -> nume/slug) ----------
const OPERATORS = { "6100826": { name: "CFR Călători", slug: "cfr-calatori" } };
const opOf = (code) => OPERATORS[code] || { name: "CFR Călători", slug: "cfr-calatori" };

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const secToTime = (sec) => {
  const v = ((Number(sec) % 86400) + 86400) % 86400;
  return `${String(Math.floor(v / 3600)).padStart(2, "0")}:${String(Math.floor((v % 3600) / 60)).padStart(2, "0")}`;
};
const cityOf = (name) => name.replace(/\b(h|hc|hm|hcv|halta|haltă)\.?\b.*$/i, "").trim().split(/\s+/)[0] || name;

function main() {
  if (!existsSync(XML_PATH)) {
    console.error(`\n[EROARE] Nu gasesc fisierul XML la:\n  ${XML_PATH}\nVezi scripts/README-import.md.\n`);
    process.exit(1);
  }
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", trimValues: true });
  const j = parser.parse(readFileSync(XML_PATH, "utf8"));

  if (INSPECT) { console.log(JSON.stringify(j, null, 2).slice(0, 4000)); return; }

  const mts = asArray(j?.XmlIf?.XmlMts?.Mt);
  if (!mts.length) { console.error("[EROARE] Structura neasteptata: lipseste XmlIf>XmlMts>Mt. Ruleaza --inspect."); process.exit(1); }

  let trenNodes = [], validFrom, validTo;
  for (const m of mts) {
    validFrom = validFrom || m.MtValabilDeLa;
    validTo = validTo || m.MtValabilPinaLa;
    trenNodes = trenNodes.concat(asArray(m?.Trenuri?.Tren));
  }
  console.log(`Trenuri in fisier: ${trenNodes.length}`);

  const stationsMap = new Map();
  let idStation = 1, idTrain = 1;
  const usedSlugs = new Set();
  const trains = [];

  const ensureStation = (code, name) => {
    const key = code || slugify(name);
    if (!stationsMap.has(key)) {
      const base = slugify(name);
      let s = base, k = 2;
      while ([...stationsMap.values()].some((x) => x.slug === s)) s = `${base}-${k++}`;
      stationsMap.set(key, {
        id: idStation++, name, slug: s,
        city: cityOf(name), citySlug: slugify(cityOf(name)),
        county: "", region: "", lat: 0, lng: 0, isMajor: false, aliases: [],
      });
    }
    return stationsMap.get(key);
  };

  for (const t of trenNodes) {
    const number = String(t.Numar ?? "").trim();
    if (!number) continue;
    const category = CAT_MAP[String(t.CategorieTren ?? "R").trim()] || "R";
    const op = opOf(String(t.Operator ?? ""));
    const trasee = asArray(t?.Trase?.Trasa);
    const trasa = trasee.find((x) => x.Tip === "Implicita") || trasee[0];
    const elems = asArray(trasa?.ElementTrasa).sort((a, b) => Number(a.Secventa) - Number(b.Secventa));
    if (elems.length < 1) continue;

    const raw = [];
    let cumKm = 0;
    const first = elems[0];
    const origin = ensureStation(first.CodStaOrigine, String(first.DenStaOrigine).trim());
    raw.push({ st: origin, arr: null, dep: secToTime(first.OraP), km: 0, stop: true });
    for (let i = 0; i < elems.length; i++) {
      const e = elems[i];
      cumKm += (Number(e.Km) || 0) / 1000;
      const dest = ensureStation(e.CodStaDest, String(e.DenStaDestinatie).trim());
      const next = elems[i + 1];
      const isLast = i === elems.length - 1;
      raw.push({ st: dest, arr: secToTime(e.OraS), dep: next ? secToTime(next.OraP) : null, km: Math.round(cumKm), stop: isLast || Number(e.StationareSecunde) > 0 });
    }
    const filtered = raw.filter((r, i) => r.stop || i === 0 || i === raw.length - 1);
    if (filtered.length < 2) continue;

    const base = `${category.toLowerCase()}-${slugify(number)}`;
    let s = base, k = 2;
    while (usedSlugs.has(s)) s = `${base}-${k++}`;
    usedSlugs.add(s);

    // Zile reale de circulație din CalendarTren.Zile (bitmask: bit0=Luni .. bit6=Duminică).
    const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    const cals = asArray(t?.RestrictiiTren?.CalendarTren);
    let mask = 0;
    for (const c of cals) mask |= (Number(c?.Zile) || 0) & 0b1111111;
    let runsDays = DAYS.filter((_, i) => mask & (1 << i));
    if (runsDays.length === 0) runsDays = [...DAYS]; // fallback dacă nu putem determina

    trains.push({
      id: idTrain++, number, category, operatorSlug: op.slug,
      name: t.Nume ? String(t.Nume).trim() : undefined,
      slug: s,
      runsDays,
      stops: filtered.map((r, i) => ({ stationSlug: r.st.slug, seq: i + 1, arr: r.arr, dep: r.dep, km: r.km })),
    });
  }

  const stations = [...stationsMap.values()];
  const out = {
    generatedAt: new Date().toISOString(),
    source: `data.gov.ro mers-tren XML (valabil ${validFrom || "?"}-${validTo || "?"})`,
    counts: { stations: stations.length, trains: trains.length },
    stations, trains,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out), "utf8");
  console.log(`\nOK Generat: ${OUT_PATH}`);
  console.log(`  Statii: ${stations.length} - Trenuri: ${trains.length}`);
  console.log("\nTODO ulterior: geocodare gari (lat/lng), zile reale de circulatie, judet/regiune, gari majore.");
}

main();
