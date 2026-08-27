import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Truck, Clock, ShieldCheck, MapPin, ChevronRight, CornerDownRight } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: "Delivery Information | Trivo Kenya",
  description: "Free delivery in Nairobi within 1 to 2 days. Fast, secure upcountry shipping across Kenya in 2 to 3 days. Pay safely on delivery in Nairobi.",
};

const deliveryZones = [
  {
    name: "Nairobi & Surrounding Suburbs",
    timeline: "1 to 2 Days Delivery",
    rate: "Free",
    details: "Free delivery straight to your doorstep or office within 1 to 2 days. Covers the entire Nairobi metropolitan area, including Westlands, Kilimani, Karen, Lang'ata, Thika Road, and surrounding suburbs.",
    highlight: true,
  },
  {
    name: "Rest of Kenya (Upcountry)",
    timeline: "2 to 3 Days Delivery",
    rate: "KES 500",
    details: "We ship nationwide using reliable couriers like Fargo Courier, G4S, Easy Coach, or Guardian. Your package arrives in 2 to 3 days, whether you're in Mombasa, Kisumu, Nakuru, Eldoret, or anywhere else in Kenya.",
    highlight: false,
  },
];

export default function DeliveryPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] bg-highlight/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Delivery</span>
          </nav>

          <h1 id="delivery-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Delivery <span className="text-accent">Information</span>
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-16 max-w-2xl leading-relaxed">
            When you buy new tech, you want it delivered fast. Here&apos;s how we handle deliveries across Kenya to ensure your items get to you safely and on time.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {deliveryZones.map((zone, idx) => (
              <div 
                key={zone.name}
                id={`delivery-zone-${idx + 1}`}
                className={`p-8 rounded-3xl border backdrop-blur-xl relative overflow-hidden transition-all hover:-translate-y-1 ${
                  zone.highlight 
                    ? "bg-gradient-to-br from-accent/10 to-transparent border-accent/30 shadow-[0_4px_30px_rgba(37,211,102,0.05)]" 
                    : "bg-card border-subtle hover:border-default"
                }`}
              >
                {zone.highlight && (
                  <div className="absolute top-4 right-4 rounded-full bg-accent/20 border border-accent/30 text-accent px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-foreground mb-1">{zone.name}</h3>
                <div className="text-accent font-extrabold text-lg mb-4 flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5" />
                  {zone.timeline}
                </div>
                
                <div className="flex items-baseline gap-2 mb-6 border-b border-subtle pb-4">
                  <span className="text-3xl font-extrabold text-foreground">{zone.rate}</span>
                  <span className="text-xs text-muted-foreground">{zone.rate === "Free" ? "free delivery in Nairobi" : "flat shipping fee"}</span>
                </div>

                <p className="text-sm text-subtle leading-relaxed">{zone.details}</p>
              </div>
            ))}
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-card border border-subtle mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-8 text-center md:text-left">
              How We Ensure a Smooth Delivery
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">100% Genuine Tech</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We only sell original, brand-new items in their original retail packaging. No fakes or generic copies.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">WhatsApp Updates</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We keep in touch via WhatsApp to confirm your delivery details and make sure the timing works for your schedule.
                </p>
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">Pay on Delivery (Nairobi)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  If you&apos;re in Nairobi, you can inspect your item first before paying via M-PESA. You only pay when you&apos;re completely satisfied.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h3 className="text-xl font-bold text-foreground mb-6">Delivery Details & Cut-off Times</h3>
            <div className="space-y-4 text-sm text-subtle leading-relaxed">
              <div className="flex gap-2 items-start">
                <CornerDownRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>
                  <strong>Same-Day Dispatch:</strong> Orders placed before 3:00 PM are dispatched the same day. Orders placed later are queued for the next morning.
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <CornerDownRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>
                  <strong>Upcountry Tracking:</strong> For orders outside Nairobi, we share the courier booking receipt or tracking number with you on WhatsApp as soon as it&apos;s sent.
                </span>
              </div>
              <div className="flex gap-2 items-start">
                <CornerDownRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span>
                  <strong>Payment Methods:</strong> We accept M-PESA Till Number, Cash on Delivery (Nairobi), or Bank Transfer.
                </span>
              </div>
            </div>
          </div>

          <div className="text-center rounded-3xl bg-surface/30 border border-default p-8 md:p-12 backdrop-blur-md">
            <h3 className="text-xl font-bold text-foreground mb-2">Need Same-Day Delivery in Nairobi?</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              If you&apos;re in a rush and need an item delivered today, hit us up on WhatsApp. We can often arrange express same-day delivery depending on the time of day.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hey%20Trivo!%20I'd%20like%20to%20request%20express%20same-day%20delivery%20in%20Nairobi.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:underline"
            >
              Chat with us on WhatsApp <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
