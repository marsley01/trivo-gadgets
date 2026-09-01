import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [
    { slug: "best-phones-kenya" },
    { slug: "best-phones-under-20000" },
    { slug: "best-phones-under-30000" },
    { slug: "best-phones-under-50000" },
    { slug: "iphone-buying-guide-kenya" },
    { slug: "used-iphone-checklist" },
    { slug: "best-student-laptops-kenya" },
    { slug: "best-laptops-under-50000" },
    { slug: "best-laptops-programming-kenya" },
    { slug: "best-business-laptops-kenya" },
    { slug: "best-gaming-laptops-kenya" },
    { slug: "how-to-choose-laptop-kenya" },
    { slug: "laptop-ram-storage-explained" },
    { slug: "macbook-vs-windows-kenya" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const titles: Record<string, string> = {
    "best-phones-kenya": "Best Phones to Buy in Kenya | Trivo Kenya",
    "best-phones-under-20000": "Best Phones Under KSh 20,000 in Kenya | Trivo Kenya",
    "best-phones-under-30000": "Best Phones Under KSh 30,000 in Kenya | Trivo Kenya",
    "best-phones-under-50000": "Best Phones Under KSh 50,000 in Kenya | Trivo Kenya",
    "iphone-buying-guide-kenya": "iPhone Buying Guide Kenya | Trivo Kenya",
    "used-iphone-checklist": "What to Check Before Buying a Used iPhone in Kenya | Trivo Kenya",
    "best-student-laptops-kenya": "Best Laptops for Students in Kenya | Trivo Kenya",
    "best-laptops-under-50000": "Best Laptops Under KSh 50,000 in Kenya | Trivo Kenya",
    "best-laptops-programming-kenya": "Best Laptops for Programming in Kenya | Trivo Kenya",
    "best-business-laptops-kenya": "Best Laptops for Business in Kenya | Trivo Kenya",
    "best-gaming-laptops-kenya": "Best Gaming Laptops in Kenya | Trivo Kenya",
    "how-to-choose-laptop-kenya": "How to Choose the Right Laptop in Kenya | Trivo Kenya",
    "laptop-ram-storage-explained": "Laptop RAM and Storage Explained | Trivo Kenya",
    "macbook-vs-windows-kenya": "MacBook vs Windows Laptop: Which Should You Buy? | Trivo Kenya",
  };
  const title = titles[slug] || "Buying Guide | Trivo Kenya";
  return {
    title,
    description: title.replace(" | Trivo Kenya", ""),
    alternates: { canonical: `https://trivokenya.store/guides/${slug}` },
  };
}

const guideContent: Record<string, { intro: string; sections: { heading: string; body: string }[] }> = {
  "best-phones-kenya": {
    intro: "Picking the right phone in Kenya depends on your budget, brand preference, and what you actually use your phone for. Below is a practical guide to help you narrow down your options.",
    sections: [
      { heading: "Budget Phones (Under KSh 20,000)", body: "If you need a reliable phone for calls, WhatsApp, social media, and light browsing, Tecno, Redmi, and Infinix offer excellent value under KSh 20,000. Look for at least 4GB RAM and 64GB storage." },
      { heading: "Mid-Range Phones (KSh 20,000 - 50,000)", body: "In this range you get better cameras, faster processors, and more storage. Samsung A-series, Redmi Note series, and Tecno Phantom are strong contenders." },
      { heading: "Premium Phones (KSh 50,000+)", body: "For the best experience, consider iPhones or Samsung Galaxy S/Note series. These offer superior cameras, build quality, and long-term software support." },
    ],
  },
  "best-phones-under-20000": {
    intro: "You don't need to spend a fortune to get a good phone in Kenya. Here are the best options under KSh 20,000.",
    sections: [
      { heading: "What to look for", body: "Prioritize battery life, at least 4GB RAM, and 64GB storage. Tecno Spark, Redmi A series, and Infinix Hot are reliable choices in this budget." },
      { heading: "Best use case", body: "These phones are perfect for students, secondary phone users, and anyone who needs a solid device for calls, WhatsApp, and social media." },
    ],
  },
  "best-phones-under-30000": {
    intro: "KSh 30,000 is a sweet spot for a capable mid-range phone. Here's what to consider.",
    sections: [
      { heading: "What you get", body: "At KSh 30,000 you can find phones with 6-8GB RAM, 128GB storage, decent cameras, and modern designs. Samsung A-series and Redmi Note series offer great value." },
      { heading: "Who should buy here", body: "This range is ideal for young professionals, content consumers, and anyone who wants a smoother experience without paying flagship prices." },
    ],
  },
  "best-phones-under-50000": {
    intro: "Under KSh 50,000 you can get a phone that feels premium. Here are the best picks.",
    sections: [
      { heading: "Flagship killers", body: "Redmi, Tecno Phantom, and Samsung A-series upper models offer features that rival much more expensive phones — good cameras, fast charging, and powerful processors." },
      { heading: "Value consideration", body: "This is the best value range for most Kenyan shoppers. You get excellent performance without the premium brand markup." },
    ],
  },
  "iphone-buying-guide-kenya": {
    intro: "Buying an iPhone in Kenya? Here's everything you need to know to make the right choice.",
    sections: [
      { heading: "New vs Refurbished", body: "Brand new iPhones come with full warranty and peace of mind. Refurbished iPhones from trusted sellers offer great value — just verify the condition and warranty status before buying." },
      { heading: "Which model?", body: "The iPhone 15 and 16 series offer the latest features. For better value, consider the iPhone 13 or 14, which still receive iOS updates and perform excellently." },
      { heading: "Where to buy", body: "Buy from reputable Kenyan retailers like Trivo Kenya who verify every device and offer warranty coverage. Avoid unverified social media sellers." },
    ],
  },
  "used-iphone-checklist": {
    intro: "Buying a used iPhone? Run through this checklist to avoid common problems.",
    sections: [
      { heading: "Check the battery health", body: "Ask for the battery health percentage. Below 80% means the battery needs replacement soon, which adds to your total cost." },
      { heading: "Verify iCloud status", body: "Make sure the iPhone is not linked to someone else's iCloud. The previous owner must sign out of Find My iPhone before you buy." },
      { heading: "Inspect for damage", body: "Check the screen, cameras, buttons, and charging port. Ask about any previous repairs." },
      { heading: "Check warranty", body: "Some used iPhones may still be under Apple's limited warranty. Verify this using the serial number on Apple's website." },
    ],
  },
  "best-student-laptops-kenya": {
    intro: "A good student laptop needs to be affordable, portable, and capable of handling research, assignments, and online classes.",
    sections: [
      { heading: "Minimum specs", body: "Look for at least 8GB RAM, 256GB SSD, and a decent display. An SSD makes a huge difference in speed compared to a traditional hard drive." },
      { heading: "Recommended brands", body: "HP, Lenovo, and Dell offer excellent student laptops in Kenya. Look for models in the Pavilion, IdeaPad, and Inspiron ranges." },
      { heading: "Battery life matters", body: "If you carry your laptop to class or the library, prioritize battery life. Look for laptops rated for 6+ hours of real-world use." },
    ],
  },
  "best-laptops-under-50000": {
    intro: "You can find a genuinely useful laptop under KSh 50,000 in Kenya. Here's what to expect.",
    sections: [
      { heading: "What you can get", body: "Under KSh 50,000 you can find laptops with 8GB RAM, 256GB-512GB SSD, and capable processors from HP, Lenovo, and Dell. Perfect for students and light office work." },
      { heading: "What to avoid", body: "Avoid laptops with only 4GB RAM or eMMC storage — they will feel slow within months. Always check the spec sheet carefully." },
    ],
  },
  "best-laptops-programming-kenya": {
    intro: "Programming requires a laptop with enough RAM, fast storage, and a comfortable keyboard. Here's what to look for.",
    sections: [
      { heading: "Recommended specs", body: "For programming, aim for at least 16GB RAM, 512GB SSD, and a modern multi-core processor. This ensures smooth multitasking with IDEs, browsers, and virtual machines." },
      { heading: "Best brands for developers", body: "ThinkPad (Lenovo), MacBook Air, and Dell XPS are popular among developers in Kenya for their build quality, keyboards, and Linux compatibility." },
      { heading: "Screen and keyboard", body: "You'll be staring at the screen and typing for hours. Prioritize a good display (1920x1080 minimum) and a comfortable keyboard." },
    ],
  },
  "best-business-laptops-kenya": {
    intro: "A business laptop needs to be reliable, secure, and built for all-day productivity.",
    sections: [
      { heading: "Key features", body: "Look for business-grade build quality, fingerprint readers or IR cameras for Windows Hello, and long battery life. ThinkPad, EliteBook, and Latitude series are built for business." },
      { heading: "Security", body: "Business laptops often include TPM chips, privacy screens, and enterprise-grade security features that protect your data." },
      { heading: "Portability", body: "If you travel frequently, look for laptops under 1.5kg with all-day battery. Ultrabooks from HP, Lenovo, and Dell are ideal." },
    ],
  },
  "best-gaming-laptops-kenya": {
    intro: "Gaming laptops in Kenya are more accessible than ever. Here's what you need to know.",
    sections: [
      { heading: "Minimum specs for gaming", body: "Look for a dedicated GPU (RTX 3050 or better), at least 16GB RAM, and a 144Hz display for smooth gameplay." },
      { heading: "Brands to consider", body: "ASUS ROG, Acer Nitro, and HP Pavilion Gaming are popular gaming laptop brands available in Kenya. They offer good performance at various price points." },
      { heading: "Thermals and build", body: "Gaming laptops run hot. Make sure the model has decent cooling. Read reviews or ask us on WhatsApp about thermal performance." },
    ],
  },
  "how-to-choose-laptop-kenya": {
    intro: "Buying a laptop can be overwhelming. Here's a simple framework to help you choose the right one.",
    sections: [
      { heading: "Step 1: Define your use case", body: "Are you a student, professional, gamer, or casual user? Your use case determines the specs you need and your budget." },
      { heading: "Step 2: Set your budget", body: "Decide how much you're willing to spend. In Kenya, you can find solid laptops from KSh 35,000 (budget) to KSh 300,000+ (premium)." },
      { heading: "Step 3: Check the essentials", body: "Prioritize SSD storage over HDD, at least 8GB RAM, and a Full HD display. These three things make the biggest difference in daily use." },
      { heading: "Step 4: Buy from a trusted seller", body: "Buy from a reputable Kenyan retailer who offers warranty and after-sales support. Avoid unverified social media sellers." },
    ],
  },
  "laptop-ram-storage-explained": {
    intro: "RAM and storage are two of the most important laptop specifications. Here's what they mean for your daily use.",
    sections: [
      { heading: "RAM explained", body: "RAM is your laptop's short-term memory. 8GB is the minimum for smooth multitasking in 2024. 16GB is recommended for programming, content creation, and heavy browsing." },
      { heading: "Storage explained", body: "SSDs (Solid State Drives) are fast and reliable. HDDs (Hard Disk Drives) are slow but cheap. Always choose an SSD — your laptop will feel dramatically faster." },
      { heading: "How much do you need?", body: "For most users: 256GB-512GB SSD and 8GB RAM. For power users: 1TB+ SSD and 16GB+ RAM. Match your specs to your actual needs to avoid overspending." },
    ],
  },
  "macbook-vs-windows-kenya": {
    intro: "MacBook and Windows laptops both have their strengths. Here's an honest comparison to help you decide.",
    sections: [
      { heading: "MacBook strengths", body: "MacBooks offer excellent build quality, long battery life, and strong resale value in Kenya. macOS is stable and optimized for creative work. However, MacBooks are generally more expensive upfront." },
      { heading: "Windows laptop strengths", body: "Windows laptops offer more variety in price and specs. You can find capable machines from KSh 35,000. They're also more upgradeable and compatible with a wider range of software." },
      { heading: "Which should you buy?", body: "Choose a MacBook if you value build quality, battery life, and the Apple ecosystem. Choose Windows if you want more options, better value, or specific software compatibility." },
    ],
  },
};

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = guideContent[slug];

  if (!guide) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] rounded-full blur-[160px] pointer-events-none bg-accent/5" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-3xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/guides" className="hover:text-accent transition-colors">Guides</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Article</span>
          </nav>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Buying Guide
            </span>
          </div>

          <h1 id="guide-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            {guide.sections[0]?.heading || "Buying Guide"}
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-12 leading-relaxed">
            {guide.intro}
          </p>

          <div className="space-y-12">
            {guide.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{section.heading}</h2>
                <p className="text-subtle leading-relaxed">{section.body}</p>
              </section>
            ))}
          </div>

          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 text-center">
            <h3 className="text-xl font-bold text-foreground mb-3">Ready to buy?</h3>
            <p className="text-subtle mb-6 text-sm">
              Browse our phones and laptops or chat with us on WhatsApp for personalized advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-accent text-black font-bold px-6 py-3 text-sm hover:scale-105 active:scale-95 transition-all">
                Browse Store
              </Link>
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254740610772"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-default text-foreground px-6 py-3 text-sm font-bold hover:bg-surface hover:border-accent/30 active:scale-95 transition-all"
              >
                Ask on WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
