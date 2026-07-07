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
