import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShoppingBag, MessageSquare, Truck, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: "How to Order | Trivo Kenya",
  description: "Ordering your tech from Trivo Kenya is super easy. Choose between a quick WhatsApp chat or our standard online checkout.",
};

const steps = [
  {
    icon: ShoppingBag,
    title: "1. Find What You Need",
    desc: "Browse through our collection of audio gear, smart home gadgets, fast chargers, and car accessories. We keep it simple with only the best items in stock.",
  },
  {
    icon: MessageSquare,
    title: "2. Order via WhatsApp or Cart",
    desc: "Want it fast? Just tap the green WhatsApp button on any product page. It opens a chat directly with our team, showing the exact item and price so we can assist you right away.",
  },
  {
    icon: Truck,
    title: "3. Delivery Setup",
    desc: "Let us know your location. If you're in Nairobi, we arrange free hand delivery within 1 to 2 days. For upcountry orders, we ship securely via trusted couriers like Easy Coach, G4S, or Fargo Courier (takes about 2 to 3 days).",
  },
  {
    icon: CheckCircle2,
    title: "4. Check Your Item & Pay",
    desc: "For Nairobi orders, you get free delivery and can inspect your item upon delivery before paying via M-PESA Till or cash. Simple, safe, and absolutely no stress.",
  },
];

export default function HowToOrderPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-highlight/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">How to Order</span>
          </nav>

          <h1 id="how-to-order-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            How to <span className="text-accent">Order</span>
          </h1>
          
          <p className="text-lg md:text-xl text-subtle mb-16 max-w-2xl leading-relaxed">
            We believe buying genuine tech shouldn&apos;t feel like a chore. At Trivo Kenya, you can use our standard website checkout or just chat with us on WhatsApp to get your order moving. Here&apos;s how it works:
          </p>

          <div className="space-y-8 mb-16">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div 
                  key={s.title} 
                  id={`step-${idx + 1}`}
                  className="group flex flex-col md:flex-row gap-6 p-8 rounded-2xl bg-card border border-subtle backdrop-blur-xl transition-all hover:border-default hover:bg-card-hover"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/10 border border-accent/20 text-accent group-hover:scale-105 transition-transform duration-300">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-3">{s.title}</h2>
                    <p className="text-subtle leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-surface/30 border border-default backdrop-blur-md">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                WhatsApp Order
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Skip the forms entirely. Click the WhatsApp button on any item, chat with our team, confirm your location, and let us know when you&apos;d like it delivered.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold text-accent hover:underline gap-1"
              >
                Chat with us now <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="p-8 rounded-2xl bg-surface/30 border border-default backdrop-blur-md">
              <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Website Checkout
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Prefer adding items to a cart? Just add what you want, enter your delivery details at checkout, and we&apos;ll call or message you to confirm delivery.
              </p>
              <Link href="/" className="inline-flex items-center text-sm font-bold text-accent hover:underline gap-1">
                Browse Store <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="text-center rounded-3xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">Have questions about a product?</h3>
            <p className="text-subtle mb-8 max-w-lg mx-auto text-sm">
              We&apos;re online and happy to help you check specs, compare models, or arrange a specific delivery time.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-accent text-black font-bold px-8 py-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(37,211,102,0.25)] text-sm"
            >
              <MessageSquare className="h-5 w-5" />
              Ask us on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
