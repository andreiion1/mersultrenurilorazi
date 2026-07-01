"use client";

import { useState } from "react";
import { ChevronDown } from "./Icons";

export interface QA { q: string; a: string; }

export function Faq({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line rounded-md border border-line bg-card">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left font-medium text-strong"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {it.q}
            <span className={`shrink-0 text-muted transition ${open === i ? "rotate-180" : ""}`}><ChevronDown /></span>
          </button>
          {open === i && <div className="px-4 pb-4 text-sm text-body">{it.a}</div>}
        </div>
      ))}
    </div>
  );
}
