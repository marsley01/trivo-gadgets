"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Sparkles, Bell } from "lucide-react";
import Image from "next/image";

export default function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're in. Keep an eye on your inbox for premium drops.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again later.");
    }
  };

  return (
    <section id="subscribe" className="py-24 container mx-auto px-4 md:px-8">
      <div className="max-w-6xl mx-auto rounded-3xl bg-[#080c16] border border-blue-500/20 p-8 md:p-16 lg:p-20 relative overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.15)]">
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] rounded-full bg-accent/15 blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">

          {/* Left Content */}
          <div className="flex-1 max-w-xl space-y-6 text-left">
            {/* VIP Sparkle Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>VIP Stock Alerts • Kenya&apos;s Premium Tech Drops</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Never Miss a Drop. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-300 to-accent">
                Get Titanium Alerts.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-400 max-w-lg leading-relaxed">
              Be the first to know the exact second fresh iPhone drops, exclusive Ecoflow power stations, and premium smart home gadgets touch down in Nairobi. Zero spam. 100% pure tech alerts.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={status === "loading" || status === "success"}
                className="flex-1 bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-full px-6 py-4 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="rounded-full bg-accent px-8 py-4 text-sm font-extrabold text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center min-w-[140px] shadow-[0_0_30px_rgba(37,211,102,0.3)] hover:shadow-[0_0_45px_rgba(37,211,102,0.5)] shrink-0"
              >
                {status === "loading" ? (
                  <span className="flex h-5 w-5 items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                  </span>
                ) : status === "success" ? (
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Subscribed</span>
                ) : (
                  <span className="flex items-center gap-1.5"><Bell className="h-4 w-4" /> Notify Me</span>
                )}
              </button>
            </form>

            {status === "success" && (
              <div className="flex items-center gap-2 text-accent bg-accent/10 border border-accent/20 px-4 py-3 rounded-2xl text-sm font-medium w-fit backdrop-blur-md">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl text-sm font-medium w-fit backdrop-blur-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {message}
              </div>
            )}
          </div>

          {/* Right Floating Gadget Showcase (Titanium Blue iPhone Pro) */}
          <div className="flex-1 w-full max-w-md relative perspective-1000 mt-8 lg:mt-0">
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-tr from-blue-950/40 via-black/40 to-blue-500/10 backdrop-blur-3xl shadow-2xl transform-gpu transition-transform duration-700 hover:rotate-y-12 hover:rotate-x-12 p-6 flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop"
                alt="Titanium Blue iPhone 17 Pro Max"
                fill
                className="object-cover transition-transform duration-700 hover:scale-110"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Inner glassmorphism glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/10 pointer-events-none" />
            </div>

            {/* Decorative floating elements */}
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-accent/20 rounded-full blur-[35px] animate-pulse pointer-events-none" />
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-500/30 rounded-full blur-[40px] animate-pulse pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}