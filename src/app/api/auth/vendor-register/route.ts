import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";



export async function POST(req: NextRequest) {
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

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm so vendor can log in immediately
      user_metadata: { full_name: fullName, phone, business_name: businessName, role: "vendor", tenant_id: "vendor" },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
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
      return NextResponse.json({ error: vendorError.message }, { status: 500 });
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
            <p>You can now log in to the vendor dashboard using your email address and password to start listing your premium tech gadgets.</p>
            <br/>
            <p>Best regards,<br/>The Trivo Kenya Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send vendor welcome email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Vendor account created. Check your email to confirm before signing in.",
      email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      { status: 500 }
    );
  }
}
