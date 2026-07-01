import type { RunStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: RunStatus }) {
  if (status.state === "cancelled") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-danger)" }} />
        Anulat
      </span>
    );
  }

  if (status.state === "delayed") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tnum"
        style={{ backgroundColor: "var(--color-warning-bg)", color: "var(--color-warning)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-warning)" }} />
        +{status.delayMin} min
      </span>
    );
  }

  if (status.state === "on_time") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold pulse-live"
        style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-success)" }} />
        La timp
      </span>
    );
  }

  // Neutru („scheduled"): nu avem status live → afișăm doar că e conform orarului, fără a inventa.
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)" }}
    >
      conform orarului
    </span>
  );
}

export function statusBarClass(status: RunStatus): string {
  if (status.state === "cancelled") return "train-card-cancel";
  if (status.state === "delayed" && status.delayMin > 15) return "train-card-late";
  if (status.state === "delayed") return "train-card-delayed";
  return "train-card-ontime";
}
