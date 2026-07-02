"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { href: "/cautare",            label: "Cauta ruta" },
  { href: "/trenuri-azi",        label: "Trenuri azi" },
  { href: "/statii",             label: "Gari" },
  { href: "/intarzieri-trenuri", label: "Intarzieri" },
  { href: "/harta-trenuri-live", label: "Harta live" },
  { href: "/blog",               label: "Blog" },
];

export function Header() {
  const path = usePathname();
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: "var(--color-navy)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <Container className="flex h-14 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold" style={{ color: "#fff" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true">
            <rect x="4" y="3" width="16" height="13" rx="2" />
            <path d="M4 10h16M8 3v7M16 3v7" />
            <circle cx="8.5" cy="14.5" r="1" fill="var(--color-primary)" stroke="none" />
            <circle cx="15.5" cy="14.5" r="1" fill="var(--color-primary)" stroke="none" />
            <path d="M9 19l-2 2M15 19l2 2M9 19h6" />
          </svg>
          <span className="hidden sm:inline">
            Mersul Trenurilor<span style={{ color: "var(--color-primary)" }}> la Zi</span>
          </span>
          <span className="sm:hidden">
            MT<span style={{ color: "var(--color-primary)" }}> la Zi</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigare principala">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  color: active ? "var(--color-primary)" : "rgba(255,255,255,0.60)",
                  backgroundColor: active ? "rgba(245,160,0,0.10)" : "transparent",
                }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span
            className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sm:flex"
            style={{
              backgroundColor: "rgba(0,200,150,0.12)",
              color: "var(--color-success)",
              border: "0.5px solid rgba(0,200,150,0.25)",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full pulse-live" style={{ backgroundColor: "var(--color-success)" }} />
            Live
          </span>
          <Link
            href="/cautare"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold sm:flex"
            style={{ backgroundColor: "var(--color-primary)", color: "var(--color-navy)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Cauta tren
          </Link>
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
