"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cautare", label: "Cauta",
    d: "M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" },
  { href: "/trenuri-azi", label: "Azi",
    d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" },
  { href: "/statii", label: "Gari",
    d: "M4 3h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM2 10h20M9 3v9M15 3v9M7 19l-2 2M17 19l2 2M9 19h6" },
  { href: "/intarzieri-trenuri", label: "Intarzieri",
    d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" },
  { href: "/favorite", label: "Favorite",
    d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5 lg:hidden"
      style={{
        backgroundColor: "var(--color-navy)",
        borderTop: "0.5px solid rgba(255,255,255,0.08)",
      }}
      aria-label="Navigare mobila"
    >
      {ITEMS.map(({ href, label, d }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors"
            style={{ color: active ? "var(--color-primary)" : "rgba(255,255,255,0.40)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={d} />
            </svg>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
