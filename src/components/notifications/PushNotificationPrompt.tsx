"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PushNotificationPrompt() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unset">("unset");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setSupported(true);
      setPermission(Notification.permission === "default" ? "unset" : Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) return;
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidKey,
        });
      }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (customer) {
          const sub = JSON.parse(JSON.stringify(subscription));
          await supabase.from("notification_subscriptions").insert({
            customer_id: customer.id,
            subscription: sub,
          });
        }
      }
    }
  };

  if (!supported || permission !== "unset" || dismissed) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 max-w-xs bg-card border border-default rounded-xl p-4 shadow-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <Bell className="h-5 w-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-foreground font-medium">Stay in the loop</p>
          <p className="text-xs text-muted mt-1">Get notified about new drops and order updates.</p>
          <button
            onClick={requestPermission}
            className="mt-2 text-xs bg-accent text-black font-semibold px-3 py-1.5 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Enable Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
