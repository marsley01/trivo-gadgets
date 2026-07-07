import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Regex that matches a standard v4 UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: new Headers(request.headers),
    },
  });

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live https://hcaptcha.com https://*.hcaptcha.com; style-src 'self' 'unsafe-inline' https://hcaptcha.com https://*.hcaptcha.com; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://openrouter.ai https://hcaptcha.com https://*.hcaptcha.com; frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com; object-src 'none'; base-uri 'self'; form-action 'self'"
  );

  // Pass pathname to server components via custom header
  response.headers.set("x-next-url", request.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          // Re-set the pathname header on the new response
          response.headers.set("x-next-url", request.nextUrl.pathname);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── UUID → Slug redirect (301 Permanent) ──────────────────────────────────
  // Catches old Google-indexed URLs like /products/1c70e30f-3e51-424e-8353-...
  // and permanently redirects them to the SEO-friendly slug URL.
  const productUuidMatch = request.nextUrl.pathname.match(/^\/products\/([^/]+)$/);
  if (productUuidMatch && UUID_REGEX.test(productUuidMatch[1])) {
    const uuid = productUuidMatch[1];
    const { data: product } = await supabase
      .from("products")
      .select("slug")
      .eq("id", uuid)
      .single();

    if (product?.slug) {
      const redirectUrl = new URL(`/products/${product.slug}`, request.url);
      // Preserve any query string (UTM params, etc.)
      redirectUrl.search = request.nextUrl.search;
      return NextResponse.redirect(redirectUrl, { status: 301 });
    }
    // If no product found, fall through to the [slug] route which will 404
  }
  // ── End UUID → Slug redirect ───────────────────────────────────────────────

  // ── WooCommerce → Next.js URL redirects (301) ───────────────────────────────
  // Redirect old WordPress/WooCommerce URLs that Google may still have indexed.
  const oldWooPatterns: { regex: RegExp; to: (match: RegExpMatchArray) => string }[] = [
    { regex: /^\/product\/(.+)/, to: () => "/products" },
    { regex: /^\/shop\/(.+)/, to: () => "/products" },
    { regex: /^\/shop\/?$/, to: () => "/products" },
    { regex: /^\/product-category\/(.+)/, to: (m) => `/categories/${m[1]}` },
    { regex: /^\/wp-content\/.+/, to: () => "" },
    { regex: /^\/wp-includes\/.+/, to: () => "" },
    { regex: /^\/wp-json\/.+/, to: () => "" },
    { regex: /^\/xmlrpc\.php/, to: () => "" },
    { regex: /^\/feed\/?/, to: () => "" },
    { regex: /^\/comments\/feed\/?/, to: () => "" },
  ];

  const wooMatch = oldWooPatterns.find((p) => p.regex.test(request.nextUrl.pathname));
  if (wooMatch) {
    const match = request.nextUrl.pathname.match(wooMatch.regex)!;
    const dest = wooMatch.to(match);
    if (!dest) {
      // Return 410 Gone for WordPress internals — tells Google to drop them fast
      return new NextResponse(null, { status: 410 });
    }
    const redirectUrl = new URL(dest, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }
  // ── End WooCommerce redirects ───────────────────────────────────────────────

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Normalize pathname to prevent trailing slash bypass
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";

  // Protect all /admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Check admin_users table for role verification
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!adminUser) {
      return NextResponse.redirect(new URL("/account", request.url));
    }
  }

  // Redirect /admin/login to /admin if already logged in
  if (pathname === "/admin/login" && user) {
    // Check if user is actually an admin
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (adminUser) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect all /vendor routes except /vendor itself (login page)
  if (pathname.startsWith("/vendor/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }
  }

  // Redirect /vendor to /vendor/dashboard if already logged in AS A VENDOR
  if (pathname === "/vendor" && user) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("email", user.email)
      .single();

    if (vendor) {
      return NextResponse.redirect(new URL("/vendor/dashboard", request.url));
    }
  }

  // Protect /account routes - redirect to login if not authenticated
  if (pathname.startsWith("/account")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
