import Link from "next/link";
import { Fragment } from "react";
import type { SearchResult } from "@/lib/types";
import { formatDuration, timeToMin } from "@/lib/timeUtils";
import { operatorBySlug } from "@/data/operators";
import { InfoBadge, CategoryTag } from "./Badges";
import { StatusBadge, statusBarClass } from "./StatusBadge";
import { DepartsIn } from "./DepartsIn";

function addMinutes(time: string, min: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + min;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function TimeDisplay({ time, delayedTime }: { time: string; delayedTime?: string }) {
  if (delayedTime) {
    return (
      <div className="flex flex-col items-start leading-tight">
        <span className="font-time text-sm font-bold tnum" style={{ color: "var(--text-muted)", textDecoration: "line-through" }}>
          {time}
        </span>
        <span className="font-time text-2xl font-bold tnum" style={{ color: "var(--color-warning)" }}>
          {delayedTime}
        </span>
      </div>
    );
  }
  return (
    <span className="font-time text-[28px] font-bold tnum leading-none" style={{ color: "var(--text-strong)" }}>
      {time}
    </span>
  );
}

export function TrainResultCard({ r, date }: { r: SearchResult; date?: string }) {
  const op = operatorBySlug(r.operatorSlug);
  const first = r.legs[0];
  const isDelayed = r.status.state === "delayed";
  const isCancelled = r.status.state === "cancelled";
  const delayedDep = isDelayed ? addMinutes(r.depTime, r.status.delayMin) : undefined;
  const delayedArr = isDelayed ? addMinutes(r.arrTime, r.status.delayMin) : undefined;
  const barClass = r.type === "connection" ? "train-card-connect" : statusBarClass(r.status);

  return (
    <article
      className={`rounded-xl overflow-hidden transition-all ${barClass}`}
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        opacity: isCancelled ? 0.7 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <TimeDisplay time={r.depTime} delayedTime={delayedDep} />
            <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
              <span className="text-xs tnum" style={{ color: "var(--text-muted)" }}>
                {formatDuration(r.totalDurationMin)}
              </span>
              <div className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }} />
                <span className="h-px w-10" style={{ backgroundColor: "var(--border)" }} />
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }} />
              </div>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {r.changesCount === 0 ? "direct" : `${r.changesCount} schimb.`}
              </span>
            </div>
            <TimeDisplay time={r.arrTime} delayedTime={delayedArr} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
            {date && !isCancelled && <DepartsIn depTime={r.depTime} date={date} />}
            {r.badges.map((b) => <InfoBadge key={b} badge={b} />)}
            <StatusBadge status={r.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {r.type === "direct" && r.trainSlug ? (
            <Link href={`/tren/${r.trainSlug}`} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--text-strong)" }}>
              <CategoryTag category={first.train.category} />
              {first.train.number}
              {first.train.name && <span style={{ color: "var(--text-muted)" }}>&middot; {first.train.name}</span>}
            </Link>
          ) : (
            <span className="flex flex-wrap items-center gap-1.5 text-sm">
              {r.legs.map((l, idx) => (
                <Fragment key={idx}>
                  {idx > 0 && <span style={{ color: "var(--text-muted)" }}>&rarr; schimb la {l.fromName} &rarr;</span>}
                  <CategoryTag category={l.train.category} />
                  <Link href={`/tren/${l.train.slug}`} className="hover:underline" style={{ color: "var(--text-strong)", fontWeight: 500 }}>{l.train.number}</Link>
                </Fragment>
              ))}
            </span>
          )}
          {op ? (
            <Link href={`/operatori/${op.slug}`} className="text-sm hover:underline" style={{ color: "var(--text-muted)" }}>
              &middot; {op.shortName || op.name}
            </Link>
          ) : (
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>&middot; {r.operatorSlug}</span>
          )}
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>&middot; {r.distanceKm} km</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            {r.priceFrom.amount != null ? (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="font-time text-xl font-bold tnum" style={{ color: isCancelled ? "var(--text-muted)" : "var(--text-strong)" }}>
                    {r.priceFrom.amount.toFixed(1)} lei
                  </span>
                </div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>de la &middot; cls. 2 &middot; estimativ</span>
              </>
            ) : (
              <>
                <div className="text-base font-bold" style={{ color: "var(--text-strong)" }}>Preț la operator</div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{op?.name ?? "operator privat"}</span>
              </>
            )}
          </div>
          {isCancelled ? (
            <span className="rounded-xl px-4 py-2.5 text-xs font-semibold" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}>
              Anulat
            </span>
          ) : (
            <a
              href={r.ticketUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
              style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v14" strokeDasharray="3 3" />
              </svg>
              Cumpara bilet
            </a>
          )}
        </div>
      </div>

      {r.type === "connection" && (
        <div className="px-4 py-3 text-xs" style={{ borderTop: "1px solid var(--border)", backgroundColor: "rgba(0,0,0,0.02)", color: "var(--text-muted)" }}>
          <ol className="space-y-1.5">
            {r.legs.map((l, i) => {
              const raw = i < r.legs.length - 1 ? timeToMin(r.legs[i + 1].depTime) - timeToMin(l.arrTime) : null;
              const waitMin = raw == null ? null : ((raw % 1440) + 1440) % 1440;
              return (
                <Fragment key={i}>
                  <li className="flex flex-wrap items-center gap-2 tnum">
                    <span className="font-semibold" style={{ color: "var(--text-default)" }}>{l.depTime}</span>
                    <span>{l.fromName}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14m-7-7 7 7-7 7" />
                    </svg>
                    <span className="font-semibold" style={{ color: "var(--text-default)" }}>{l.arrTime}</span>
                    <span>{l.toName}</span>
                    <CategoryTag category={l.train.category} />
                    <Link href={`/tren/${l.train.slug}`} className="font-semibold hover:underline" style={{ color: "var(--text-default)" }}>{l.train.number}</Link>
                  </li>
                  {waitMin != null && (
                    <li className="flex items-center gap-1.5 pl-1" style={{ color: "var(--color-warning)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                      <span>schimb la {l.toName} &middot; așteptare {formatDuration(waitMin)}</span>
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </div>
      )}
    </article>
  );
}
