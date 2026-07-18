import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscription } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: "Subscription required" }, { status: 400 });
    }

    const { data: customerData } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const customer = customerData as any;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from("notification_subscriptions")
      .select("id")
      .eq("customer_id", customer.id)
      .filter("subscription->>endpoint", "eq", (subscription as Record<string, unknown>).endpoint as string)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true });
    }

    await supabase.from("notification_subscriptions").insert({
      customer_id: String(customer.id),
      subscription,
    } as any);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
