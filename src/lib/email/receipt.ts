"use server";

import { Resend } from "resend";
import { WHATSAPP_NUMBER } from "@/lib/config";


type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

export async function sendReceiptEmail(params: {
  to: string;
  receiptNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  mpesaReference: string;
}) {
  const { to, receiptNumber, customerName, items, subtotal, deliveryFee, total, mpesaReference } = params;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px 0; color: #d4d4d4; border-bottom: 1px solid #262626;">${item.product_name}</td>
        <td style="padding: 8px 0; text-align: center; color: #737373; border-bottom: 1px solid #262626;">${item.quantity}</td>
        <td style="padding: 8px 0; text-align: right; color: #d4d4d4; border-bottom: 1px solid #262626;">KES ${item.unit_price.toLocaleString()}</td>
        <td style="padding: 8px 0; text-align: right; color: #ffffff; border-bottom: 1px solid #262626;">KES ${(item.quantity * item.unit_price).toLocaleString()}</td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color: #111111; border-radius: 16px; padding: 32px;">
              <!-- Logo -->
              <tr>
                <td align="center" style="padding-bottom: 16px;">
                  <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.5px;">
                    TRIVO <span style="color: #2563EB;">KENYA</span>
                  </h1>
                  <div style="width: 64px; height: 2px; background-color: #2563EB; margin: 8px auto; border-radius: 2px;"></div>
                  <p style="font-size: 10px; letter-spacing: 0.2em; color: #737373; text-transform: uppercase; margin: 0;">Kenya</p>
                </td>
              </tr>

              <!-- Header -->
              <tr>
                <td align="center" style="padding: 16px 0;">
                  <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background-color: rgba(34, 197, 94, 0.2); margin-bottom: 8px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <p style="color: #22c55e; font-size: 14px; font-weight: 600; margin: 0;">Payment Confirmed</p>
                </td>
              </tr>

              <!-- Receipt Number -->
              <tr>
                <td align="center" style="padding-bottom: 16px;">
                  <p style="font-family: 'Courier New', monospace; font-size: 14px; color: #d4d4d4; letter-spacing: 1px; margin: 0;">${receiptNumber}</p>
                </td>
              </tr>

              <tr><td style="height: 1px; background-color: #262626;"></td></tr>

              <!-- Customer -->
              <tr>
                <td style="padding: 16px 0;">
                  <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737373; margin: 0 0 6px 0; font-weight: 500;">Billed to:</p>
                  <p style="font-size: 14px; color: #ffffff; margin: 0; font-weight: 500;">${customerName}</p>
                </td>
              </tr>

              <tr><td style="height: 1px; background-color: #262626;"></td></tr>

              <!-- Items Table -->
              <tr>
                <td style="padding: 16px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <thead>
                      <tr>
                        <th style="text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737373; padding-bottom: 8px; font-weight: 500;">Item</th>
                        <th style="text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737373; padding-bottom: 8px; font-weight: 500;">Qty</th>
                        <th style="text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737373; padding-bottom: 8px; font-weight: 500;">Price</th>
                        <th style="text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #737373; padding-bottom: 8px; font-weight: 500;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Totals -->
              <tr><td style="height: 1px; background-color: #262626;"></td></tr>
              <tr>
                <td style="padding: 16px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 14px; color: #737373; padding: 4px 0;">Subtotal</td>
                      <td style="font-size: 14px; color: #ffffff; text-align: right; padding: 4px 0;">KES ${subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td style="font-size: 14px; color: #737373; padding: 4px 0;">Delivery</td>
                      <td style="font-size: 14px; color: #ffffff; text-align: right; padding: 4px 0;">${deliveryFee === 0 ? "Free" : `KES ${deliveryFee.toLocaleString()}`}</td>
                    </tr>
                  </table>
                  <div style="height: 1px; background-color: #404040; margin: 8px 0;"></div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size: 16px; font-weight: 700; color: #ffffff;">TOTAL</td>
                      <td style="font-size: 16px; font-weight: 700; color: #2563EB; text-align: right;">KES ${total.toLocaleString()}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <tr><td style="height: 1px; background-color: #262626;"></td></tr>

              <!-- Payment -->
              <tr>
                <td style="padding: 16px 0;">
                  <p style="font-size: 12px; color: #737373; margin: 0 0 4px 0;">Paid via M-Pesa</p>
                  <p style="font-family: 'Courier New', monospace; font-size: 14px; color: #d4d4d4; letter-spacing: 1px; margin: 0 0 8px 0;">${mpesaReference}</p>
                  <table cellpadding="0" cellspacing="0" style="background-color: rgba(34, 197, 94, 0.2); border-radius: 999px; padding: 2px;">
                    <tr>
                      <td style="padding: 4px 12px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 6px; height: 6px; border-radius: 50%; background-color: #22c55e; vertical-align: middle;"></td>
                            <td style="padding-left: 6px; font-size: 11px; color: #22c55e; font-weight: 500;">Confirmed</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Receipt Link -->
              <tr>
                <td align="center" style="padding: 16px 0;">
                  <a href="https://trivokenya.store/receipt/${receiptNumber}" style="display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                    View Receipt Online
                  </a>
                </td>
              </tr>

              <tr><td style="height: 1px; background-color: #262626;"></td></tr>

              <!-- Footer -->
              <tr>
                <td align="center" style="padding: 16px 0 0 0;">
                  <p style="font-size: 14px; color: #737373; margin: 0 0 8px 0;">Thank you for shopping with Trivo Kenya</p>
                  <a href="https://wa.me/${WHATSAPP_NUMBER}" style="font-size: 14px; color: #2563EB; text-decoration: underline; margin: 0;">Questions? WhatsApp us: +${WHATSAPP_NUMBER}</a>
                  <p style="font-size: 10px; color: #525252; margin: 8px 0 0 0;">Keep this receipt for your records</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Trivo Kenya <receipts@trivokenya.store>",
    to,
    subject: `Your Trivo Kenya Receipt – ${receiptNumber}`,
    html,
  });

  if (error) throw new Error(`Failed to send email: ${error.message}`);
}
