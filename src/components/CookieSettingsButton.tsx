"use client";

import { openConsent } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <li>
      <button type="button" onClick={openConsent}
        className="text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.70)" }}>
        Setări cookie
      </button>
    </li>
  );
}
