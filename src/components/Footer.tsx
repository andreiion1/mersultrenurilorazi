import Link from "next/link";
import { Container } from "./Container";
import { getPopularRoutes } from "@/data/routes";
import { majorStations } from "@/data/stations";

const RESURSE = [
  { href: "/mersul-trenurilor", label: "Mersul trenurilor" },
  { href: "/trenuri-azi",       label: "Trenuri azi" },
  { href: "/trenuri-maine",     label: "Trenuri maine" },
  { href: "/intarzieri-trenuri", label: "Intarzieri live" },
  { href: "/harta-trenuri-live", label: "Harta live" },
  { href: "/blog",              label: "Blog" },
];

const COMPANIE = [
  { href: "/despre",                          label: "Despre noi" },
  { href: "/surse-de-date",                   label: "Surse de date" },
  { href: "/termeni-si-conditii",             label: "Termeni" },
  { href: "/politica-de-confidentialitate",   label: "Confidentialitate" },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-xs transition-colors"
        style={{ color: "rgba(255,255,255,0.45)" }}
      >
        {children}
      </Link>
    </li>
  );
}

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mb-4 text-xs font-semibold uppercase tracking-widest"
      style={{ color: "rgba(255,255,255,0.30)" }}
    >
      {children}
    </h3>
  );
}

export function Footer() {
  const routes = getPopularRoutes().slice(0, 8);
  const stations = majorStations().slice(0, 8);

  return (
    <footer style={{ backgroundColor: "var(--color-navy)", marginTop: "3rem" }}>
      <div style={{ height: "1px", background: "linear-gradient(90deg,transparent,var(--color-primary),transparent)", opacity: 0.4 }} />

      <Container className="py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <ColTitle>Rute populare</ColTitle>
            <ul className="space-y-2">
              {routes.map((r) => (
                <FooterLink key={r.slug} href={`/rute/${r.slug}`}>
                  {r.fromCity} – {r.toCity}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Gari mari</ColTitle>
            <ul className="space-y-2">
              {stations.map((s) => (
                <FooterLink key={s.slug} href={`/statii/${s.slug}`}>
                  {s.name}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Resurse</ColTitle>
            <ul className="space-y-2">
              {RESURSE.map(({ href, label }) => (
                <FooterLink key={href} href={href}>{label}</FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <ColTitle>Companie</ColTitle>
            <ul className="space-y-2">
              {COMPANIE.map(({ href, label }) => (
                <FooterLink key={href} href={href}>{label}</FooterLink>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <div style={{ borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
        <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true">
              <rect x="4" y="3" width="16" height="13" rx="2" />
              <path d="M4 10h16M9 19l-2 2M15 19l2 2M9 19h6" />
            </svg>
            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
              Mersul Trenurilor <span style={{ color: "var(--color-primary)" }}>Azi</span>
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>
            &copy; {new Date().getFullYear()} Mersul Trenurilor Azi &middot; Informatii orientative &middot; Verificati sursa oficiala inainte de calatorie.
          </p>
        </Container>
      </div>
    </footer>
  );
}
