import { NextResponse } from "next/server";
import { liveTrainPositions } from "@/lib/live";
import { checkRateLimit, getIP } from "@/lib/rateLimit";

// GET /api/v1/map/positions — pozitii aproximative ale trenurilor active (mock/semi-live).
// Rate limit: 120 req/min (refresh la 30s x 4 clienti simultani cu marja).
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { allowed, remaining, resetAt } = checkRateLimit(getIP(req), 120);
  if (!allowed) {
    return NextResponse.json(
      { data: null, meta: {}, errors: [{ code: "RATE_LIMITED", message: "Prea multe cereri. Incearca din nou in cateva secunde." }] },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": String(remaining),
        },
      }
    );
  }

  const positions = liveTrainPositions();
  return NextResponse.json(
    {
      data: positions,
      meta: { source: "mock_interpolated", generatedAt: new Date().toISOString(), count: positions.length },
      errors: [],
    },
    { headers: { "X-RateLimit-Remaining": String(remaining) } }
  );
}
