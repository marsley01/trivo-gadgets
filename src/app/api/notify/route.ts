import { NextRequest, NextResponse } from "next/server";
import { sendAdminNotification, sendOrderConfirmation } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limiter";

// Field length limits to prevent payload bloat / injection attacks
const LIMITS = {
  name: 120,
  email: 254,
  message: 2000,
  orderId: 100,
  productName: 200,
  businessName: 200,
  text: 1000,
};

function truncate(value: unknown, max: number): string {
  return String(value ?? "").slice(0, max);
}

export async function POST(request: NextRequest) {
  const rawIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const ip = rawIp.split(",")[0].trim();
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
        const safeOrderId = truncate(orderId, LIMITS.orderId);
        const safeName = truncate(customerName, LIMITS.name);
        const safeTotal = Number(total) || 0;
        await sendAdminNotification({ type: "new_order", data: { orderId: safeOrderId, customerName: safeName, total: safeTotal, items: Array.isArray(items) ? items.length : 0 } });
        if (customerEmail && typeof customerEmail === "string") {
          await sendOrderConfirmation(truncate(customerEmail, LIMITS.email), safeOrderId, items || [], safeTotal);
        }
        return NextResponse.json({ ok: true });
      }
      case "review": {
        const { productName, customerName: revCustomer, rating, text } = body;
        if (!productName || !revCustomer || !rating || !text) {
          return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        await sendAdminNotification({
          type: "new_review",
          data: {
            productName: truncate(productName, LIMITS.productName),
            customerName: truncate(revCustomer, LIMITS.name),
            rating: Math.min(5, Math.max(1, Number(rating) || 1)),
            text: truncate(text, LIMITS.text),
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "subscriber": {
        const { email } = body;
        if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
        await sendAdminNotification({ type: "new_subscriber", data: { email: truncate(email, LIMITS.email) } });
        return NextResponse.json({ ok: true });
      }
      case "vendor": {
        const { name: vName, email: vEmail, businessName } = body;
        if (!vName || !vEmail) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        await sendAdminNotification({
          type: "new_vendor",
          data: {
            name: truncate(vName, LIMITS.name),
            email: truncate(vEmail, LIMITS.email),
            businessName: truncate(businessName || "", LIMITS.businessName),
          },
        });
        return NextResponse.json({ ok: true });
      }
      case "contact": {
        const { name: cName, email: cEmail, message } = body;
        if (!cName || !cEmail || !message) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        await sendAdminNotification({
          type: "new_contact",
          data: {
            name: truncate(cName, LIMITS.name),
            email: truncate(cEmail, LIMITS.email),
            message: truncate(message, LIMITS.message),
          },
        });
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
