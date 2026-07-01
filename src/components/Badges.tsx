import type { ResultBadge } from "@/lib/types";

const MAP: Record<ResultBadge, { label: string; bg: string; color: string }> = {
  fastest:  { label: "Cel mai rapid", bg: "rgba(0,200,150,0.12)", color: "var(--color-success)" },
  cheapest: { label: "Cel mai ieftin", bg: "var(--color-primary-soft)", color: "#8B6300" },
  direct:   { label: "Direct",        bg: "rgba(138,156,245,0.12)", color: "#5A4FD6" },
};

export function InfoBadge({ badge }: { badge: ResultBadge }) {
  const m = MAP[badge];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: m.bg, color: m.color }}
    >
      {m.label}
    </span>
  );
}

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  IC:  { bg: "#FFF3D6", color: "#8B6300" },
  ICN: { bg: "#FFF3D6", color: "#8B6300" },
  IR:  { bg: "#E0F0FF", color: "#185FA5" },
  IRN: { bg: "#E0F0FF", color: "#185FA5" },
  RE:  { bg: "#EEEDFE", color: "#3C3489" },
  R:   { bg: "rgba(0,0,0,0.06)", color: "#4A5568" },
};

export function CategoryTag({ category }: { category: string }) {
  const s = CATEGORY_STYLE[category] ?? { bg: "rgba(0,0,0,0.06)", color: "#4A5568" };
  return (
    <span
      className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold tracking-wide"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {category}
    </span>
  );
}

type DelayRisk = "low" | "medium" | "high";

const RISK: Record<DelayRisk, { label: string; bg: string; color: string }> = {
  low:    { label: "Risc scazut",  bg: "var(--color-success-bg)", color: "var(--color-success)" },
  medium: { label: "Risc mediu",   bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
  high:   { label: "Risc ridicat", bg: "var(--color-danger-bg)",  color: "var(--color-danger)"  },
};

export function DelayRiskBadge({ risk }: { risk: DelayRisk }) {
  const r = RISK[risk];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: r.bg, color: r.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: r.color }} />
      {r.label}
    </span>
  );
}
