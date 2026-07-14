import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  let redirectTo = formData?.get("redirect")?.toString() || "/auth/login";

  const allowedRedirects = ["/auth/login", "/admin/login", "/vendor", "/account"];
  if (!allowedRedirects.includes(redirectTo)) {
    redirectTo = "/auth/login";
  }

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Signout error:", err);
  }

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL(redirectTo, origin));
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Signout error:", err);
  }
  return NextResponse.redirect(new URL("/auth/login", request.url));
}
