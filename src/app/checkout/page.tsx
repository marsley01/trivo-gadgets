"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import { generateCartWhatsAppLink } from "@/lib/config";
import { ChevronRight, ShoppingBag, MapPin, Phone, User, MessageCircle, CheckCircle, Sparkles, Heart } from "lucide-react";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [placed, setPlaced] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user?.id) {
        const { data: customer } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (customer) setCustomerId(customer.id);
      }
    });
  }, []);

  const showPopup = () => { setPlaced(true); setTimeout(() => setPopupVisible(true), 100); };

  const handlePlaceOrder = async () => {
    const checkoutItems = items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }));
    const note = orderNote ? `\n\n*Note:* ${orderNote}` : "";
    const customerInfo = `\n\n*Customer:* ${name}\n*Phone:* ${phone}\n*Location:* ${location}`;
    const fullMessage = `Hi Trivo! I want to order:\n\n${checkoutItems.map((i) => `- ${i.name} x${i.quantity} @ KES ${i.price.toLocaleString()}`).join("\n")}\n\nTotal: KES ${cartTotal.toLocaleString()}\n\nPlease confirm availability.${customerInfo}${note}`;
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254757512769";
    const fullLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;

    window.open(fullLink, "_blank");

    let orderId: string | null = null;

    if (customerId) {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("orders").insert({
          customer_id: customerId,
          items: checkoutItems,
          total: cartTotal,
          status: "pending",
          whatsapp_message: fullMessage,
        }).select("id").single();
        orderId = data?.id || null;
      } catch (err) {
        console.error("Failed to save order:", err);
      }
    }

    // Notify admin in background
    const { data: { user } } = await createClient().auth.getUser();
    const notifyController = new AbortController();
    setTimeout(() => notifyController.abort(), 5000);
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "order",
        orderId: orderId || fullMessage.slice(0, 20),
        customerName: name,
        total: cartTotal,
        items: checkoutItems,
        customerEmail: user?.email || null,
      }),
      signal: notifyController.signal,
    }).catch(() => {});

    clearCart();
    showPopup();
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Checkout</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-foreground mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Customer Details Form */}
            <div className="lg:col-span-3 space-y-6">
              <div className="rounded-2xl border border-default bg-card p-6 space-y-5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Delivery Details
                </h2>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full bg-background border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      required
                      className="w-full bg-background border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Delivery Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Westlands, Nairobi"
                      required
                      className="w-full bg-background border border-default rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">Order Note (optional)</label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="Any specific delivery time or instructions?"
                    rows={2}
                    className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-default bg-card p-6 sticky top-24 space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-accent" />
                  Order Summary
                </h2>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 rounded-lg overflow-hidden bg-surface">
                        <Image
                          src={item.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-xs font-semibold text-foreground shrink-0">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-subtle pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">KES {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery (Nairobi)</span>
                    <span className="font-semibold text-green-500">Free</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-subtle pt-2 mt-2">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="font-bold text-lg text-foreground">KES {cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={!name || !phone || !location || items.length === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                >
                  <MessageCircle className="h-5 w-5" />
                  Place Order via WhatsApp
                </button>

                <p className="text-[11px] text-muted-foreground text-center">
                  You&apos;ll be redirected to WhatsApp to confirm your order. Our team will respond within minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Thank You Popup */}
      {placed && popupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="w-full max-w-md rounded-3xl border border-default bg-card p-8 shadow-2xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500 delay-150">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground mb-3">Thank You! 🎉</h2>
            <p className="text-muted text-sm mb-2 leading-relaxed">
              Your order has been sent to our team via WhatsApp. We&apos;ll confirm it within minutes.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6 bg-surface/30 rounded-xl px-4 py-3">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Keep an eye on your WhatsApp for a quick response</span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                onClick={() => setPlaced(false)}
                className="w-full rounded-full bg-accent text-black py-3.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Continue Shopping
              </Link>
              <Link
                href="/account"
                className="w-full rounded-full border border-default text-foreground py-3.5 text-sm font-medium transition-all hover:bg-surface active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <Heart className="h-4 w-4" />
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
