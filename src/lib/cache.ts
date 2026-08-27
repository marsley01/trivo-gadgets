export function cacheHeaders(ttlSeconds: number = 60, staleWhileRevalidate: number = 300): Record<string, string> {
  return {
    "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}

export function noCacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
  };
}

export function apiCacheHeaders(ttlSeconds: number = 60): Record<string, string> {
  return {
    "Cache-Control": `public, max-age=0, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 5}`,
  };
}
