import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sparkles, Compass, ShieldAlert, Award, ChevronRight, Smartphone, Laptop } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Trivo Kenya",
  description: "Trivo Kenya is a Kenyan phone and laptop retailer based in Nairobi. We stock genuine iPhones, Samsung, Tecno, Xiaomi, HP, Lenovo, Dell, and MacBooks at honest prices with free delivery.",
};

const pillars = [
  {
    icon: Smartphone,
    title: "Phones & Laptops Only",
    desc: "We focus on what we know best: genuine smartphones and laptops. iPhones, Samsung, Tecno, Xiaomi, Redmi, HP, Lenovo, Dell, and MacBooks. No random gadgets, no car accessories, no smart-home gimmicks.",
  },
  {
    icon: ShieldAlert,
    title: "100% Genuine Products",
    desc: "Every phone and laptop we sell is original and sourced from trusted suppliers. We check each unit before it leaves our dispatch hub so you receive exactly what you ordered.",
  },
  {
    icon: Sparkles,
    title: "Honest Prices & Fast Delivery",
    desc: "Our prices are competitive and transparent — no fake discounts. Free delivery within Nairobi in 1 to 2 days. Upcountry delivery via trusted couriers in 2 to 3 days. Pay on delivery.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-highlight/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">About</span>
          </nav>

          <h1 id="about-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            About <span className="text-accent">Trivo Kenya</span>
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-16 max-w-2xl leading-relaxed">
            We&apos;re a Nairobi-based phone and laptop retailer. We started Trivo Kenya because buying genuine tech in Kenya shouldn&apos;t require guessing, waiting weeks, or overpaying.
          </p>

          <div className="space-y-6 mb-20 leading-relaxed text-subtle text-base md:text-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why We Started Trivo</h2>
            <p>
              Too many Kenyans have had to choose between paying too much at a physical store, or gambling with unverified sellers online. We wanted a different option: a store where you can browse, ask questions, and order genuine phones and laptops with confidence.
            </p>
            <p>
              Trivo Kenya focuses on two categories — phones and laptops — because that&apos;s where most Kenyan shoppers need real help. We stock popular brands like iPhone, Samsung, Tecno, Xiaomi, HP, Lenovo, Dell, and MacBook, and we list prices clearly so you can compare.
            </p>
            <p>
              Our approach is simple: browse, chat, order. You can message us on WhatsApp to confirm availability, ask about specs, or get advice on which phone or laptop fits your budget. Then we deliver to your door and you pay on delivery.
            </p>
          </div>

          <div className="mb-20">
            <h2 className="text-2xl font-bold text-foreground mb-10 text-center">What You Can Expect From Us</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pillars.map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div 
                    key={p.title}
                    id={`pillar-${idx + 1}`}
                    className="p-8 rounded-3xl bg-card border border-subtle transition-all hover:border-default hover:bg-card-hover"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-6">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{p.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-accent/10 to-transparent border border-accent/25 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-lg">
              <span className="inline-flex items-center gap-1 text-xs text-accent font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
                <Award className="h-4 w-4" />
                Genuine Phones & Laptops
              </span>
              <h3 className="text-2xl font-extrabold text-foreground">Explore Our Store</h3>
              <p className="text-sm text-subtle leading-relaxed">
                Browse our collection of genuine smartphones and laptops. Whether you need a reliable work phone, a student laptop, or a MacBook, we&apos;ve got clear prices and honest advice.
              </p>
            </div>
            
            <Link 
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-accent text-black font-bold px-8 py-4 shrink-0 hover:scale-105 active:scale-95 transition-all text-sm"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
