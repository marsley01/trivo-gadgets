import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BookOpen, ChevronRight, Smartphone, Laptop } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Buying Guides | Trivo Kenya",
  description: "Honest phone and laptop buying guides for Kenyan shoppers. Find the best phones and laptops for your budget and needs at Trivo Kenya.",
  alternates: {
    canonical: "https://trivokenya.store/guides",
  },
};

const phoneGuides = [
  { title: "Best Phones to Buy in Kenya", slug: "best-phones-kenya", desc: "Our top phone picks across different budgets and use cases." },
  { title: "Best Phones Under KSh 20,000", slug: "best-phones-under-20000", desc: "Great-value smartphones that won't break the bank." },
  { title: "Best Phones Under KSh 30,000", slug: "best-phones-under-30000", desc: "Solid mid-range phones with excellent features." },
  { title: "Best Phones Under KSh 50,000", slug: "best-phones-under-50000", desc: "Upper mid-range and flagship-killer smartphones." },
  { title: "iPhone Buying Guide Kenya", slug: "iphone-buying-guide-kenya", desc: "Everything you need to know before buying an iPhone in Kenya." },
  { title: "What to Check Before Buying a Used iPhone", slug: "used-iphone-checklist", desc: "Avoid common pitfalls when buying a second-hand iPhone." },
];

const laptopGuides = [
  { title: "Best Laptops for Students in Kenya", slug: "best-student-laptops-kenya", desc: "Affordable, reliable laptops for research, assignments, and online classes." },
  { title: "Best Laptops Under KSh 50,000", slug: "best-laptops-under-50000", desc: "Budget-friendly laptops that still get the job done." },
  { title: "Best Laptops for Programming in Kenya", slug: "best-laptops-programming-kenya", desc: "Powerful machines for coding, development, and multitasking." },
  { title: "Best Laptops for Business in Kenya", slug: "best-business-laptops-kenya", desc: "Reliable, secure laptops for professionals and entrepreneurs." },
  { title: "Best Gaming Laptops in Kenya", slug: "best-gaming-laptops-kenya", desc: "Gaming-capable laptops with dedicated graphics." },
  { title: "How to Choose the Right Laptop in Kenya", slug: "how-to-choose-laptop-kenya", desc: "Understand RAM, storage, processors, and displays before you buy." },
  { title: "Laptop RAM and Storage Explained", slug: "laptop-ram-storage-explained", desc: "How much RAM and storage do you actually need?" },
  { title: "MacBook vs Windows Laptop: Which Should You Buy?", slug: "macbook-vs-windows-kenya", desc: "Honest comparison to help you pick the right ecosystem." },
];

export default async function GuidesPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] rounded-full blur-[160px] pointer-events-none bg-accent/5" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-5xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Buying Guides</span>
          </nav>

          <div className="mb-16">
            <h1 id="guides-title" className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              Phone & Laptop <span className="text-accent">Buying Guides</span>
            </h1>
            <p className="text-lg md:text-xl text-subtle max-w-2xl leading-relaxed">
              Honest advice to help you choose the right phone or laptop in Kenya. No jargon, no sponsored rankings — just practical guidance based on real usage.
            </p>
          </div>

          {/* Phone Guides */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                <Smartphone className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Phone Guides</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {phoneGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group p-6 rounded-2xl bg-card border border-subtle hover:border-default hover:bg-card-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors mb-1">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Laptop Guides */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                <Laptop className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Laptop Guides</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {laptopGuides.map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guides/${guide.slug}`}
                  className="group p-6 rounded-2xl bg-card border border-subtle hover:border-default hover:bg-card-hover transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors mb-1">{guide.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{guide.desc}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Published Articles */}
          {posts && posts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl overflow-hidden bg-card border border-subtle/20 hover:border-accent/30 transition-all hover:-translate-y-1"
                  >
                    {post.cover_image_url && (
                      <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent">
                        Read Article <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="text-center rounded-3xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">Can&apos;t find what you&apos;re looking for?</h3>
            <p className="text-subtle mb-8 max-w-lg mx-auto text-sm">
              Message us on WhatsApp and our team will help you pick the right phone or laptop for your budget and needs.
            </p>
            <Link
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254757512769"}`}
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
