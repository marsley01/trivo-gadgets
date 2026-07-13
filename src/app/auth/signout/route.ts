import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trivokenya.store";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Get redirect from form data or default to /auth/login
  const formData = await request.formData().catch(() => null);
  let redirectTo = formData?.get("redirect")?.toString() || "/auth/login";

  // Validate redirect against allowlist to prevent open redirect
  const allowedRedirects = ["/auth/login", "/admin/login", "/vendor", "/account"];
  if (!allowedRedirects.includes(redirectTo)) {
    redirectTo = "/auth/login";
  }

  return NextResponse.redirect(new URL(redirectTo, SITE_URL));
}

export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/login", SITE_URL));
}
