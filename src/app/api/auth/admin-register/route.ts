import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limiter";
import { timingSafeEqual, isValidEmail } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || req.headers.get("x-real-ip")
    || "unknown";

  const { allowed, retryAfter } = rateLimit(`admin-register:${ip}`, 5, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  try {
    const body = await req.json();
    const { email, password, fullName, phone, role, secretCode } = body;

    // ── Secret check (timing-safe to prevent brute-force enumeration) ─────────
    const expectedSecret = process.env.ADMIN_REGISTRATION_SECRET;
    if (!expectedSecret) {
      return NextResponse.json({ error: "Admin registration is not configured." }, { status: 500 });
    }
    if (
      typeof secretCode !== "string" ||
      !timingSafeEqual(secretCode, expectedSecret)
    ) {
      return NextResponse.json({ error: "Invalid secret registration code. Access denied." }, { status: 403 });
    }

    // ── Input validation ───────────────────────────────────────────────────────
    if (!email || !password || !role) {
      return NextResponse.json({ error: "Email, password, and role are required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    // Sanitize fullName — strip any HTML and limit length
    const safeName = typeof fullName === "string"
      ? fullName.replace(/[<>]/g, "").slice(0, 100)
      : "";
    const safePhone = typeof phone === "string" ? phone.slice(0, 20) : "";
    const safeRole = role === "superadmin" ? "superadmin" : "admin";

    // ── Create Supabase auth user ──────────────────────────────────────────────
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: safeName, phone: safePhone, role: safeRole, tenant_id: "admin" },
    });

    if (authError) {
      return NextResponse.json({ error: "Registration failed. The email may already be in use." }, { status: 400 });
    }

    // ── Insert into admin_users table (service role bypasses RLS) ─────────────
    const { error: adminError } = await supabaseAdmin.from("admin_users").insert({
      email,
      role: safeRole,
    });

    if (adminError) {
      // Roll back the auth user to keep state consistent
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    // ── Send welcome email (non-critical — failure does not fail registration) ─
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Trivo Kenya <receipts@trivokenya.store>",
        to: email,
        subject: "Welcome to Trivo Kenya Admin Portal",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563EB;">Welcome, ${safeName || "Admin"}!</h2>
            <p>Your administrator account for Trivo Kenya has been successfully created.</p>
            <p>You can now log in to the admin dashboard using your email address and password to manage the store.</p>
            <br/>
            <p>Best regards,<br/>The Trivo Kenya Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send admin welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully.",
      email,
    });
  } catch (err) {
    console.error("Admin register error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
