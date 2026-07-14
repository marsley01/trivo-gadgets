import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResendClient } from "@/lib/resend";
import { rateLimit } from "@/lib/rate-limiter";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "";
    const { allowed, retryAfter } = rateLimit(`subscribe:${ip}`, 5, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("subscribers")
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") {
        return NextResponse.json({ error: "You are already subscribed." }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
    }

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
      const resend = getResendClient();
      await resend.emails.send({
        from: "Trivo Kenya <info@trivokenya.store>",
        to: email,
        subject: "Welcome to Trivo Kenya 🔥",
        html: `
          <div style="font-family: sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 40px 20px; text-align: center;">
            <h1 style="color: #2563EB; margin-bottom: 20px;">Welcome to Trivo Kenya</h1>
            <p style="font-size: 16px; color: #cccccc; line-height: 1.5; max-width: 500px; margin: 0 auto;">
              You're in. We'll hit you first when premium tech drops. Stay tuned.
            </p>
            <div style="margin-top: 40px; border-top: 1px solid #333333; padding-top: 20px; font-size: 12px; color: #666666;">
              — Trivo Kenya Team
            </div>
          </div>
        `,
      });
    }

    // Notify admin
    try {
      const { sendAdminNotification } = await import("@/lib/notifications");
      await sendAdminNotification({ type: "new_subscriber", data: { email } });
    } catch {} // ignore

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
