import { NextResponse } from "next/server";
import { stations, stationRank } from "@/data/stations";
import { slugify } from "@/lib/slug";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

// GET /api/v1/search/stations?q=bras&limit=8  (docs/04 S5.1) - garile mari prioritizate.
export async function GET(req: Request) {
  const { allowed, remaining, resetAt } = checkRateLimit(getIP(req), 120);
  if (!allowed) {
    return NextResponse.json(
      { data: [], meta: {}, errors: [{ code: "RATE_LIMITED", message: "Prea multe cereri." }] },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);
  const n = slugify(q);

  const pool = stations
    .map((s) => ({ s, norm: slugify(s.name), normCity: slugify(s.city), rank: stationRank(s) }))
    .filter((x) => !n || x.norm.includes(n) || x.normCity.includes(n));

  pool.sort((a, b) => {
    if (!n) return a.rank - b.rank || a.s.name.localeCompare(b.s.name, "ro");
    const sa = (a.norm.startsWith(n) || a.normCity.startsWith(n)) ? 0 : 1;
    const sb = (b.norm.startsWith(n) || b.normCity.startsWith(n)) ? 0 : 1;
    return sa - sb || a.rank - b.rank || a.s.name.localeCompare(b.s.name, "ro");
  });

  const data = pool.slice(0, limit).map(({ s }) => ({
    id: s.id, name: s.name, slug: s.slug, city: s.city, county: s.county, isMajor: s.isMajor,
  }));
  return NextResponse.json(
    { data, meta: { cached: false, generatedAt: new Date().toISOString(), source: "mock" }, errors: [] },
    { headers: { "Cache-Control": "public, max-age=43200", "X-RateLimit-Remaining": String(remaining) } }
  );
}
