"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { searchStations, allOptions, type StationOpt } from "@/lib/stationSearch";

type Opt = StationOpt;

function Pin({ dark }: { dark: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke={dark ? "rgba(255,255,255,0.35)" : "var(--text-muted)"}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function StationField({ label, value, onPick, placeholder, dark }: {
  label: string; value: Opt | null; onPick: (o: Opt | null) => void;
  placeholder: string; dark: boolean;
}) {
  const [q, setQ] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Opt[]>(allOptions);
  const abortRef = useRef<AbortController | null>(null);

  // Sincronizeaza q cu valoarea externa (ex: dupa swap)
  useEffect(() => { setQ(value?.name ?? ""); }, [value]);

  // Cauta gari cu debounce 180ms
  useEffect(() => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const timer = setTimeout(async () => {
      const results = await searchStations(q, 50);
      if (!ctrl.signal.aborted) setOpts(results);
    }, q.trim() ? 180 : 0);

    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [q]);

  const bf = dark ? "0.5px solid rgba(245,160,0,0.55)" : "1.5px solid var(--color-primary)";
  const bn = dark ? "0.5px solid rgba(255,255,255,0.14)" : "1px solid var(--border)";
  const bg = dark ? "rgba(255,255,255,0.08)" : "var(--bg-base)";
  const tc = dark ? (q ? "#ffffff" : "rgba(255,255,255,0.55)") : "var(--text-strong)";
  const lc = dark ? "rgba(255,255,255,0.72)" : "var(--text-muted)";
  const db = dark ? "#0D1E3D" : "var(--bg-base)";
  const dbb = dark ? "0.5px solid rgba(255,255,255,0.12)" : "1px solid var(--border)";

  return (
    <div className="relative flex-1 min-w-0">
      <label className="mb-1 block text-xs font-semibold uppercase tracking-widest"
        style={{ color: lc }}>{label}</label>
      <div className="flex items-center gap-2 rounded-xl px-3 h-12"
        style={{ backgroundColor: bg, border: open ? bf : bn }}>
        <Pin dark={dark} />
        <input
          className="h-full w-full bg-transparent text-sm font-medium outline-none"
          style={{ color: tc }}
          placeholder={placeholder}
          aria-label={label}
          value={q}
          autoComplete="off"
          onChange={(e) => { setQ(e.target.value); onPick(null); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        {q && (
          <button type="button" aria-label="Sterge"
            onClick={() => { setQ(""); onPick(null); setOpts(allOptions); }}
            style={{ color: dark ? "rgba(255,255,255,0.3)" : "var(--text-muted)", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {open && opts.length > 0 && (
        <ul className="absolute z-40 mt-1.5 w-full overflow-auto rounded-xl py-1 shadow-lg"
          style={{ maxHeight: "260px", backgroundColor: db, border: dbb }}>
          {opts.map((o) => (
            <li key={o.slug}>
              <button type="button"
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm"
                onMouseDown={(e) => { e.preventDefault(); onPick(o); setQ(o.name); setOpen(false); }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor =
                    dark ? "rgba(255,255,255,0.06)" : "var(--bg-subtle)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}>
                <Pin dark={dark} />
                <span className="font-semibold" style={{ color: dark ? "#ffffff" : "var(--text-strong)" }}>
                  {o.name}
                </span>
                <span className="text-xs" style={{ color: dark ? "rgba(255,255,255,0.62)" : "var(--text-muted)" }}>
                  &middot; {o.city}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SearchBox({ initialFrom, initialTo, initialDate, dark = false }: {
  initialFrom?: Opt | null; initialTo?: Opt | null; initialDate?: string; dark?: boolean;
}) {
  const router = useRouter();
  const [from, setFrom] = useState<Opt | null>(initialFrom ?? null);
  const [to,   setTo]   = useState<Opt | null>(initialTo   ?? null);
  const today    = new Date().toISOString().slice(0, 10);
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const [date, setDate] = useState(initialDate ?? today);
  const [err,  setErr]  = useState("");
  const [swapping, setSwapping] = useState(false);

  function swap() {
    setSwapping(true); setTimeout(() => setSwapping(false), 300);
    setFrom(to); setTo(from);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from || !to) { setErr("Alege statia de plecare si destinatia."); return; }
    if (from.slug === to.slug) { setErr("Plecarea si destinatia trebuie sa fie diferite."); return; }
    setErr(""); router.push(`/cautare?from=${from.slug}&to=${to.slug}&date=${date}`);
  }

  const chip = (active: boolean) => ({
    className: "rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer",
    style: active
      ? { backgroundColor: "var(--color-primary)", color: "var(--color-navy)", border: "none" }
      : dark
        ? { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)", border: "0.5px solid rgba(255,255,255,0.12)" }
        : { backgroundColor: "var(--bg-subtle)", color: "var(--text-muted)", border: "1px solid var(--border)" },
  });

  const ws = dark
    ? { backgroundColor: "rgba(255,255,255,0.05)", border: "0.5px solid rgba(255,255,255,0.10)", borderRadius: "16px", padding: "1rem" }
    : { backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "1rem", boxShadow: "var(--shadow-card)" };

  return (
    <form onSubmit={submit} style={ws}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end">
        <StationField label="De unde" value={from} onPick={setFrom} placeholder="Ex: Bucuresti Nord" dark={dark} />
        <button type="button" onClick={swap} aria-label="Inverseaza"
          className="mx-auto flex items-center justify-center rounded-xl md:mb-0"
          style={{
            width: "40px", height: "40px", flexShrink: 0,
            backgroundColor: dark ? "rgba(255,255,255,0.08)" : "var(--bg-subtle)",
            border: dark ? "0.5px solid rgba(255,255,255,0.14)" : "1px solid var(--border)",
            color: "var(--color-primary)",
            transform: swapping ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" />
          </svg>
        </button>
        <StationField label="Unde" value={to} onPick={setTo} placeholder="Ex: Brasov" dark={dark} />
        <div className="flex flex-col gap-1">
          <label className="block text-xs font-semibold uppercase tracking-widest"
            style={{ color: dark ? "rgba(255,255,255,0.72)" : "var(--text-muted)" }}>Data</label>
          <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
            aria-label="Data călătoriei"
            className="h-12 rounded-xl px-3 text-sm font-medium outline-none"
            style={dark
              ? { backgroundColor: "rgba(255,255,255,0.08)", border: "0.5px solid rgba(255,255,255,0.14)", color: "#ffffff", colorScheme: "dark" }
              : { backgroundColor: "var(--bg-base)", border: "1px solid var(--border)", color: "var(--text-strong)" }} />
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <button type="button" onClick={() => setDate(today)} {...chip(date === today)}>Azi</button>
        <button type="button" onClick={() => setDate(tomorrow)} {...chip(date === tomorrow)}>Maine</button>
      </div>
      {err && <p className="mt-2 text-xs font-medium" style={{ color: "var(--color-danger)" }}>{err}</p>}
      <button type="submit"
        className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
        style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Cauta trenuri
      </button>
    </form>
  );
}
