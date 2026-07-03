// Functii pure de timp — fara "use client", utilizabile atat server cat si client.

/** Converteste "HH:MM" in minute de la miezul noptii. */
export function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Converteste minute in "HH:MM" (gestioneaza trecerea peste miezul noptii). */
export function minToTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Formateaza minute in "Xh Ym" (ex: 125 → "2h 5m"). */
export function formatDuration(min: number): string {
  if (!min || min <= 0) return "-";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

/** Diferenta in minute intre doua ore "HH:MM" (gestioneaza trecerea noptii). */
export function durationBetween(dep: string, arr: string): number {
  const a = timeToMin(dep);
  const b = timeToMin(arr);
  return b >= a ? b - a : 1440 - a + b;
}
