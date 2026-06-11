import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

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
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all /admin routes except /admin/login
  if (request.nextUrl.pathname.startsWith("/admin") && !request.nextUrl.pathname.startsWith("/admin/login")) {
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
  if (request.nextUrl.pathname === "/admin/login" && user) {
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
  if (request.nextUrl.pathname.startsWith("/vendor/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }
  }

  // Redirect /vendor to /vendor/dashboard if already logged in AS A VENDOR
  if (request.nextUrl.pathname === "/vendor" && user) {
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
  if (request.nextUrl.pathname.startsWith("/account")) {
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
