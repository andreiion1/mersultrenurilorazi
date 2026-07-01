import { NextResponse } from "next/server";
import { stationBySlug } from "@/data/stations";
import { departures, todayISO } from "@/lib/schedule";
import { checkRateLimit, getIP, parseISODate } from "@/lib/rateLimit";

// GET /api/v1/stations/:slug/departures?date=  (docs/04 S5.3)
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { allowed, remaining, resetAt } = checkRateLimit(getIP(req), 60);
  if (!allowed) {
    return NextResponse.json(
      { data: null, meta: {}, errors: [{ code: "RATE_LIMITED", message: "Prea multe cereri." }] },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" } }
    );
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const date = parseISODate(searchParams.get("date"), todayISO());
  const s = stationBySlug(slug);
  if (!s) {
    return NextResponse.json({ data: null, meta: {}, errors: [{ code: "STATION_NOT_FOUND", message: "Gara inexistenta." }] }, { status: 404 });
  }
  // Cache până la miezul nopții zilei (orarul e static pe dată)
  const midnight = new Date(date + "T23:59:59").getTime();
  const maxAge = Math.min(Math.max(0, Math.floor((midnight - Date.now()) / 1000)), 3600);

  return NextResponse.json(
    {
      data: { station: { slug: s.slug, name: s.name }, date, departures: departures(s.slug, date) },
      meta: { source: "mock", observedAt: new Date().toISOString() },
      errors: [],
    },
    {
      headers: {
        "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=60`,
        "X-RateLimit-Remaining": String(remaining),
      },
    }
  );
}
