// Favorite salvate 100% în browser (localStorage). Fără cont, fără server.
// Vezi și politica de confidențialitate: datele nu părăsesc dispozitivul.

export type FavKind = "route" | "station" | "train";

export interface FavItem {
  kind: FavKind;
  slug: string;   // unic în cadrul kind-ului
  label: string;  // titlu afișat, ex. "București – Brașov"
  sub?: string;   // subtitlu, ex. "Rută" / oraș / operator
  href: string;   // link către pagină
  addedAt: number;
}

const KEY = "mtlz:favorites:v1";
export const FAVORITES_EVENT = "mtlz-favorites-changed";

function canUse(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function readFavorites(): FavItem[] {
  if (!canUse()) return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as FavItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: FavItem[]) {
  if (!canUse()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  } catch {
    /* quota / private mode — ignorăm silențios */
  }
}

export function isFavorite(kind: FavKind, slug: string): boolean {
  return readFavorites().some((f) => f.kind === kind && f.slug === slug);
}

/** Comută favorit. Returnează noua stare (true = acum favorit). */
export function toggleFavorite(item: Omit<FavItem, "addedAt">): boolean {
  const items = readFavorites();
  const idx = items.findIndex((f) => f.kind === item.kind && f.slug === item.slug);
  if (idx >= 0) {
    items.splice(idx, 1);
    write(items);
    return false;
  }
  items.unshift({ ...item, addedAt: Date.now() });
  write(items);
  return true;
}

export function removeFavorite(kind: FavKind, slug: string) {
  write(readFavorites().filter((f) => !(f.kind === kind && f.slug === slug)));
}

export function favoritesByKind(kind: FavKind): FavItem[] {
  return readFavorites().filter((f) => f.kind === kind).sort((a, b) => b.addedAt - a.addedAt);
}
