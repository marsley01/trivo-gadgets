import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

let cachedToken: { token: string; expiresAt: number } | null = null;
const TTL = 20 * 60 * 1000;

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST() {
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
    const res = await fetch("https://developers.cjdropshipping.com/api2.0/v1/authentication/getToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (json.code !== 200 || !json.data?.accessToken) {
      console.error("CJ token error:", json);
      return NextResponse.json({ error: "Failed to authenticate with CJ" }, { status: 500 });
    }

    cachedToken = { token: json.data.accessToken, expiresAt: Date.now() + TTL };

    return NextResponse.json({ accessToken: json.data.accessToken });
  } catch (err) {
    console.error("CJ token request failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
