"use client";

import { useEffect, useState } from "react";

// Afișează „pleacă în Xh Ym" relativ la ora curentă.
// Doar pentru ziua de azi și doar pentru trenuri care încă nu au plecat.
export function DepartsIn({ depTime, date }: { depTime: string; date: string }) {
  const [label, setLabel] = useState<string | null>(null);
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    function compute() {
      const now = new Date();
      const target = new Date(`${date}T${depTime}:00`);
      if (Number.isNaN(target.getTime())) { setLabel(null); return; }
      // doar dacă plecarea e în aceeași zi calendaristică cu momentul actual
      if (target.toDateString() !== now.toDateString()) { setLabel(null); return; }
      const diffMin = Math.round((target.getTime() - now.getTime()) / 60000);
      if (diffMin < 0) { setLabel(null); return; }            // deja plecat
      setUrgent(diffMin <= 15);
      if (diffMin === 0) { setLabel("pleacă acum"); return; }
      if (diffMin < 60) { setLabel(`pleacă în ${diffMin} min`); return; }
      const h = Math.floor(diffMin / 60);
      const m = diffMin % 60;
      setLabel(m ? `pleacă în ${h}h ${m}m` : `pleacă în ${h}h`);
    }
    compute();
    const id = setInterval(compute, 30000);
    return () => clearInterval(id);
  }, [depTime, date]);

  if (!label) return null;

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={
        urgent
          ? { backgroundColor: "var(--color-warning-bg, rgba(217,119,6,0.12))", color: "var(--color-warning, #B45309)" }
          : { backgroundColor: "rgba(6,17,39,0.06)", color: "var(--text-default, #334155)" }
      }
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
      </svg>
      {label}
    </span>
  );
}
