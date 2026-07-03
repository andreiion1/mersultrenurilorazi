"use client";

import { useEffect, useState } from "react";

// Ceas ca pe panourile din gară (ora României), actualizat la fiecare secundă.
export function BoardClock() {
  const [t, setT] = useState<string>("");

  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("ro-RO", {
        timeZone: "Europe/Bucharest", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      }).format(new Date());
    setT(fmt());
    const id = setInterval(() => setT(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: "#eaf0ff" }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontVariantNumeric: "tabular-nums", minWidth: "62px" }}>
        {t || "--:--:--"}
      </span>
    </span>
  );
}
