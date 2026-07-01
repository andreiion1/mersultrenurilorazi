import Link from "next/link";
import type { RouteInfo } from "@/lib/types";
import { formatDuration } from "@/lib/timeUtils";
import { DelayRiskBadge } from "./Badges";

function estimateRisk(r: RouteInfo): "low" | "medium" | "high" {
  if (r.distanceKm > 400) return "high";
  if (r.distanceKm > 200 || r.minDurationMin > 180) return "medium";
  return "low";
}

export function RouteCard({ r }: { r: RouteInfo }) {
  const risk = estimateRisk(r);
  return (
    <Link
      href={`/rute/${r.slug}`}
      className="block rounded-xl transition-all"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        padding: "1rem",
        boxShadow: "var(--shadow-card)",
        textDecoration: "none",
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          {r.fromCity}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="var(--color-primary)" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14m-7-7 7 7-7 7" />
        </svg>
        <span className="text-sm font-semibold" style={{ color: "var(--text-strong)" }}>
          {r.toCity}
        </span>
      </div>
      <div className="text-xs mb-2.5 tnum" style={{ color: "var(--text-muted)" }}>
        {r.dailyTrainsCount} trenuri/zi &middot; {formatDuration(r.minDurationMin)} &middot; {r.distanceKm} km
      </div>
      <DelayRiskBadge risk={risk} />
    </Link>
  );
}
