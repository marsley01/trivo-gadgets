/**
 * Rate limiter using an in-memory Map.
 * NOTE: In serverless/edge environments, state resets on cold start. This is
 * intentional — it provides best-effort protection within a single server
 * instance without requiring Redis.
 *
 * Expired entries are pruned on every write to prevent unbounded memory growth.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();

/** Remove all entries whose window has already expired. Call this periodically on writes. */
function pruneExpired(): void {
  const now = Date.now();
  for (const [key, entry] of rateMap) {
    if (now > entry.resetAt) {
      rateMap.delete(key);
    }
  }
}

export function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();

  // Prune expired entries to prevent memory leak
  if (rateMap.size > 500) {
    pruneExpired();
  }

  const entry = rateMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count += 1;

  if (entry.count > maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

export function getClientIp(): string {
  try {
    // Using dynamic require to avoid import issues in edge/server contexts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { headers } = require("next/headers");
    const headersList = headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    return typeof ip === "string" ? ip.split(",")[0].trim() : "unknown";
  } catch {
    return "unknown";
  }
}

export function rateLimitServerAction(
  prefix: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const ip = getClientIp();
  return rateLimit(`${prefix}:${ip}`, maxAttempts, windowMs);
}

export function rateLimitMiddleware(
  key: string,
  maxAttempts: number,
  windowMs: number
): Response | null {
  const { allowed, retryAfter } = rateLimit(key, maxAttempts, windowMs);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
        },
      }
    );
  }
  return null;
}
