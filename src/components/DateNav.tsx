"use client";

// Selector de dată pentru paginile de rută: Azi / Mâine / dată aleasă.
// Chips = navigare directă; input-ul de dată navighează la schimbare.

import Link from "next/link";
import { useRouter } from "next/navigation";

function chipStyle(active: boolean): React.CSSProperties {
  return active
    ? { backgroundColor: "var(--color-primary)", color: "var(--color-navy)", border: "1px solid var(--color-primary)" }
    : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", border: "1px solid var(--border)" };
}

export function DateNav({ basePath, date, today, tomorrow, extraParams = {} }: {
  basePath: string;
  date: string;      // data curent selectată (ISO)
  today: string;     // ISO azi (Europe/Bucharest)
  tomorrow: string;  // ISO mâine
  extraParams?: Record<string, string | undefined>;
}) {
  const router = useRouter();

  const href = (d: string) => {
    const params = { ...extraParams, data: d === today ? undefined : d };
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return q ? `${basePath}?${q}` : basePath;
  };

  const isOther = date !== today && date !== tomorrow;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Alege data">
      <Link href={href(today)} scroll={false} className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all" style={chipStyle(date === today)}>
        Azi
      </Link>
      <Link href={href(tomorrow)} scroll={false} className="rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all" style={chipStyle(date === tomorrow)}>
        Mâine
      </Link>
      <label className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={chipStyle(isOther)}>
        <span className="sr-only">Altă dată</span>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => { if (e.target.value) router.push(href(e.target.value), { scroll: false }); }}
          className="bg-transparent text-xs font-semibold outline-none"
          style={{ color: "inherit", colorScheme: "inherit", width: "8.5rem" }}
          aria-label="Alege altă dată"
        />
      </label>
    </div>
  );
}
