// Integrare status real trenuri (IRIS / Informatică Feroviară).
//
// IMPORTANT (juridic + tehnic):
// - IRIS NU are API public oficial. Această integrare interoghează interfața publică de
//   informare a trenurilor. Folosirea ei în producție trebuie clarificată juridic (ToS,
//   drepturi asupra bazei de date) — ideal prin parteneriat/acord CFR-Infofer.
// - Implementarea e dezactivată implicit (IRIS_ENABLED=false). Activeaz-o doar după
//   validare live + verificare legală, setând variabila de mediu IRIS_ENABLED=1.
// - Fără IRIS, site-ul afișează ONEST doar orarul oficial (fără întârzieri inventate).
//
// TODO la activare:
//  1. Confirmă endpoint-ul și formatul răspunsului (poate fi HTML sau JSON).
//  2. Ajustează parserul `parseIrisResponse` la formatul real.
//  3. Respectă rate-limit + cache (deja implementat mai jos).

export interface LiveStatus {
  delayMin: number;
  state: "on_time" | "delayed" | "cancelled";
  observedAt: string;
  source: "iris";
}

export const IRIS_ENABLED = process.env.IRIS_ENABLED === "1";

// cache simplu în memorie (TTL 60s) ca să nu lovim sursa la fiecare cerere
const cache = new Map<string, { at: number; data: LiveStatus | null }>();
const TTL_MS = 60_000;

// Endpoint orientativ — DE CONFIRMAT la activare.
function irisUrl(trainNumber: string, dateISO: string): string {
  const d = dateISO.replace(/-/g, "");
  return `https://appiris.infofer.ro/api/TrainInfo?number=${encodeURIComponent(trainNumber)}&date=${d}`;
}

// Parser — DE AJUSTAT la formatul real al răspunsului IRIS.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseIrisResponse(json: any): LiveStatus | null {
  try {
    const delay = Number(json?.delay ?? json?.delayMinutes ?? 0);
    const cancelled = Boolean(json?.cancelled);
    return {
      delayMin: Number.isFinite(delay) ? delay : 0,
      state: cancelled ? "cancelled" : delay > 0 ? "delayed" : "on_time",
      observedAt: new Date().toISOString(),
      source: "iris",
    };
  } catch {
    return null;
  }
}

/**
 * Status live pentru un tren. Returnează null dacă IRIS e dezactivat sau indisponibil
 * (caz în care UI-ul afișează orarul programat, fără a inventa întârzieri).
 */
export async function fetchLiveStatus(trainNumber: string, dateISO: string): Promise<LiveStatus | null> {
  if (!IRIS_ENABLED) return null;
  const key = `${trainNumber}|${dateISO}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(irisUrl(trainNumber, dateISO), {
      signal: ctrl.signal,
      headers: { "User-Agent": "mersultrenurilorlazi.ro (status informativ)" },
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`IRIS ${res.status}`);
    const json = await res.json();
    const data = parseIrisResponse(json);
    cache.set(key, { at: Date.now(), data });
    return data;
  } catch {
    cache.set(key, { at: Date.now(), data: null }); // memorează eșecul scurt timp
    return null;
  }
}
