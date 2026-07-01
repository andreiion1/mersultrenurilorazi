/**
 * Validare data ISO (YYYY-MM-DD). Returneaza data validata sau fallback.
 * Accepta date intre azi - 1 an si azi + 1 an.
 */
export function parseISODate(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const d = new Date(value + "T00:00:00");
  if (isNaN(d.getTime())) return fallback;
  const now = Date.now();
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (d.getTime() < now - oneYear || d.getTime() > now + oneYear) return fallback;
  return value;
}

/**
 * Rate limiter simplu in-memory pentru API routes.
 *
 * Functioneaza in serverless (Vercel) per instanta - nu e distribuit.
 * Pentru productie la scara, inlocuieste cu Redis / Upstash.
 *
 * Limita implicita: 60 cereri / minut per IP.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  ip: string,
  limit = 60,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now();
  const key = `rl:${ip}`;
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return {
    allowed: entry.count <= limit,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Extrage IP-ul din request (compatibil Vercel + Next.js 15).
 */
export function getIP(req: Request): string {
  const xff = req instanceof Request
    ? req.headers.get("x-forwarded-for")
    : null;
  if (xff) return xff.split(",")[0].trim();
  return "unknown";
}
