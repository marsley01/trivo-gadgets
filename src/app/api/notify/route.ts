import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification, sendOrderConfirmation } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`notify:${ip}`, 20, 60000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case "order": {
        const { orderId, customerName, total, items, customerEmail } = body;
        if (!orderId || !customerName || !total) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await sendAdminNotification({ type: "new_order", data: { orderId, customerName, total, items: items?.length || 0 } });
        if (customerEmail) {
          await sendOrderConfirmation(customerEmail, orderId, items || [], total);
        }
        return NextResponse.json({ ok: true });
      }
      case "review": {
        const { productName, customerName: revCustomer, rating, text } = body;
        if (!productName || !revCustomer || !rating || !text) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await sendAdminNotification({ type: "new_review", data: { productName, customerName: revCustomer, rating, text } });
        return NextResponse.json({ ok: true });
      }
      case "subscriber": {
        const { email } = body;
        if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
        await sendAdminNotification({ type: "new_subscriber", data: { email } });
        return NextResponse.json({ ok: true });
      }
      case "vendor": {
        const { name: vName, email: vEmail, businessName } = body;
        if (!vName || !vEmail) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        await sendAdminNotification({ type: "new_vendor", data: { name: vName, email: vEmail, businessName: businessName || "" } });
        return NextResponse.json({ ok: true });
      }
      case "contact": {
        const { name: cName, email: cEmail, message } = body;
        if (!cName || !cEmail || !message) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        await sendAdminNotification({ type: "new_contact", data: { name: cName, email: cEmail, message } });
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
    }
  } catch (e) {
    console.error("Notify API error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
