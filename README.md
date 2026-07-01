# mersultrenurilorazi.ro — MVP

Agregator de orar feroviar pentru România. SEO-first, mobile-first. Construit cu **Next.js 14 (App Router) + TypeScript + Tailwind**, pe **date mock realiste** (fără bază de date necesară pentru a rula).

> Documentația completă de produs/tehnică este în `../docs/`. Acest folder (`app/`) conține implementarea.

---

## Rulare locală

Cerințe: Node.js ≥ 18.18.

```bash
cd app
npm install
npm run dev
```

Deschide http://localhost:3000

Build de producție:
```bash
npm run build && npm run start
```

Verificare tipuri:
```bash
npm run typecheck
```

---

## Ce funcționează (MVP)

- **Căutare rute** (`/cautare`) — directe + cu 1 schimbare, cu badge-uri „cel mai rapid / cea mai ieftină / direct”, durată, preț estimativ, status și buton „Cumpără bilet” (deep-link CFR).
- **Homepage** (`/`) — casetă de căutare cu autocomplete, rute populare, gări mari, exemple de trenuri azi.
- **`/mersul-trenurilor`** — pagină pilon cu căutare, rute, gări, FAQ + schema.
- **`/trenuri-azi`** — trenuri reprezentative azi pe rutele principale (SSR dinamic).
- **Pagini de rută** (`/rute/[slug]`, ex. `/rute/bucuresti-nord-brasov`) — orar azi, statistici, FAQ, schema FAQ + Breadcrumb, linking intern.
- **Index rute** (`/rute`).
- **Pagini de gară** (`/statii/[slug]`) — plecări/sosiri (tab), destinații populare, FAQ, schema TrainStation.
- **Plecări/Sosiri** (`/plecari/[slug]`, `/sosiri/[slug]`).
- **Pagini de tren** (`/tren/[slug]`, ex. `/tren/ir-1592`) — traseu cu toate opririle, istoric/risc întârziere (mock), zile circulație.
- **Întârzieri** (`/intarzieri-trenuri`) — listă status live (mock) + disclaimer.
- **Hartă live** (`/harta-trenuri-live`) — listă trenuri active SSR + placeholder hartă (Leaflet = TODO).
- **SEO** — meta tags dinamice, Open Graph, canonical, `sitemap.xml`, `robots.txt`, JSON-LD (WebSite+SearchAction, FAQPage, BreadcrumbList, TrainStation).
- **Design system** — tokens din `docs/06`, light/dark mode (toggle), componente reutilizabile, responsive, bottom nav pe mobil.
- **PWA** — `manifest.webmanifest` (iconițele lipsesc — TODO).
- **API REST** (mock): `GET /api/v1/health`, `/api/v1/search/stations`, `/api/v1/search/routes`, `/api/v1/stations/[slug]/departures`.

## Ce este mock (simulat)

- **Orarul** (stații, trenuri, opriri) — set realist scris manual în `src/data/` (~22 gări, 20 trenuri). NU este orarul oficial complet.
- **Statusul/întârzierile** — generate determinist (`mockStatus` în `src/lib/schedule.ts`).
- **Prețurile** — estimate din distanță (`estimatePrice`).
- **Pozițiile pe hartă** — neimplementate (placeholder).
- **Istoricul de întârzieri / risc** — simulat.

## Ce trebuie conectat la date reale (pentru producție)

1. **Import orar XML** din [data.gov.ro „Mers tren”](https://data.gov.ro/dataset/mers-tren-sntfc-cfr-calatori-s-a) → PostgreSQL (schema în `prisma/schema.prisma`). Înlocuiește `src/data/*`.
2. **Status/întârzieri real-time** — sursă oficială/semi-live (IRIS) sau parteneriat CFR/Infofer. De clarificat juridic. Înlocuiește `mockStatus`, `liveDelays`.
3. **Prețuri & deep-link bilete** — validează parametrii URL reali pentru `bilete.cfrcalatori.ro` și/sau program de afiliere.
4. **Hartă live** — Leaflet + OpenStreetMap + interpolare poziție din orar+status (`live_positions`).
5. **Bază de date** — activează Prisma (`DATABASE_URL`), rulează migrații, mută citirile din `src/data` în repository-uri DB.
6. **Search** — Meilisearch pentru autocomplete la scară (acum filtrare in-memory).
7. **Backend dedicat** — opțional, mutarea API în NestJS (docs/04) când complexitatea crește.
8. **Iconițe PWA** — `public/icon-192.png`, `public/icon-512.png`.

## Structura

```
app/
├── prisma/schema.prisma          # schema DB producție (docs/03)
├── src/
│   ├── app/                      # rute Next.js (pagini + API + sitemap/robots/manifest)
│   ├── components/               # UI (design system docs/06)
│   ├── data/                     # DATE MOCK: operators, stations, trains, routes
│   └── lib/                      # types, slug, schedule (search), seo
├── tailwind.config.ts
└── package.json
```

## Pași următori (producție)

Vezi `../docs/10-roadmap-sprinturi.md`. Pe scurt: import XML real (Sprint 1) → extindere pagini (Sprint 3-4) → status live + juridic (Sprint 5) → PWA + monetizare + hartă (Sprint 6).
