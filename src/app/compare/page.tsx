import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ChevronRight, GitCompare } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Phone & Laptop Comparisons | Trivo Kenya",
  description: "Compare popular phones and laptops in Kenya. Side-by-side specs, prices, and buying advice to help you choose the right device.",
  alternates: {
    canonical: "https://trivokenya.store/compare",
  },
};

const comparisons = [
  { title: "iPhone vs Samsung", slug: "iphone-vs-samsung", desc: "Which ecosystem suits you better — iOS or Android?" },
  { title: "iPhone 15 vs iPhone 16", slug: "iphone-15-vs-iphone-16", desc: "Is the latest iPhone worth the upgrade?" },
  { title: "Samsung vs Tecno", slug: "samsung-vs-tecno", desc: "Premium Android vs great-value budget options." },
  { title: "Redmi vs Tecno", slug: "redmi-vs-tecno", desc: "Two of the best budget phone brands in Kenya compared." },
  { title: "HP vs Lenovo", slug: "hp-vs-lenovo", desc: "Two reliable laptop brands compared for work and study." },
  { title: "Dell vs HP", slug: "dell-vs-hp", desc: "Business-class laptops from two trusted brands." },
  { title: "MacBook vs Windows Laptop", slug: "macbook-vs-windows", desc: "Which operating system and ecosystem is right for you?" },
];

export default async function ComparePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] rounded-full blur-[160px] pointer-events-none bg-accent/5" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Comparisons</span>
          </nav>

          <div className="mb-16">
            <h1 id="compare-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              Phone & Laptop <span className="text-accent">Comparisons</span>
            </h1>
            <p className="text-lg md:text-xl text-subtle max-w-2xl leading-relaxed">
              Side-by-side comparisons of popular phones and laptops available in Kenya. Compare specs, prices, and suitability before you buy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparisons.map((comp) => (
              <Link
                key={comp.slug}
                href={`/compare/${comp.slug}`}
                className="group p-6 md:p-8 rounded-2xl bg-card border border-subtle hover:border-default hover:bg-card-hover transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <GitCompare className="h-5 w-5 text-accent" />
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">{comp.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{comp.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-16 text-center rounded-3xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">Can&apos;t find the comparison you need?</h3>
            <p className="text-subtle mb-8 max-w-lg mx-auto text-sm">
              Message us on WhatsApp and we&apos;ll help you compare specific models based on your budget and needs.
            </p>
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254740610772"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-accent text-black font-bold px-8 py-4 hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(37,211,102,0.25)] text-sm"
            >
              Ask on WhatsApp
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
