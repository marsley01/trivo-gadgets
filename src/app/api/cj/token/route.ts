import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limiter";

let cachedToken: { token: string; expiresAt: number } | null = null;
const TTL = 20 * 60 * 1000;

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`cj-token:${ip}`, 20, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return NextResponse.json({ accessToken: cachedToken.token });
  }

  const email = process.env.CJ_EMAIL;
  const password = process.env.CJ_API_KEY;

  if (!email || !password) {
    return NextResponse.json({ error: "CJ API credentials not configured" }, { status: 500 });
  }

  try {
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
      console.error("CJ token error:", json);
      return NextResponse.json({ error: "Failed to authenticate with CJ" }, { status: 500 });
    }

    cachedToken = { token: json.data.accessToken, expiresAt: Date.now() + TTL };

    return NextResponse.json({ accessToken: json.data.accessToken });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "CJ API request timeout" }, { status: 504 });
    }
    console.error("CJ token request failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
