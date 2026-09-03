import { getResendClient } from "./resend";
import { escapeHtml } from "./server-utils";

const ADMIN_EMAIL = "trivokenya@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://trivokenya.store";

type NotificationEvent =
  | { type: "new_order"; data: { orderId: string; customerName: string; total: number; items: number } }
  | { type: "new_review"; data: { productName: string; customerName: string; rating: number; text: string } }
  | { type: "new_subscriber"; data: { email: string } }
  | { type: "new_vendor"; data: { name: string; email: string; businessName: string } }
  | { type: "low_stock"; data: { productName: string; stock: number; productId: string } }
  | { type: "new_contact"; data: { name: string; email: string; message: string } };

export async function sendAdminNotification(event: NotificationEvent): Promise<void> {
  const resend = getResendClient();

  let subject: string;
  let html: string;

  switch (event.type) {
    case "new_order": {
      const { orderId, customerName, total, items } = event.data;
      subject = `New Order — KES ${total.toLocaleString()} from ${escapeHtml(customerName)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 16px">New Order Placed</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Customer</td><td style="padding:8px 0;font-weight:600">${escapeHtml(customerName)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Order ID</td><td style="padding:8px 0;font-weight:600">${escapeHtml(orderId)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Items</td><td style="padding:8px 0;font-weight:600">${items}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Total</td><td style="padding:8px 0;font-weight:600">KES ${total.toLocaleString()}</td></tr>
          </table>
          <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">View in Admin</a>
        </div>`;
      break;
    }
    case "new_review": {
      const { productName, customerName, rating, text } = event.data;
      const safeRating = Math.min(5, Math.max(1, Number.isFinite(rating) ? Math.trunc(rating) : 1));
      const filledStars = "★★★★★".slice(0, safeRating);
      const emptyStars = "☆☆☆☆☆".slice(0, 5 - safeRating);
      subject = `New Review — ${safeRating}★ on ${productName}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 16px">New Product Review</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Product</td><td style="padding:8px 0;font-weight:600">${productName}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Customer</td><td style="padding:8px 0;font-weight:600">${customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Rating</td><td style="padding:8px 0;font-weight:600">${filledStars}${emptyStars}</td></tr>
            <tr><td style="padding:8px 0;color:#666;vertical-align:top">Review</td><td style="padding:8px 0;font-weight:600">${text}</td></tr>
          </table>
        </div>`;
      break;
    }
    case "new_subscriber": {
      const { email } = event.data;
      subject = `New Newsletter Subscriber — ${escapeHtml(email)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 16px">New Subscriber</h2>
          <p style="font-size:14px;color:#333">${escapeHtml(email)} has subscribed to the newsletter.</p>
        </div>`;
      break;
    }
    case "new_vendor": {
      const { name, email, businessName } = event.data;
      subject = `New Vendor Registration — ${escapeHtml(name)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 16px">New Vendor Registered</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0;font-weight:600">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Business</td><td style="padding:8px 0;font-weight:600">${escapeHtml(businessName)}</td></tr>
          </table>
          <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">View in Admin</a>
        </div>`;
      break;
    }
    case "low_stock": {
      const { productName, stock } = event.data;
      subject = `Low Stock Alert — ${escapeHtml(productName)} (${stock} left)`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#dc2626;margin:0 0 16px">Low Stock Alert</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Product</td><td style="padding:8px 0;font-weight:600">${escapeHtml(productName)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Remaining Stock</td><td style="padding:8px 0;font-weight:600;color:#dc2626">${stock}</td></tr>
          </table>
          <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">View in Admin</a>
        </div>`;
      break;
    }
    case "new_contact": {
      const { name, email, message } = event.data;
      subject = `Contact Form — ${escapeHtml(name)}`;
      html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 16px">New Contact Message</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#666">Name</td><td style="padding:8px 0;font-weight:600">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0;font-weight:600">${escapeHtml(email)}</td></tr>
            <tr><td style="padding:8px 0;color:#666;vertical-align:top">Message</td><td style="padding:8px 0;font-weight:600">${escapeHtml(message)}</td></tr>
          </table>
          <a href="mailto:${escapeHtml(email)}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#16a34a;color:#fff;text-decoration:none;border-radius:8px;font-size:14px">Reply to ${escapeHtml(name)}</a>
        </div>`;
      break;
    }
  }

  try {
    await resend.emails.send({
      from: `Trivo Kenya <notifications@trivokenya.store>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    });
  } catch (e) {
    console.error("Failed to send admin notification:", e);
  }
}

export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  items: { name: string; quantity: number; price: number }[],
  total: number
): Promise<void> {
  const resend = getResendClient();

  const itemsHtml = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.quantity}x ${escapeHtml(i.name)}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">KES ${(i.price * i.quantity).toLocaleString()}</td></tr>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: `Trivo Kenya <orders@trivokenya.store>`,
      to: email,
      subject: `Order Confirmed — ${escapeHtml(orderId)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="color:#16a34a;margin:0 0 8px">Order Confirmed</h2>
          <p style="color:#666;font-size:14px">Thank you for your order! We'll process it shortly.</p>
          <p style="font-size:12px;color:#999">Order: ${escapeHtml(orderId)}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0">${itemsHtml}</table>
          <p style="font-size:16px;font-weight:600;text-align:right">Total: KES ${total.toLocaleString()}</p>
          <p style="font-size:13px;color:#666;margin-top:16px">Pay on delivery via M-PESA. Free delivery in Nairobi.</p>
        </div>`,
    });
  } catch (e) {
    console.error("Failed to send order confirmation:", e);
  }
}
