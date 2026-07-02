import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { SearchBox } from "@/components/SearchBox";
import { RouteCard } from "@/components/RouteCard";
import { getPopularRoutes } from "@/data/routes";
import { majorStations } from "@/data/stations";
import { search, todayISO } from "@/lib/schedule";
import { TrainResultCard } from "@/components/TrainResultCard";

// Homepage: canonical pe propriul URL (rădăcina). Titlul rămâne cel implicit din layout.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const routes = getPopularRoutes();
  const stations = majorStations();
  const topRoute = routes[0];
  const sample = topRoute
    ? search(topRoute.fromSlug, topRoute.toSlug, todayISO()).all.slice(0, 3)
    : [];

  return (
    <>
      <section
        className="hero-navy relative"
        style={{ backgroundColor: "var(--color-navy)" }}
      >
        <Container className="py-10 md:py-16">
          <p
            className="mb-3 text-center text-xs font-semibold tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            Romania &middot; Trenuri de calatori &middot; Date actualizate zilnic
          </p>

          <h1
            className="mb-2 text-center text-3xl font-bold leading-tight md:text-4xl"
            style={{ color: "#ffffff" }}
          >
            Mersul trenurilor la zi &mdash;{" "}
            <span style={{ color: "var(--color-primary)" }}>clar si rapid.</span>
          </h1>

          <p
            className="mx-auto mb-8 max-w-xl text-center text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.50)" }}
          >
            Cauta orice tren din Romania. Orar, intarzieri si bilete &mdash;
            mai simplu decat site-urile oficiale.
          </p>

          <div className="mx-auto max-w-3xl">
            <SearchBox dark={true} />
          </div>

          <div className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
            {[
              { href: "/trenuri-azi", label: "Trenuri azi" },
              { href: "/intarzieri-trenuri", label: "Intarzieri" },
              { href: "/harta-trenuri-live", label: "Harta trenuri" },
              { href: "/favorite", label: "Favorite" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-xs font-medium transition-all"
                style={{
                  backgroundColor: "rgba(255,255,255,0.07)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.60)",
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>
            Rute populare
          </h2>
          <Link href="/rute" className="text-xs font-medium" style={{ color: "var(--color-info)" }}>
            Vezi toate &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((r) => (
            <RouteCard key={r.slug} r={r} />
          ))}
        </div>
      </Container>

      <Container className="pb-8">
        <h2 className="mb-3 text-lg font-bold" style={{ color: "var(--text-strong)" }}>
          Gari principale
        </h2>
        <div className="flex flex-wrap gap-2">
          {stations.map((s) => (
            <Link
              key={s.slug}
              href={`/statii/${s.slug}`}
              className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-default)",
              }}
            >
              {s.name}
            </Link>
          ))}
        </div>
      </Container>

      {sample.length > 0 && topRoute && (
        <Container className="pb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: "var(--text-strong)" }}>
              Trenuri azi: {topRoute.fromCity} &rarr; {topRoute.toCity}
            </h2>
            <Link href={`/rute/${topRoute.slug}`} className="text-xs font-medium" style={{ color: "var(--color-info)" }}>
              Toate trenurile &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {sample.map((r, i) => (
              <TrainResultCard key={i} r={r} />
            ))}
          </div>
        </Container>
      )}

      <Container className="pb-10">
        <div
          className="rounded-xl p-6"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2 className="mb-2 text-base font-bold" style={{ color: "var(--text-strong)" }}>
            Mersul trenurilor in Romania &mdash; tot ce trebuie sa stii
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-default)" }}>
            Mersul Trenurilor la Zi agregheza orarul complet al trenurilor CFR de calatori si iti arata
            in cateva secunde cel mai rapid tren, varianta directa fara schimbari si cel mai ieftin bilet
            disponibil &mdash; plus estimari de status si intarziere calculate din orar. Cauta rute intre{" "}
            <Link href="/statii" style={{ color: "var(--color-info)" }}>orice gari din Romania</Link>,
            vizualizeaza plecarile si sosirile, urmareste un tren individual si ajunge rapid la{" "}
            <Link href="/cautare" style={{ color: "var(--color-info)" }}>cumpararea biletului</Link>.
            Consulta si{" "}
            <Link href="/mersul-trenurilor" style={{ color: "var(--color-info)" }}>ghidul mersul trenurilor</Link>
            {" "}sau pagina de{" "}
            <Link href="/intarzieri-trenuri" style={{ color: "var(--color-info)" }}>intarzieri</Link>.
          </p>
        </div>
      </Container>
    </>
  );
}
