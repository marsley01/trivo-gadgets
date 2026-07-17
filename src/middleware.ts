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
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://openrouter.ai; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'"
  );

  // Pass pathname to server components via custom header
  response.headers.set("x-next-url", request.nextUrl.pathname);

  // ── X-Robots-Tag: noindex for private/utility pages ───────────────────────
  // Prevents Google from crawling checkout, account, auth, receipt, wishlist
  const noindexPaths = ["/checkout", "/receipt", "/account", "/auth", "/wishlist"];
  if (noindexPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  // ── End noindex headers ────────────────────────────────────────────────────

  // ── WordPress query-param URLs (410 Gone) ─────────────────────────────────
  // ?p=123 and ?page_id=456 are WordPress post/page ID URLs — not valid here
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.has("p") || searchParams.has("page_id")) {
    return new NextResponse(null, { status: 410 });
  }
  // WordPress ?s= search → redirect to our /search page
  if (searchParams.has("s") && !request.nextUrl.pathname.startsWith("/search")) {
    const q = searchParams.get("s") || "";
    return NextResponse.redirect(
      new URL(`/search?q=${encodeURIComponent(q)}`, request.url),
      { status: 301 }
    );
  }
  // ── End WordPress query-param handling ────────────────────────────────────

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

  // ── WooCommerce → Next.js URL redirects (301 / 410) ──────────────────────
  // Redirect old WordPress/WooCommerce URLs that Google may still have indexed.
  const oldWooPatterns: { regex: RegExp; to: (match: RegExpMatchArray) => string }[] = [
    // WooCommerce single product pages → try to redirect to matching slug
    { regex: /^\/product\/([^/]+)\/?$/, to: (m) => `/products/${m[1]}` },
    // WooCommerce shop pages
    { regex: /^\/shop\/(.+)/, to: () => "/products" },
    { regex: /^\/shop\/?$/, to: () => "/products" },
    // WooCommerce product categories → map to our categories
    { regex: /^\/product-category\/([^/]+)/, to: (m) => `/categories/${m[1]}` },
    // WooCommerce cart & checkout
    { regex: /^\/cart\/?$/, to: () => "/products" },
    // WooCommerce my-account
    { regex: /^\/my-account\/?/, to: () => "/account" },
    // WordPress author/tag archives
    { regex: /^\/author\/.+/, to: () => "/about" },
    { regex: /^\/tag\/.+/, to: () => "/blog" },
    // WordPress paginated archive URLs
    { regex: /^\/page\/\d+\/?$/, to: () => "/products" },
    // WordPress core files — 410 Gone (tells Google to de-index immediately)
    { regex: /^\/wp-content\/.+/, to: () => "" },
    { regex: /^\/wp-includes\/.+/, to: () => "" },
    { regex: /^\/wp-json\/.+/, to: () => "" },
    { regex: /^\/wp-admin\/?/, to: () => "" },
    { regex: /^\/wp-login\.php/, to: () => "" },
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
  // ── End WooCommerce redirects ─────────────────────────────────────────────

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
