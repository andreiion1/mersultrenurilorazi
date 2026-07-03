import type { StationStats as Stats } from "@/lib/stationStats";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-line bg-card p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-0.5 font-bold text-strong tnum">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </div>
  );
}

const CAT_LABEL: Record<string, string> = {
  R: "Regio", RE: "Regio Expres", IR: "InterRegio", IRN: "InterRegio Noapte", IC: "InterCity",
};

export function StationStats({ name, stats }: { name: string; stats: Stats }) {
  if (!stats.hasData) return null;

  const peak = stats.peakHour !== null
    ? `${String(stats.peakHour).padStart(2, "0")}:00–${String((stats.peakHour + 1) % 24).padStart(2, "0")}:00`
    : "—";
  const opsText = stats.operators.length ? stats.operators.join(", ") : "—";

  return (
    <section className="mt-8">
      <h2 className="mb-3 text-xl font-bold text-strong">Statistici gară — {name}</h2>

      <p className="mb-4 max-w-2xl text-sm text-body">
        Prin Gara {name} opresc până la <strong>{stats.maxTrainsPerDay}</strong> trenuri pe zi,
        cu <strong>{stats.directDestinations}</strong> gări accesibile fără schimbare.
        {stats.operators.length > 0 && <> Operatori: {opsText}.</>}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Trenuri pe zi (maxim)" value={String(stats.maxTrainsPerDay)} sub="cea mai aglomerată zi" />
        <Stat label="Destinații directe" value={String(stats.directDestinations)} sub="fără schimbare" />
        <Stat label="Trenuri care opresc aici" value={String(stats.servingTrains)} />
        <Stat label="Primul tren" value={stats.firstTrain ?? "—"} />
        <Stat label="Ultimul tren" value={stats.lastTrain ?? "—"} />
        <Stat label="Oră de vârf" value={peak} sub="cele mai multe treceri" />
      </div>

      {stats.farthest && (
        <p className="mt-3 text-sm text-muted">
          Cea mai lungă rută directă: până la <strong className="text-strong">{stats.farthest.name}</strong> ({stats.farthest.km} km).
        </p>
      )}

      {stats.categories.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Tipuri de trenuri</div>
          <div className="flex flex-wrap gap-2">
            {stats.categories.map((c) => (
              <span key={c.cat} className="rounded-full border border-line bg-card px-3 py-1 text-xs text-body">
                {CAT_LABEL[c.cat] ?? c.cat}: <strong className="text-strong">{c.count}</strong>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
