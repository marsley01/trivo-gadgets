const rateMap = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
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
    const { headers } = require("next/headers");
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
    return typeof ip === "string" ? ip : "unknown";
  } catch {
    return "unknown";
  }
}

export function rateLimitServerAction(prefix: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const ip = getClientIp();
  return rateLimit(`${prefix}:${ip}`, maxAttempts, windowMs);
}

export function rateLimitMiddleware(key: string, maxAttempts: number, windowMs: number): Response | null {
  const { allowed, retryAfter } = rateLimit(key, maxAttempts, windowMs);
  if (!allowed) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    });
  }
  return null;
}
