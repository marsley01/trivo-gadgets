import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Sparkles, Compass, ShieldAlert, Award, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Trivo Kenya",
  description: "Trivo Kenya is your go-to store for genuine tech gadgets in Nairobi. We hand-pick the best audio gear, smart home tech, and chargers, delivered to your door.",
};

const pillars = [
  {
    icon: Compass,
    title: "Carefully Selected",
    desc: "We don't list thousands of random products. We test and select only the best earbuds, fast chargers, smart home devices, and car accessories so you don't have to guess what works.",
  },
  {
    icon: ShieldAlert,
    title: "100% Genuine Tech",
    desc: "We know how frustrating it is to buy a gadget only to realize it's a generic copy. At Trivo, we only sell original, brand-new items imported directly from trusted manufacturers.",
  },
  {
    icon: Sparkles,
    title: "Fast Delivery & M-PESA on Delivery",
    desc: "No long waits and no delivery fee. If you're in Nairobi, our rider brings your order to your doorstep for free within 1 to 2 days. You can open the package and check your item before paying via M-PESA.",
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
            We're a team of tech lovers based in Nairobi. We started Trivo Kenya to make it easy for Kenyans to buy genuine, high-quality gadgets without the usual stress or waiting for weeks.
          </p>

          <div className="space-y-6 mb-20 leading-relaxed text-subtle text-base md:text-lg">
            <h2 className="text-2xl font-bold text-foreground mb-4">Why We Started Trivo</h2>
            <p>
              We used to get frustrated trying to find reliable tech accessories in Nairobi. You either had to order from abroad and wait a month for shipping, or take a gamble on local shops where fakes and generic copies are common.
            </p>
            <p>
              Trivo Kenya was started to solve that exact problem. We wanted an online store where you can be 100% sure you're buying original items, with delivery that takes a day or two instead of weeks.
            </p>
            <p>
              Our approach is simple: **&quot;chat, order, delivered.&quot;** You can chat with us directly on WhatsApp, ask questions about specs, get honest recommendations, and pay safely when your item arrives.
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
                Guaranteed Genuine
              </span>
              <h3 className="text-2xl font-extrabold text-foreground">Explore Our Store</h3>
              <p className="text-sm text-subtle leading-relaxed">
                Take a look at our collection. Whether you need reliable wireless earbuds, a fast charger that won't ruin your battery, or a smart gadget for your home, we've got you covered.
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
