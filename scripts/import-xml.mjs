#!/usr/bin/env node
/**
 * Importer orar XML (data.gov.ro „Mers tren", schema XmlIf) -> date pentru site.
 * MULTI-OPERATOR: procesează toate fișierele .xml din app/data-sources/ și le unește.
 *
 * UTILIZARE:
 *   1. Pune fișierele în:  app/data-sources/*.xml  (CFR: mers-tren.xml, + operatorii privați)
 *   2. Rulează:            npm run import:xml
 *   3. Se generează:       src/data/generated.json
 *
 * Orele (OraP/OraS) sunt în SECUNDE de la miezul nopții. Km = lungimea segmentului în metri.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { XMLParser } from "fast-xml-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC_DIR = process.env.XML_DIR || resolve(ROOT, "data-sources");
const OUT_PATH = process.env.OUT_PATH || resolve(ROOT, "src", "data", "generated.json");

// ---------- slug ----------
const DIA = { "ă":"a","â":"a","î":"i","ş":"s","ș":"s","ţ":"t","ț":"t",
              "Ă":"a","Â":"a","Î":"i","Ş":"s","Ș":"s","Ţ":"t","Ț":"t" };
const slugify = (s) => String(s ?? "")
  .split("").map((c) => DIA[c] ?? c).join("")
  .toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const CAT_MAP = { "R": "R", "R-E": "RE", "R-M": "R", "IC": "IC", "IR": "IR", "IR-N": "IRN" };

// Coduri operator (atributul Operator din XML) -> operator site. Slug = cel din src/data/operators.ts.
const OPERATORS = {
  "6100826": { name: "CFR Călători", slug: "cfr-calatori", short: "" },
  "227098":  { name: "Regio Călători", slug: "regio-calatori", short: "regio" },
  "236037":  { name: "Interregional Călători", slug: "interregional-calatori", short: "irc" },
  "228389":  { name: "Transferoviar Călători", slug: "transferoviar-calatori", short: "tfc" },
  "247232":  { name: "Ferotrafic", slug: "ferotrafic", short: "fero" },
};
const opOf = (code) => OPERATORS[String(code)] || { name: "Operator " + code, slug: "op-" + code, short: "op" + code };

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const secToTime = (sec) => {
  const v = ((Number(sec) % 86400) + 86400) % 86400;
  return `${String(Math.floor(v / 3600)).padStart(2, "0")}:${String(Math.floor((v % 3600) / 60)).padStart(2, "0")}`;
};
const cityOf = (name) => name.replace(/\b(h|hc|hm|hcv|halta|haltă)\.?\b.*$/i, "").trim().split(/\s+/)[0] || name;

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function main() {
  if (!existsSync(SRC_DIR)) {
    console.error(`\n[EROARE] Nu găsesc folderul: ${SRC_DIR}\n`); process.exit(1);
  }
  // CFR (mers-tren.xml) primul → păstrează URL-uri stabile; restul alfabetic.
  const files = readdirSync(SRC_DIR).filter((f) => f.toLowerCase().endsWith(".xml"))
    .sort((a, b) => (a === "mers-tren.xml" ? -1 : b === "mers-tren.xml" ? 1 : a.localeCompare(b)));
  if (!files.length) { console.error(`[EROARE] Niciun .xml în ${SRC_DIR}`); process.exit(1); }

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "", trimValues: true });
  const stationsMap = new Map();
  const usedSlugs = new Set();
  const trains = [];
  let idStation = 1, idTrain = 1, validFrom, validTo;

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

  const perOp = {};
  for (const file of files) {
    const j = parser.parse(readFileSync(join(SRC_DIR, file), "utf8"));
    const mts = asArray(j?.XmlIf?.XmlMts?.Mt);
    let trenNodes = [];
    for (const m of mts) {
      validFrom = validFrom || m.MtValabilDeLa;
      validTo = validTo || m.MtValabilPinaLa;
      trenNodes = trenNodes.concat(asArray(m?.Trenuri?.Tren));
    }
    let added = 0;
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

      // slug unic: cat-number (CFR curat), iar la coliziune adaugă operatorul.
      const base = `${category.toLowerCase()}-${slugify(number)}`;
      let s = base;
      if (usedSlugs.has(s)) {
        s = op.short ? `${base}-${op.short}` : base;
        let k = 2;
        while (usedSlugs.has(s)) s = `${base}-${op.short || "x"}-${k++}`;
      }
      usedSlugs.add(s);

      const cals = asArray(t?.RestrictiiTren?.CalendarTren);
      let mask = 0;
      for (const c of cals) mask |= (Number(c?.Zile) || 0) & 0b1111111;
      let runsDays = DAYS.filter((_, i) => mask & (1 << i));
      if (runsDays.length === 0) runsDays = [...DAYS];

      trains.push({
        id: idTrain++, number, category, operatorSlug: op.slug,
        name: t.Nume ? String(t.Nume).trim() : undefined,
        slug: s, runsDays,
        stops: filtered.map((r, i) => ({ stationSlug: r.st.slug, seq: i + 1, arr: r.arr, dep: r.dep, km: r.km })),
      });
      added++; perOp[op.slug] = (perOp[op.slug] || 0) + 1;
    }
    console.log(`  ${file}: +${added} trenuri`);
  }

  const stations = [...stationsMap.values()];
  const out = {
    generatedAt: new Date().toISOString(),
    source: `data.gov.ro mers-tren XML (valabil ${validFrom || "?"}-${validTo || "?"})`,
    counts: { stations: stations.length, trains: trains.length, byOperator: perOp },
    stations, trains,
  };
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out), "utf8");
  console.log(`\nOK: ${stations.length} stații, ${trains.length} trenuri`);
  console.log("Per operator:", JSON.stringify(perOp));
}

main();
