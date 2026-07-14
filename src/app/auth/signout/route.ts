import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const formData = await request.formData().catch(() => null);
  let redirectTo = formData?.get("redirect")?.toString() || "/auth/login";

  const allowedRedirects = ["/auth/login", "/admin/login", "/vendor", "/account"];
  if (!allowedRedirects.includes(redirectTo)) {
    redirectTo = "/auth/login";
  }

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL(redirectTo, origin));
}

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
