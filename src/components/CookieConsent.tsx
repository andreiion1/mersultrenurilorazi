"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getConsent, setConsent, CONSENT_OPEN_EVENT } from "@/lib/consent";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // arată bannerul dacă nu s-a decis încă
    if (!getConsent()) setOpen(true);
    const reopen = () => {
      const c = getConsent();
      setAnalytics(c?.analytics ?? false);
      setSettings(true);
      setOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decide = (a: boolean) => { setConsent(a); setOpen(false); setSettings(false); };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4" role="dialog" aria-label="Preferințe cookie" aria-live="polite">
      <div className="mx-auto max-w-3xl rounded-xl p-4 shadow-lg"
        style={{ backgroundColor: "var(--color-navy)", border: "0.5px solid rgba(255,255,255,0.14)" }}>
        <div className="flex items-start gap-3">
          <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>🍪</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold" style={{ color: "#fff" }}>Respectăm confidențialitatea ta</p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              Folosim stocare <strong>strict necesară</strong> pentru funcționarea site-ului (preferința de temă și favoritele tale, salvate doar în browserul tău).
              Cu acordul tău, am putea folosi și statistici anonime de utilizare. Vezi{" "}
              <Link href="/politica-de-confidentialitate" className="underline" style={{ color: "var(--color-primary)" }}>politica de confidențialitate</Link>.
            </p>

            {settings && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <input type="checkbox" checked disabled />
                  <span><strong>Necesare</strong> — mereu active (temă, favorite). Fără ele site-ul nu funcționează corect.</span>
                </label>
                <label className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                  <span><strong>Statistici</strong> — date anonime de utilizare, ca să îmbunătățim site-ul. Opțional.</span>
                </label>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => decide(true)}
                className="rounded-lg px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}>
                Accept toate
              </button>
              <button type="button" onClick={() => decide(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.2)" }}>
                Doar necesare
              </button>
              {settings ? (
                <button type="button" onClick={() => decide(analytics)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#fff", border: "0.5px solid rgba(255,255,255,0.2)" }}>
                  Salvează alegerea
                </button>
              ) : (
                <button type="button" onClick={() => setSettings(true)}
                  className="text-xs font-medium underline" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Setări
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
