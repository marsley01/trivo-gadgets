import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { notFound } from "next/navigation";
import { CheckCircle } from "lucide-react";
import PrintButton from "@/components/receipt/PrintButton";
import { WHATSAPP_NUMBER } from "@/lib/config";

type AdminOrder = Database["public"]["Tables"]["admin_orders"]["Row"];

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function getOrder(receiptNumber: string): Promise<AdminOrder | null> {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("admin_orders")
    .select("*")
    .eq("receipt_number", receiptNumber)
    .single();

  return data;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ receipt_number: string }>;
}) {
  const { receipt_number } = await params;
  const order = await getOrder(receipt_number);

  if (!order) {
    notFound();
  }

  const items = order.items as Array<{
    product_id?: string;
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px]" id="receipt">
        <div className="bg-[#111111] rounded-2xl p-8 space-y-6 print-card">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              TRIVO <span className="text-[#2563EB]">KENYA</span>
            </h1>
            <div className="w-16 h-0.5 bg-[#2563EB] mx-auto rounded-full" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-500 font-medium">
              Kenya
            </p>
          </div>

          {/* Payment Confirmed */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-green-500 font-semibold text-sm">Payment Confirmed</p>
          </div>

          {/* Receipt Number */}
          <div className="text-center">
            <p className="font-mono text-sm text-neutral-300 tracking-wider">
              {order.receipt_number}
            </p>
            <p className="text-xs text-neutral-600 mt-1">{formatDate(order.created_at)}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-800" />

          {/* Customer */}
          <div className="space-y-1.5">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Billed to:</p>
            <p className="text-sm text-white font-medium">{order.customer_name}</p>
            <p className="text-sm text-neutral-400">{order.customer_phone}</p>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-800" />

          {/* Items Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-neutral-500">
                <th className="text-left pb-2 font-medium">Item</th>
                <th className="text-center pb-2 font-medium">Qty</th>
                <th className="text-right pb-2 font-medium">Price</th>
                <th className="text-right pb-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-t border-neutral-800/50">
                  <td className="py-2.5 text-white">{item.product_name}</td>
                  <td className="py-2.5 text-center text-neutral-400">{item.quantity}</td>
                  <td className="py-2.5 text-right text-neutral-400">KES {item.unit_price.toLocaleString()}</td>
                  <td className="py-2.5 text-right text-white">KES {(item.quantity * item.unit_price).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="space-y-1.5 border-t border-neutral-800 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Subtotal</span>
              <span className="text-white">KES {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-400">Delivery</span>
              <span className="text-white">{order.delivery_fee === 0 ? "Free" : `KES ${order.delivery_fee.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between text-base font-bold border-t border-neutral-700 pt-3">
              <span className="text-white">TOTAL</span>
              <span className="text-[#2563EB]">KES {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-800" />

          {/* Payment */}
          <div className="space-y-2">
            <p className="text-xs text-neutral-500">Paid via M-Pesa</p>
            <p className="font-mono text-sm text-neutral-300 tracking-wider">{order.mpesa_reference}</p>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              <span className="text-[11px] text-green-500 font-medium">Confirmed</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-800" />

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-400">Thank you for shopping with Trivo Kenya</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2563EB] hover:underline block"
            >
              Questions? WhatsApp us: +254757512769
            </a>
            <p className="text-[10px] text-neutral-600">Keep this receipt for your records</p>
          </div>

          <PrintButton />
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          #receipt { max-width: 100% !important; }
          .print-card {
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            padding: 20px !important;
          }
          .print-card h1, .print-card p, .print-card td, .print-card th, .print-card span, .print-card div {
            color: black !important;
          }
          .print-card .text-green-500 { color: #16a34a !important; }
          .print-card .text-\\[#2563EB\\] { color: #2563EB !important; }
          .print-card .text-neutral-300, .print-card .text-neutral-400, .print-card .text-neutral-500, .print-card .text-neutral-600 {
            color: #525252 !important;
          }
          .print-card .border-neutral-800, .print-card .border-neutral-800\\/50, .print-card .border-neutral-700 {
            border-color: #e5e5e5 !important;
          }
          .print-card .bg-\\[#111111\\] { background: white !important; }
          .print-card .bg-green-500\\/20 { background: #dcfce7 !important; }
          .print-card a { color: #2563EB !important; }
        }
      `}</style>
    </div>
  );
}
