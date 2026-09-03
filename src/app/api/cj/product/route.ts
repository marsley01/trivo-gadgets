import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";
import { apiCacheHeaders } from "@/lib/cache";
import { getCachedCjToken } from "@/lib/cj-utils";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`cj-product:${ip}`, 30, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  const pid = req.nextUrl.searchParams.get("pid");

  if (!pid) {
    return NextResponse.json({ error: "Product ID (pid) is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id")
    .eq("email", user.email || "")
    .single();

  if (!adminUser) {
    const { data: vendorUser } = await supabase
      .from("vendors")
      .select("id")
      .eq("email", user.email || "")
      .single();
    if (!vendorUser) {
      return NextResponse.json({ error: "Forbidden: admin or vendor access required." }, { status: 403 });
    }
  }

  try {
    const accessToken = await getCachedCjToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Failed to get CJ access token" }, { status: 500 });
    }

    const apiUrl = new URL("https://developers.cjdropshipping.com/api2.0/v1/product/query");
    apiUrl.searchParams.set("pid", pid);

    const productController = new AbortController();
    const productTimeout = setTimeout(() => productController.abort(), 15000);
    const res = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: { "CJ-Access-Token": accessToken },
      signal: productController.signal,
    });
    clearTimeout(productTimeout);

    const json = await res.json();

    if (!res.ok || json.code !== "200") {
      if (json.code === "404" || res.status === 404) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      console.error("CJ product API error:", json);
      return NextResponse.json({ error: "Failed to fetch product from CJ" }, { status: 500 });
    }

    const product = json.data;

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const imageSet: string[] = [];
    if (product.productImageSet && Array.isArray(product.productImageSet)) {
      const allImages = product.productImageSet.filter(Boolean).slice(0, 5);
      imageSet.push(...allImages);
    }
    if (product.productImage && !imageSet.includes(product.productImage)) {
      imageSet.unshift(product.productImage);
    }

    const variants = (product.variants || []).map((v: Record<string, unknown>) => ({
      variantName: v.variantName || v.variant_name || "",
      variantSellPrice: parseFloat(String(v.variantSellPrice ?? v.variant_sell_price ?? v.sellPrice ?? v.sell_price ?? 0)),
      variantImage: v.variantImage || v.variant_image || "",
    }));

    return NextResponse.json(
      {
        pid: product.pid || pid,
        productName: product.productName || product.product_name || "",
        description: product.description || "",
        sellPrice: parseFloat(product.sellPrice ?? product.sell_price ?? 0),
        weight: parseFloat(product.weight ?? 0),
        productImage: product.productImage || product.product_image || imageSet[0] || "",
        productImageSet: imageSet,
        categoryName: product.categoryName || product.category_name || "",
        variants,
      },
      { headers: apiCacheHeaders(60) }
    );
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    console.error("CJ product fetch failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
