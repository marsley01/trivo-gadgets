import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`vendor-register:${ip}`, 3, 60000);
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
    const { email, password, fullName, phone, businessName } = await req.json();

    if (!email || !password || !businessName) {
      return NextResponse.json({ error: "Email, password, and business name are required." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { full_name: fullName, phone, business_name: businessName, role: "vendor", tenant_id: "vendor" },
    });

    if (authError) {
      return NextResponse.json({ error: "Registration failed. The email may already be in use." }, { status: 400 });
    }

    // Insert into vendors table using service role
    const { error: vendorError } = await supabaseAdmin.from("vendors").insert({
      name: fullName || businessName,
      email,
      phone: phone || null,
      business_name: businessName,
      status: "active",
    });

    if (vendorError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    // Send welcome email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Trivo Kenya <receipts@trivokenya.store>",
        to: email,
        subject: "Welcome to Trivo Kenya Vendor Portal",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563EB;">Welcome, ${businessName}!</h2>
            <p>Your vendor account for Trivo Kenya has been successfully created.</p>
            <p>Please check your email to verify your account before logging in to the vendor dashboard.</p>
            <br/>
            <p>Best regards,<br/>The Trivo Kenya Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send vendor welcome email:", emailError);
    }

    // Notify admin
    try {
      const { sendAdminNotification } = await import("@/lib/notifications");
      await sendAdminNotification({
        type: "new_vendor",
        data: { name: fullName || businessName, email, businessName: businessName || "" },
      });
    } catch {} // ignore notification failures

    return NextResponse.json({
      success: true,
      message: "Vendor account created. Check your email to confirm before signing in.",
      email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
