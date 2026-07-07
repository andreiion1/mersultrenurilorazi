"use client";

import { useEffect, useState } from "react";

export type ResultItem = { depTime: string; node: React.ReactNode };

// Pentru căutările de AZI: ascunde cursele care au plecat deja (colapsabil)
// și afișează întâi plecările care urmează. Pentru alte zile arată tot.
export function TodayResults({ direct, connections = [], date, today }: {
  direct: ResultItem[];
  connections?: ResultItem[];
  date: string;
  today: string;
}) {
  const [nowMin, setNowMin] = useState<number | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const upd = () => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    };
    upd();
    const id = setInterval(upd, 30000);
    return () => clearInterval(id);
  }, []);

  const total = direct.length + connections.length;
  if (total === 0) return null;

  const isToday = date === today;
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Înainte de montare (SSR) sau pentru alte zile: randare completă, grupare clasică.
  if (!isToday || nowMin == null) {
    return <Group direct={direct} connections={connections} />;
  }

  const pastDirect = direct.filter((i) => toMin(i.depTime) < nowMin);
  const upDirect = direct.filter((i) => toMin(i.depTime) >= nowMin);
  const pastConn = connections.filter((i) => toMin(i.depTime) < nowMin);
  const upConn = connections.filter((i) => toMin(i.depTime) >= nowMin);
  const pastCount = pastDirect.length + pastConn.length;
  const upCount = upDirect.length + upConn.length;

  return (
    <div className="space-y-3">
      {pastCount > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowPast((v) => !v)}
            aria-expanded={showPast}
            className="flex w-full items-center justify-between rounded-md border border-line bg-card px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-primary"
          >
            <span>{pastCount === 1 ? "1 cursă a plecat deja azi" : `${pastCount} curse au plecat deja azi`}</span>
            <span className="flex items-center gap-1 text-primary">
              {showPast ? "Ascunde" : "Arată"}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: showPast ? "rotate(180deg)" : "none" }}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </button>
          {showPast && (
            <div className="mt-3 space-y-3" style={{ opacity: 0.65 }}>
              {pastDirect.map((it, i) => <div key={`pd${i}`}>{it.node}</div>)}
              {pastConn.map((it, i) => <div key={`pc${i}`}>{it.node}</div>)}
            </div>
          )}
        </div>
      )}

      {upCount === 0 ? (
        <p className="rounded-md border border-line bg-card p-6 text-center text-muted">
          Nu mai sunt plecări azi pe această rută. Alege „Mâine" ca să vezi orarul complet.
        </p>
      ) : (
        <>
          {upDirect.map((it, i) => <div key={`ud${i}`}>{it.node}</div>)}
          {upConn.length > 0 && (
            <>
              <h3 className="pt-2 text-sm font-bold uppercase text-muted">Cu schimbare</h3>
              {upConn.map((it, i) => <div key={`uc${i}`}>{it.node}</div>)}
            </>
          )}
        </>
      )}
    </div>
  );
}

function Group({ direct, connections }: { direct: ResultItem[]; connections: ResultItem[] }) {
  return (
    <div className="space-y-3">
      {direct.map((it, i) => <div key={`d${i}`}>{it.node}</div>)}
      {connections.length > 0 && (
        <>
          <h3 className="pt-2 text-sm font-bold uppercase text-muted">Cu schimbare</h3>
          {connections.map((it, i) => <div key={`c${i}`}>{it.node}</div>)}
        </>
      )}
    </div>
  );
}
