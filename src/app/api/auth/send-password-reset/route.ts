import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`password-reset:${ip}`, 2, 60000);
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
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/auth/update-password`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const resetLink = data?.properties?.action_link;
    if (!resetLink) {
      return NextResponse.json({ error: "Failed to generate reset link." }, { status: 500 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Trivo Kenya <receipts@trivokenya.store>",
      to: email,
      subject: "Reset Your Trivo Kenya Password",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <img src="https://trivokenya.store/logo-transparent.svg" alt="Trivo Kenya" style="height: 48px; width: auto;" />
          </div>
          <h1 style="font-size: 24px; font-weight: 700; color: #111; margin: 0 0 8px;">Reset your password</h1>
          <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your Trivo Kenya account password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetLink}" style="display: inline-block; background: #111; color: #fff; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 0 0 8px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #888; word-break: break-all; margin: 0 0 24px; background: #f5f5f5; padding: 12px; border-radius: 6px;">
            ${resetLink}
          </p>
          <p style="font-size: 13px; color: #888; line-height: 1.5; margin: 0 0 8px;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center; margin: 0;">
            Trivo Kenya &bull; Nairobi, Kenya
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      return NextResponse.json({ error: "Failed to send reset email." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Password reset error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
