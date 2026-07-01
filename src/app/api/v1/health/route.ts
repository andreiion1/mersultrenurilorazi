import { NextResponse } from "next/server";

// GET /api/v1/health (docs/04 §5.10)
export async function GET() {
  return NextResponse.json({
    data: { status: "ok", db: "mock", redis: "mock", search: "mock" },
    meta: { generatedAt: new Date().toISOString() },
    errors: [],
  });
}
