import { NextResponse } from "next/server";
import { stationBySlug } from "@/data/stations";
import { search, todayISO } from "@/lib/schedule";
import { checkRateLimit, getIP, parseISODate } from "@/lib/rateLimit";

// GET /api/v1/search/routes?from=&to=&date=  (docs/04 S5.1)
export async function GET(req: Request) {
  const { allowed, remaining, resetAt } = checkRateLimit(getIP(req), 60);
  if (!allowed) {
    return NextResponse.json(
      { data: null, meta: {}, errors: [{ code: "RATE_LIMITED", message: "Prea multe cereri. Incearca din nou in cateva secunde." }] },
      { status: 429, headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)), "X-RateLimit-Remaining": "0" } }
    );
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const date = parseISODate(searchParams.get("date"), todayISO());

  const fromStation = stationBySlug(from);
  const toStation = stationBySlug(to);

  if (!fromStation || !toStation) {
    return NextResponse.json(
      { data: null, meta: {}, errors: [{ code: "STATION_NOT_FOUND", message: "Statie inexistenta.", field: !fromStation ? "from" : "to" }] },
      { status: 400 }
    );
  }
  if (from === to) {
    return NextResponse.json(
      { data: null, meta: {}, errors: [{ code: "SAME_ORIGIN_DEST", message: "Plecarea si destinatia trebuie sa difere." }] },
      { status: 422 }
    );
  }

  const result = search(from, to, date);
  const summary = {
    directCount: result.direct.length,
    connectionCount: result.connections.length,
    fastestMin: result.all.length ? Math.min(...result.all.map((r) => r.totalDurationMin)) : null,
    cheapestPrice: result.all.length ? Math.min(...result.all.map((r) => r.priceFrom.amount)) : null,
  };

  return NextResponse.json(
    {
      data: {
        from: { id: fromStation.id, name: fromStation.name, slug: fromStation.slug },
        to: { id: toStation.id, name: toStation.name, slug: toStation.slug },
        date,
        results: result.all,
        summary,
      },
      meta: { cached: false, generatedAt: new Date().toISOString(), source: "mock" },
      errors: [],
    },
    { headers: { "Cache-Control": "public, max-age=3600", "X-RateLimit-Remaining": String(remaining) } }
  );
}
