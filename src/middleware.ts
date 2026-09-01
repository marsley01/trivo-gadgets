import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Regex that matches a standard v4 UUID
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Apply all security headers to any NextResponse (including redirects / errors). */
function applySecurityHeaders(res: NextResponse, pathname: string): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()"
  );
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://openrouter.ai https://vitals.vercel-insights.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // Prevent Google from indexing private/utility pages
  const noindexPaths = ["/checkout", "/receipt", "/account", "/auth", "/wishlist"];
  if (noindexPaths.some((p) => pathname.startsWith(p))) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── WordPress query-param URLs ────────────────────────────────────────────
  // ?p=123 and ?page_id=456 are WordPress post/page ID URLs — return 410 Gone
  if (searchParams.has("p") || searchParams.has("page_id")) {
    return applySecurityHeaders(new NextResponse(null, { status: 410 }), pathname);
  }
  // WordPress ?s= search → redirect to our /search page
  if (searchParams.has("s") && !pathname.startsWith("/search")) {
    const q = searchParams.get("s") || "";
    const redirectUrl = new URL(`/search?q=${encodeURIComponent(q)}`, request.url);
    return applySecurityHeaders(NextResponse.redirect(redirectUrl, { status: 301 }), pathname);
  }
  // ── End WordPress query-param handling ─────────────────────────────────────

  // ── WooCommerce → Next.js URL redirects (301 / 410) ──────────────────────
  const oldWooPatterns: { regex: RegExp; to: (match: RegExpMatchArray) => string }[] = [
    { regex: /^\/product\/([^/]+)\/?$/, to: (m) => `/products/${m[1]}` },
    { regex: /^\/shop\/.+/, to: () => "/products" },
    { regex: /^\/shop\/?$/, to: () => "/products" },
    { regex: /^\/product-category\/([^/]+)/, to: (m) => `/categories/${m[1]}` },
    { regex: /^\/cart\/?$/, to: () => "/products" },
    { regex: /^\/my-account\/?/, to: () => "/account" },
    { regex: /^\/author\/.+/, to: () => "/about" },
    { regex: /^\/tag\/.+/, to: () => "/blog" },
    { regex: /^\/page\/\d+\/?$/, to: () => "/products" },
    // WordPress internals — 410 Gone (tells Google to de-index immediately)
    { regex: /^\/wp-content\/.+/, to: () => "" },
    { regex: /^\/wp-includes\/.+/, to: () => "" },
    { regex: /^\/wp-json\/.+/, to: () => "" },
    { regex: /^\/wp-admin\/?/, to: () => "" },
    { regex: /^\/wp-login\.php/, to: () => "" },
    { regex: /^\/xmlrpc\.php/, to: () => "" },
    { regex: /^\/feed\/?/, to: () => "" },
    { regex: /^\/comments\/feed\/?/, to: () => "" },

    // ── Old Category Redirects (SEO Repositioning) ──────────────────────────
    { regex: /^\/categories\/audio\/?/, to: () => "/categories/phones" },
    { regex: /^\/categories\/car-accessories\/?/, to: () => "/" },
    { regex: /^\/categories\/smart-home\/?/, to: () => "/" },
    { regex: /^\/categories\/kitchen-gadgets\/?/, to: () => "/" },
    { regex: /^\/categories\/gaming-consoles\/?/, to: () => "/categories/laptops" },
    { regex: /^\/categories\/cables\/?/, to: () => "/categories/phones" },
  ];

  const wooMatch = oldWooPatterns.find((p) => p.regex.test(pathname));
  if (wooMatch) {
    const match = pathname.match(wooMatch.regex)!;
    const dest = wooMatch.to(match);
    if (!dest) {
      return applySecurityHeaders(new NextResponse(null, { status: 410 }), pathname);
    }
    const redirectUrl = new URL(dest, request.url);
    redirectUrl.search = request.nextUrl.search;
    return applySecurityHeaders(NextResponse.redirect(redirectUrl, { status: 301 }), pathname);
  }
  // ── End WooCommerce redirects ─────────────────────────────────────────────

  // ── Build base response with security headers ─────────────────────────────
  let response = NextResponse.next({
    request: { headers: new Headers(request.headers) },
  });
  applySecurityHeaders(response, pathname);
  // Pass pathname to server components via custom header
  response.headers.set("x-next-url", pathname);

  // ── Supabase session handling ─────────────────────────────────────────────
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
          response = NextResponse.next({ request });
          applySecurityHeaders(response, pathname);
          response.headers.set("x-next-url", pathname);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── UUID → Slug redirect (301 Permanent) ──────────────────────────────────
  // Catches old Google-indexed URLs like /products/1c70e30f-3e51-424e-8353-...
  const productUuidMatch = pathname.match(/^\/products\/([^/]+)$/);
  if (productUuidMatch && UUID_REGEX.test(productUuidMatch[1])) {
    const uuid = productUuidMatch[1];
    const { data: product } = await supabase
      .from("products")
      .select("slug")
      .eq("id", uuid)
      .single();

    if (product?.slug) {
      const redirectUrl = new URL(`/products/${product.slug}`, request.url);
      redirectUrl.search = request.nextUrl.search;
      return applySecurityHeaders(NextResponse.redirect(redirectUrl, { status: 301 }), pathname);
    }
    // If no product found, fall through to the [slug] route which will 404
  }
  // ── End UUID → Slug redirect ───────────────────────────────────────────────

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Normalize pathname to prevent trailing slash bypass
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  // ── Protect /admin routes except /admin/login ────────────────────────────
  if (normalizedPath.startsWith("/admin") && !normalizedPath.startsWith("/admin/login")) {
    if (!user) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin/login", request.url)),
        pathname
      );
    }
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!adminUser) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/account", request.url)),
        pathname
      );
    }
  }

  // ── Redirect /admin/login → /admin if already an admin ──────────────────
  if (normalizedPath === "/admin/login" && user) {
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();

    if (adminUser) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/admin", request.url)),
        pathname
      );
    }
  }

  // ── Protect /vendor/dashboard routes ────────────────────────────────────
  if (normalizedPath.startsWith("/vendor/dashboard")) {
    if (!user) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/vendor", request.url)),
        pathname
      );
    }
  }

  // ── Redirect /vendor → /vendor/dashboard if already a vendor ────────────
  if (normalizedPath === "/vendor" && user) {
    const { data: vendor } = await supabase
      .from("vendors")
      .select("id")
      .eq("email", user.email)
      .single();

    if (vendor) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/vendor/dashboard", request.url)),
        pathname
      );
    }
  }

  // ── Protect /account routes ──────────────────────────────────────────────
  if (normalizedPath.startsWith("/account")) {
    if (!user) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL("/auth/login", request.url)),
        pathname
      );
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
