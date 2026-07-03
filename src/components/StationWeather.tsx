"use client";

import { useEffect, useState } from "react";

// Vremea curentă din Open-Meteo (gratuit, fără cheie API).
interface Current { temp: number; feels: number; humidity: number; wind: number; code: number; }

// Cod WMO -> etichetă RO + categorie de iconiță.
function wmo(code: number): { label: string; icon: IconKind } {
  if (code === 0) return { label: "Senin", icon: "sun" };
  if (code === 1) return { label: "Predominant senin", icon: "sun" };
  if (code === 2) return { label: "Parțial noros", icon: "partly" };
  if (code === 3) return { label: "Noros", icon: "cloud" };
  if (code === 45 || code === 48) return { label: "Ceață", icon: "fog" };
  if (code >= 51 && code <= 57) return { label: "Burniță", icon: "rain" };
  if (code >= 61 && code <= 67) return { label: "Ploaie", icon: "rain" };
  if (code >= 71 && code <= 77) return { label: "Ninsoare", icon: "snow" };
  if (code >= 80 && code <= 82) return { label: "Averse", icon: "rain" };
  if (code >= 85 && code <= 86) return { label: "Averse de ninsoare", icon: "snow" };
  if (code >= 95) return { label: "Furtună", icon: "storm" };
  return { label: "—", icon: "cloud" };
}

type IconKind = "sun" | "partly" | "cloud" | "fog" | "rain" | "snow" | "storm";

function WeatherIcon({ kind }: { kind: IconKind }) {
  const c = "var(--color-primary)";
  const g = "var(--text-muted)";
  const common = { width: 40, height: 40, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor" as const, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "sun": return <svg {...common} style={{ color: c }}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;
    case "partly": return <svg {...common} style={{ color: g }}><circle cx="8" cy="8" r="3" stroke={c} /><path d="M8 2v1.5M3.5 8H2M4.3 4.3l-.9-.9" stroke={c} /><path d="M17 18H7a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 18Z" /></svg>;
    case "cloud": return <svg {...common} style={{ color: g }}><path d="M17 18H7a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 18Z" /></svg>;
    case "fog": return <svg {...common} style={{ color: g }}><path d="M4 15h16M6 19h12M5 11h11a3.5 3.5 0 0 0-6.5-2.2A4 4 0 0 0 5 11Z" /></svg>;
    case "rain": return <svg {...common} style={{ color: g }}><path d="M17 14H7a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 14Z" /><path d="M8 18l-1 2M12 18l-1 2M16 18l-1 2" stroke={c} /></svg>;
    case "snow": return <svg {...common} style={{ color: g }}><path d="M17 14H7a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 14Z" /><path d="M8 19h.01M12 20h.01M16 19h.01" stroke={c} /></svg>;
    case "storm": return <svg {...common} style={{ color: g }}><path d="M17 13H7a4 4 0 0 1 .5-8 5 5 0 0 1 9.5 1.5A3.5 3.5 0 0 1 17 13Z" /><path d="M12 13l-2 4h3l-2 4" stroke={c} /></svg>;
  }
}

export function StationWeather({ lat, lng, city }: { lat: number; lng: number; city: string }) {
  const [data, setData] = useState<Current | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Europe%2FBucharest`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const c = j.current;
        if (!c) { setErr(true); return; }
        setData({
          temp: Math.round(c.temperature_2m),
          feels: Math.round(c.apparent_temperature),
          humidity: Math.round(c.relative_humidity_2m),
          wind: Math.round(c.wind_speed_10m),
          code: c.weather_code,
        });
      })
      .catch(() => { if (!cancelled) setErr(true); });
    return () => { cancelled = true; };
  }, [lat, lng]);

  if (err) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-3 text-xl font-bold text-strong">Vremea acum în {city}</h2>
      <div className="flex items-center gap-4 rounded-md border border-line bg-card p-4">
        {!data ? (
          <p className="text-sm text-muted">Se încarcă vremea…</p>
        ) : (
          <>
            <WeatherIcon kind={wmo(data.code).icon} />
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-strong tnum">{data.temp}°C</span>
                <span className="text-sm text-body">{wmo(data.code).label}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted">
                Resimțit {data.feels}°C · Umiditate {data.humidity}% · Vânt {data.wind} km/h
              </div>
            </div>
          </>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">Sursă: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">Open-Meteo</a>.</p>
    </section>
  );
}
