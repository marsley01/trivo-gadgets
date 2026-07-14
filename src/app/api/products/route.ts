import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiCacheHeaders } from "@/lib/cache";
import { rateLimitMiddleware } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const blocked = rateLimitMiddleware(`products-api:${ip}`, 60, 60000);
  if (blocked) return blocked;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, category, seo_description, description, slug, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { products: data || [] },
      { headers: apiCacheHeaders(30) }
    );
  } catch (e) {
    console.error("Products API error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
