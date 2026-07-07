// Sortare și filtrare pentru listele de rezultate (căutare + pagini de rută).
// Server-side, prin query params — fără JS pe client, SEO-friendly.

import type { SearchResult } from "@/lib/types";
import { timeToMin } from "@/lib/timeUtils";

export type SortKey = "plecare" | "rapid" | "ieftin";

export function parseSort(v: string | undefined): SortKey {
  return v === "rapid" || v === "ieftin" ? v : "plecare";
}

export function parseDirectOnly(v: string | undefined): boolean {
  return v === "1";
}

export function parseOperator(v: string | undefined): string | undefined {
  return v && /^[a-z0-9-]+$/.test(v) ? v : undefined;
}

/** Validează o dată ISO (YYYY-MM-DD). Returnează fallback dacă e invalidă. */
export function parseDateParam(v: string | undefined, fallback: string): string {
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return fallback;
  const d = new Date(v + "T00:00:00");
  return Number.isNaN(d.getTime()) ? fallback : v;
}

/** Aplică filtrul „doar directe", filtrul de operator și sortarea aleasă peste rezultate. */
export function applyView(all: SearchResult[], sort: SortKey, directOnly: boolean, operator?: string): SearchResult[] {
  let list = directOnly ? all.filter((r) => r.changesCount === 0) : [...all];
  if (operator) list = list.filter((r) => r.legs.some((l) => l.train.operatorSlug === operator));
  const byDep = (a: SearchResult, b: SearchResult) => timeToMin(a.depTime) - timeToMin(b.depTime);
  if (sort === "rapid") {
    list.sort((a, b) => a.totalDurationMin - b.totalDurationMin || byDep(a, b));
  } else if (sort === "ieftin") {
    // Prețurile null (operatori privați) merg la final.
    list.sort((a, b) => {
      const pa = a.priceFrom.amount, pb = b.priceFrom.amount;
      if (pa == null && pb == null) return byDep(a, b);
      if (pa == null) return 1;
      if (pb == null) return -1;
      return pa - pb || byDep(a, b);
    });
  } else {
    list.sort(byDep);
  }
  return list;
}

/** Construiește un href păstrând doar parametrii cu valoare. */
export function buildHref(basePath: string, params: Record<string, string | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return q ? `${basePath}?${q}` : basePath;
}
