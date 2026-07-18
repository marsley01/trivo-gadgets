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

    const { title, body, url } = await req.json();
    const { data: customerData } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const customer = customerData as any;

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const { data: subscriptions } = await supabase
      .from("notification_subscriptions")
      .select("subscription")
      .eq("customer_id", String(customer.id));

    if (!subscriptions?.length) {
      return NextResponse.json({ message: "No subscriptions" });
    }

    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPrivateKey) {
      return NextResponse.json({ error: "VAPID not configured" }, { status: 500 });
    }

    const webpush = await import("web-push");
    const wp = webpush.default || webpush;
    wp.setVapidDetails(
      "mailto:info@trivokenya.store",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      vapidPrivateKey
    );

    for (const sub of subscriptions) {
      try {
        const pushSub = sub.subscription as { endpoint: string; keys: { p256dh: string; auth: string } };
        await wp.sendNotification(
          pushSub,
          JSON.stringify({
            title: title || "Trivo Kenya",
            body: body || "You have a new update!",
            url: url || "/",
          })
        );
      } catch {
        const s = sub.subscription as Record<string, unknown>;
        await supabase
          .from("notification_subscriptions")
          .delete()
          .eq("customer_id", customer.id)
          .filter("subscription->>endpoint", "eq", String(s.endpoint));
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
