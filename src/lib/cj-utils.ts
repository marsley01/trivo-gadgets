export function extractProductId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(/-p-([A-Za-z0-9]+)\.html/);
  if (urlMatch) return urlMatch[1];

  const idMatch = trimmed.match(/^[A-Za-z0-9]+$/);
  if (idMatch) return idMatch[0];

  return null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
const TTL = 20 * 60 * 1000;

export async function getCachedCjToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const email = process.env.CJ_EMAIL;
  const password = process.env.CJ_API_KEY;

  if (!email || !password) {
    throw new Error("CJ API credentials not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getToken", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  const json = await res.json();

  if (json.code !== 200 || !json.data?.accessToken) {
    throw new Error("Failed to authenticate with CJ");
  }

  cachedToken = { token: json.data.accessToken, expiresAt: Date.now() + TTL };
  return cachedToken.token;
}
