"use client";

import { openConsent } from "@/lib/consent";

// Redeschide setările de consimțământ. Dacă CMP-ul Google e activ (UE), îl folosește pe acela;
// altfel redeschide bannerul nostru interimar.
export function CookieSettingsButton() {
  const open = () => {
    const w = window as unknown as { googlefc?: { showRevocationMessage?: () => void } };
    if (w.googlefc && typeof w.googlefc.showRevocationMessage === "function") {
      w.googlefc.showRevocationMessage();
    } else {
      openConsent();
    }
  };
  return (
    <li>
      <button type="button" onClick={open}
        className="text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.70)" }}>
        Setări confidențialitate
      </button>
    </li>
  );
}
