import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/account";
  const allowedPaths = ["/account", "/admin", "/vendor/dashboard", "/orders", "/wishlist"];
  if (next.includes(":") || next.startsWith("//") || !next.startsWith("/") || (next.length > 1 && !allowedPaths.some(p => next.startsWith(p)))) {
    next = "/account";
  }

  if (code) {
    const setCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              setCookies.push({ name, value, options });
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      );
      await adminClient.from("customers").upsert({
        user_id: data.user.id,
        email: data.user.email!,
        full_name: data.user.user_metadata?.full_name || null,
        phone: data.user.user_metadata?.phone || null,
      }, { onConflict: "user_id", ignoreDuplicates: true });

      const redirect = NextResponse.redirect(`${origin}${next}`);
      setCookies.forEach((c) => redirect.cookies.set(c.name, c.value));
      return redirect;
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
