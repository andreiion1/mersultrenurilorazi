// Consimțământ cookie/stocare, salvat în localStorage (fără server).
// Categorii: „necesare" (mereu active: temă, favorite) + „statistici" (opțional, implicit oprit).
// Analytics/marketing NU se activează până când analytics === true.

export interface Consent {
  necessary: true;
  analytics: boolean;
  decidedAt: number;
}

const KEY = "mtlz:cookie-consent:v1";
export const CONSENT_EVENT = "mtlz-consent-changed";
export const CONSENT_OPEN_EVENT = "mtlz-consent-open";

function canUse(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getConsent(): Consent | null {
  if (!canUse()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw);
    return c && typeof c.analytics === "boolean" ? (c as Consent) : null;
  } catch {
    return null;
  }
}

export function setConsent(analytics: boolean) {
  if (!canUse()) return;
  const c: Consent = { necessary: true, analytics, decidedAt: Date.now() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c));
    window.dispatchEvent(new Event(CONSENT_EVENT));
  } catch {
    /* private mode / quota — ignorăm */
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

/** Redeschide bannerul de setări (ex. din footer). */
export function openConsent() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
