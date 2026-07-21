import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    // ENFORCE Vercel Cron Secret — always required, no bypass if env var missing
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize Supabase Admin Client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() {},
        },
      }
    );

    // Lightweight query to keep the Supabase project active
    const { error } = await supabase
      .from("products")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Keep-alive ping failed:", error);
      return NextResponse.json({ error: "Failed to ping database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Supabase keep-alive ping successful", ts: new Date().toISOString() });

  } catch (err: unknown) {
    console.error("Cron Keep-Alive Error:", err);
    return NextResponse.json({ error: "Keep-alive execution failed." }, { status: 500 });
  }
}
