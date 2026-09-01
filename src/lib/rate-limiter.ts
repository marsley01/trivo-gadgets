/**
 * Rate limiter using an in-memory Map.
 * NOTE: In serverless/edge environments, state resets on cold start. This is
 * intentional — it provides best-effort protection within a single server
 * instance without requiring Redis.
 *
 * Expired entries are pruned on every write to prevent unbounded memory growth.
 */

const rateMap = new Map<string, { count: number; resetAt: number }>();

/** Remove all entries whose window has already expired. Called periodically on writes. */
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

/**
 * Rate-limit a server action by caller IP.
 * Reads the IP from the Next.js `headers()` API.
 * Falls back to "unknown" if headers are not available (e.g., during tests).
 */
export async function rateLimitServerAction(
  prefix: string,
  maxAttempts: number,
  windowMs: number
): Promise<{ allowed: boolean; retryAfter: number }> {
  let ip = "unknown";
  try {
    const { headers } = await import("next/headers");
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const raw = forwarded || realIp || "unknown";
    ip = raw.split(",")[0].trim();
  } catch {
    // Headers unavailable — use fallback key
  }
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
