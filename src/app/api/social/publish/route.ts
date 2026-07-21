import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limiter";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // 1. Rate Limiting to prevent spam
  const rawIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const ip = rawIp.split(",")[0].trim();
  const { allowed, retryAfter } = rateLimit(`social-publish:${ip}`, 10, 60000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    // 2. Authorization header verification
    const authHeader = req.headers.get("authorization");
    const webhookSecret = process.env.SOCIAL_WEBHOOK_SECRET;

    if (!webhookSecret || authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const { type, table, record } = payload;

    // We only process INSERT events
    if (type !== "INSERT") {
      return NextResponse.json({ message: "Skipped: Event type is not INSERT" });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://trivokenya.store";
    const targetWebhookUrl = process.env.SOCIAL_WEBHOOK_URL;

    if (!targetWebhookUrl) {
      console.warn("SOCIAL_WEBHOOK_URL not configured. Webhook data received but not forwarded.");
      return NextResponse.json({ success: true, message: "Webhook received but not dispatched (SOCIAL_WEBHOOK_URL missing)" });
    }

    let formattedPayload: Record<string, unknown> | null = null;

    if (table === "products" && record) {
      const { name, brand, price, slug, description } = record;
      const formattedPrice = Number(price || 0).toLocaleString();
      const productUrl = `${siteUrl}/products/${slug}`;
      const ogImageUrl = `${siteUrl}/products/${slug}/opengraph-image`;

      const text = [
        `🔥 NEW GADGET ALERT AT TRIVO KENYA!`,
        ``,
        `📦 ${name}${brand ? ` (Brand: ${brand})` : ""}`,
        `💰 Price: KES ${formattedPrice}`,
        `🚚 We deliver countrywide! Pay on Delivery via M-Pesa.`,
        ``,
        description ? `${description.slice(0, 150)}...` : "",
        ``,
        `👉 Order directly on WhatsApp or visit our shop:`,
        productUrl,
      ].join("\n");

      formattedPayload = {
        event: "product_created",
        title: name,
        brand: brand || "Trivo",
        price: Number(price || 0),
        text,
        link: productUrl,
        imageUrl: ogImageUrl,
      };
    } else if (table === "blog_posts" && record) {
      const { title, excerpt, slug } = record;
      const blogUrl = `${siteUrl}/blog/${slug}`;
      const ogImageUrl = `${siteUrl}/blog/${slug}/opengraph-image`;

      const text = [
        `📖 READ OUR LATEST TECH REVIEW!`,
        ``,
        `✨ ${title}`,
        ``,
        excerpt ? `"${excerpt}"` : "Stay ahead with premium tech insights and gadget reviews from Trivo Kenya.",
        ``,
        `👉 Read the full article and guide here:`,
        blogUrl,
      ].join("\n");

      formattedPayload = {
        event: "blog_created",
        title,
        text,
        link: blogUrl,
        imageUrl: ogImageUrl,
      };
    }

    if (!formattedPayload) {
      return NextResponse.json({ message: `Skipped: Table '${table}' does not support auto-posting` });
    }

    // Dispatch formatted payload to Make.com / Zapier webhook
    const dispatchController = new AbortController();
    const dispatchTimeout = setTimeout(() => dispatchController.abort(), 10000);

    const dispatchRes = await fetch(targetWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedPayload),
      signal: dispatchController.signal,
    });
    clearTimeout(dispatchTimeout);

    if (!dispatchRes.ok) {
      const errText = await dispatchRes.text();
      console.error(`Failed to forward webhook to target URL: ${dispatchRes.status} - ${errText}`);
      return NextResponse.json({ error: "Failed to dispatch payload to social webhook" }, { status: 502 });
    }

    return NextResponse.json({ success: true, event: formattedPayload.event, slug: record.slug });
  } catch (err: unknown) {
    console.error("Social Publish Webhook Error:", err);
    return NextResponse.json({ error: "Internal execution failure" }, { status: 500 });
  }
}
