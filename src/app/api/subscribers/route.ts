import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResendClient } from "@/lib/resend";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function verifyToken(token: string, ip: string): Promise<[boolean, string[]]> {
  const payload: Record<string, string> = {
    secret: process.env.HCAPTCHA_SECRET_KEY || "",
    response: token,
    sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "a5a0d21c-04c8-4ffa-97a2-75cafa4e9672",
  };
  
  // Only add remoteip if it is a valid non-loopback IP
  if (ip && ip !== "::1" && ip !== "127.0.0.1" && !ip.startsWith("::ffff:127")) {
    payload.remoteip = ip;
  }

  const params = new URLSearchParams(payload);
  const res = await fetch("https://api.hcaptcha.com/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });
  const j = await res.json();
  return j.success ? [true, []] : [false, j["error-codes"] || []];
}

export async function POST(req: Request) {
  try {
    const { email, captchaToken } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!captchaToken) {
      return NextResponse.json({ error: "Please complete the captcha challenge" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for") || "";
    const [isCaptchaValid, captchaErrors] = await verifyToken(captchaToken, ip);

    if (!isCaptchaValid) {
      console.error("hCaptcha validation failed:", captchaErrors);
      return NextResponse.json({ error: "Captcha verification failed. Please try again." }, { status: 400 });
    }

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from("subscribers")
      .insert([{ email }]);

    if (dbError) {
      if (dbError.code === "23505") { // unique violation
        return NextResponse.json({ error: "You are already subscribed." }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to subscribe." }, { status: 500 });
    }

    // Send Welcome Email
    if (process.env.RESEND_API_KEY) {
      const resend = getResendClient();
      await resend.emails.send({
        from: "Trivo Kenya <info@trivokenya.store>", // Ensure this domain is verified in Resend
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
