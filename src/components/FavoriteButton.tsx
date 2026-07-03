"use client";

import { useEffect, useState } from "react";
import { isFavorite, toggleFavorite, FAVORITES_EVENT, type FavItem } from "@/lib/favorites";

type Props = {
  item: Omit<FavItem, "addedAt">;
  /** "button" = buton cu text (pe pagini), "icon" = doar inima (pe carduri). */
  variant?: "button" | "icon";
  dark?: boolean;
};

function Heart({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"} stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

export function FavoriteButton({ item, variant = "button", dark = false }: Props) {
  const [fav, setFav] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sync = () => setFav(isFavorite(item.kind, item.slug));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync); // sincron între taburi
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [item.kind, item.slug]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFav(toggleFavorite(item));
  };

  const color = fav ? "var(--color-primary)" : dark ? "rgba(255,255,255,0.55)" : "var(--text-muted)";
  const title = fav ? "Elimină din favorite" : "Adaugă la favorite";

  if (variant === "icon") {
    return (
      <button type="button" onClick={onClick} aria-pressed={fav} aria-label={title} title={title}
        style={{ color, flexShrink: 0, lineHeight: 0 }}>
        <Heart filled={mounted && fav} size={18} />
      </button>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={fav} title={title}
      className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
      style={{
        color, backgroundColor: "transparent",
        border: `1.5px solid ${fav ? "var(--color-primary)" : dark ? "rgba(255,255,255,0.2)" : "var(--border)"}`,
      }}>
      <Heart filled={mounted && fav} size={16} />
      {mounted && fav ? "Salvat" : "Salvează"}
    </button>
  );
}
