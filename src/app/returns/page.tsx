import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, RefreshCcw, HelpCircle, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { WHATSAPP_NUMBER } from "@/lib/config";

export const metadata: Metadata = {
  title: "Returns & Exchanges | Trivo Kenya",
  description: "Shop tech with confidence. Learn about our easy 7-day return policy for defective gadgets and how to arrange an exchange via WhatsApp.",
};

const rules = [
  "Let us know within 7 days of receiving your item.",
  "Keep the original box and packaging intact.",
  "Include all accessories, charging cables, and manuals when returning.",
  "Note: Damage caused by drops, water spills, or power surges isn't covered.",
];

export default function ReturnsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-[450px] h-[450px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Returns</span>
          </nav>

          <h1 id="returns-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Returns & <span className="text-accent">Exchanges</span>
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-16 max-w-2xl leading-relaxed">
            We stand behind the quality of every gadget we sell. If an item you buy from us has a factory defect, we make the return or exchange process straightforward and easy.
          </p>

          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/20 backdrop-blur-md mb-16 flex flex-col md:flex-row items-center gap-8">
            <div className="h-20 w-20 shrink-0 rounded-3xl bg-accent/15 border border-accent/25 flex items-center justify-center text-accent">
              <RefreshCcw className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-3">7-Day Replacement Warranty</h2>
              <p className="text-subtle leading-relaxed mb-0">
                Every gadget from Trivo Kenya comes with a 7-day replacement warranty starting from the delivery date. If your item has a manufacturer defect or isn&apos;t working as it should, we&apos;ll replace it with a brand new unit at no extra cost.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent" />
                Return Checklist
              </h3>
              
              <ul className="space-y-4">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-subtle leading-relaxed">
                    <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-card border border-subtle">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-accent" />
                How to Arrange a Return
              </h3>
              
              <ol className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <li>
                  <strong>1. Take a quick video:</strong> Record a short video or snap a picture showing the issue with the gadget.
                </li>
                <li>
                  <strong>2. Message us on WhatsApp:</strong> Send the video and your order details to our team on WhatsApp.
                </li>
                <li>
                  <strong>3. Get your replacement:</strong> We&apos;ll verify the issue and arrange a quick exchange (via our rider in Nairobi or courier for upcountry orders).
                </li>
              </ol>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-surface/30 border border-default mb-16 text-sm text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground block mb-2">⚠️ A quick note on returns</span>
            We don&apos;t offer returns or exchanges if you simply change your mind about an item (for example, deciding you want a different color after unboxing). If you&apos;re unsure about a product before buying, feel free to chat with us on WhatsApp—we&apos;re happy to answer any questions or send real product photos to help you decide.
          </div>

          <div className="text-center rounded-3xl bg-gradient-to-br from-accent/15 to-transparent border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl font-bold text-foreground mb-2">Need help with a product?</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Our support team is available on WhatsApp to help you troubleshoot setup issues or start an exchange.
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hey%20Trivo!%20I%20need%20assistance%20with%20a%20product%20I%20recently%20purchased.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-accent text-black font-bold px-8 py-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(37,211,102,0.25)] text-sm"
            >
              Chat with Support
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
