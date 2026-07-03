"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readFavorites, removeFavorite, FAVORITES_EVENT, type FavItem, type FavKind } from "@/lib/favorites";

const SECTIONS: { kind: FavKind; title: string; empty: string }[] = [
  { kind: "route", title: "Rute salvate", empty: "Nicio rută salvată încă." },
  { kind: "station", title: "Gări salvate", empty: "Nicio gară salvată încă." },
  { kind: "train", title: "Trenuri salvate", empty: "Niciun tren salvat încă." },
];

export function FavoritesList() {
  const [items, setItems] = useState<FavItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setItems(readFavorites());
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!mounted) {
    return <p className="mt-4 text-sm text-muted">Se încarcă favoritele…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-4 rounded-md border border-line bg-card p-6 text-center text-muted">
        <p>Nu ai nimic salvat încă.</p>
        <p className="mt-1 text-sm">
          Apasă pe inima <span aria-hidden="true">♡</span> de pe orice{" "}
          <Link href="/rute" className="text-primary hover:underline">rută</Link>,{" "}
          <Link href="/statii" className="text-primary hover:underline">gară</Link> sau pagină de tren ca s-o salvezi aici.
        </p>
        <p className="mt-3 text-xs">Favoritele sunt salvate doar în acest browser, pe dispozitivul tău.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-8">
      {SECTIONS.map(({ kind, title, empty }) => {
        const list = items.filter((f) => f.kind === kind);
        if (list.length === 0) return null;
        return (
          <section key={kind}>
            <h2 className="mb-3 text-lg font-bold text-strong">{title} ({list.length})</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {list.map((f) => (
                <div key={f.slug} className="flex items-center justify-between gap-3 rounded-md border border-line bg-card p-3">
                  <Link href={f.href} className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-strong hover:text-primary">{f.label}</div>
                    {f.sub && <div className="truncate text-sm text-muted">{f.sub}</div>}
                  </Link>
                  <button type="button" onClick={() => removeFavorite(f.kind, f.slug)}
                    aria-label="Elimină din favorite" title="Elimină din favorite"
                    className="flex-shrink-0 rounded-md p-1.5 text-muted hover:text-danger"
                    style={{ lineHeight: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <p className="text-xs text-muted">Favoritele sunt salvate doar în acest browser, pe dispozitivul tău. Nu le stocăm pe servere.</p>
    </div>
  );
}
