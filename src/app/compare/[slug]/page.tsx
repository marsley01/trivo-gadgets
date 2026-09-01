import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { ChevronRight, GitCompare, MessageCircle } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return [
    { slug: "iphone-vs-samsung" },
    { slug: "iphone-15-vs-iphone-16" },
    { slug: "samsung-vs-tecno" },
    { slug: "redmi-vs-tecno" },
    { slug: "hp-vs-lenovo" },
    { slug: "dell-vs-hp" },
    { slug: "macbook-vs-windows" },
  ];
}

const comparisons: Record<string, { title: string; intro: string; a: { name: string; pros: string[]; cons: string[] }; b: { name: string; pros: string[]; cons: string[] }; verdict: string }> = {
  "iphone-vs-samsung": {
    title: "iPhone vs Samsung — Which Should You Buy in Kenya?",
    intro: "Both iPhone and Samsung make excellent phones. Here's an honest comparison to help you decide which ecosystem suits you better in Kenya.",
    a: {
      name: "iPhone",
      pros: ["Smooth performance and long software support", "Strong resale value in Kenya", "Excellent video quality and ecosystem integration", "High build quality and durability"],
      cons: ["Higher upfront cost", "Limited customization compared to Android", "Repairs can be expensive"],
    },
    b: {
      name: "Samsung",
      pros: ["Wide range of prices from budget to premium", "Excellent displays and versatile cameras", "Expandable storage on many models", "More customization options"],
      cons: ["Software support shorter than iPhone", "Resale value drops faster", "Some models have bloatware"],
    },
    verdict: "Choose iPhone if you want long-term support, strong resale value, and a simple experience. Choose Samsung if you want more options, better display quality, or prefer Android flexibility.",
  },
  "iphone-15-vs-iphone-16": {
    title: "iPhone 15 vs iPhone 16 — Is the Upgrade Worth It?",
    intro: "Apple releases a new iPhone every year, but is the latest model worth the extra cost? Here's how the iPhone 15 and iPhone 16 compare.",
    a: {
      name: "iPhone 15",
      pros: ["Excellent performance with A17 Bionic", "USB-C charging (finally)", "Great cameras and battery life", "Lower price than iPhone 16"],
      cons: ["Older design compared to iPhone 16", "Slightly lower low-light camera performance"],
    },
    b: {
      name: "iPhone 16",
      pros: ["Newer design with thinner bezels", "Improved camera system", "Longer software support lifecycle", "Better battery efficiency"],
      cons: ["Higher price", "Incremental upgrades if you already have iPhone 15"],
    },
    verdict: "If you already have an iPhone 15, the jump to iPhone 16 is marginal. If you're upgrading from an older model or buying new, the iPhone 16 offers better long-term value.",
  },
  "samsung-vs-tecno": {
    title: "Samsung vs Tecno — Premium vs Budget in Kenya",
    intro: "Samsung and Tecno target very different budgets but both offer solid Android experiences. Here's how they compare.",
    a: {
      name: "Samsung",
      pros: ["Premium build quality and displays", "Strong camera performance", "Long-term software support", "Strong brand trust in Kenya"],
      cons: ["Significantly more expensive", "Mid-range models may lack premium features"],
    },
    b: {
      name: "Tecno",
      pros: ["Excellent value for money", "Good battery life on most models", "Modern features at budget prices", "Wide availability in Kenya"],
      cons: ["Lower resale value", "Software support is shorter", "Camera quality varies by model"],
    },
    verdict: "Choose Samsung if you want a premium experience, better cameras, and long-term support. Choose Tecno if you want the best value for your money and don't mind trade-offs.",
  },
  "redmi-vs-tecno": {
    title: "Redmi vs Tecno — Best Budget Phones in Kenya",
    intro: "Redmi and Tecno dominate the budget phone segment in Kenya. Both offer great value — here's how to choose between them.",
    a: {
      name: "Redmi",
      pros: ["Strong performance for the price", "Good build quality", "Regular MIUI updates", "Wide model selection"],
      cons: ["MIUI can have ads", "Software bloat on some models"],
    },
    b: {
      name: "Tecno",
      pros: ["Excellent battery life", "Modern designs", "Good camera for the price", "Strong presence in Kenya"],
      cons: ["Lower resale value than Redmi", "Software updates less frequent"],
    },
    verdict: "Both are excellent budget choices. Choose Redmi if you prioritize performance and clean-ish Android. Choose Tecno if you want better battery life and local availability.",
  },
  "hp-vs-lenovo": {
    title: "HP vs Lenovo — Best Laptops for Work & Study in Kenya",
    intro: "HP and Lenovo are two of the most popular laptop brands in Kenya. Both make reliable machines — here's how they differ.",
    a: {
      name: "HP",
      pros: ["Solid build quality and design", "Wide range of models for every budget", "Good customer support in Kenya", "Strong display options"],
      cons: ["Keyboard quality varies by model", "Some models run hot under load"],
    },
    b: {
      name: "Lenovo",
      pros: ["Legendary keyboard quality (especially ThinkPad)", "Excellent durability", "Good Linux compatibility", "Business-grade options available"],
      cons: ["Design can be utilitarian", "Customer support less visible than HP in Kenya"],
    },
    verdict: "Choose HP if you want a modern design, wide model selection, and visible local support. Choose Lenovo if you prioritize keyboard quality, durability, or plan to run Linux.",
  },
  "dell-vs-hp": {
    title: "Dell vs HP — Business Laptops Compared",
    intro: "Dell and HP both make excellent business laptops. Here's how their flagship lines compare.",
    a: {
      name: "Dell",
      pros: ["Excellent build quality (XPS and Latitude)", "Strong security features", "Good Linux support", "Reliable warranty service"],
      cons: ["Premium pricing", "Design is conservative"],
    },
    b: {
      name: "HP",
      pros: ["EliteBook series is highly capable", "Good value for business features", "Wide availability in Kenya", "Strong display options"],
      cons: ["Some models have keyboard issues", "Battery life varies significantly"],
    },
    verdict: "Both are solid choices for business. Dell XPS and Latitude are known for exceptional build. HP EliteBook offers similar capability at sometimes better value. Test both if possible.",
  },
  "macbook-vs-windows": {
    title: "MacBook vs Windows Laptop — Which Should You Buy in Kenya?",
    intro: "The MacBook vs Windows debate is ongoing. Here's an honest comparison to help you decide based on your actual needs.",
    a: {
      name: "MacBook",
      pros: ["Exceptional build quality and battery life", "macOS is stable and optimized", "Strong resale value in Kenya", "Excellent for creative work and programming"],
      cons: ["Higher upfront cost", "Limited upgradeability", "Fewer ports (USB-C only)", "Gaming options are limited"],
    },
    b: {
      name: "Windows Laptop",
      pros: ["Wide price range from KSh 35,000", "More software compatibility", "More upgradeable and repairable", "Better gaming options"],
      cons: ["Build quality varies significantly by model", "Battery life generally shorter", "Windows can feel bloated on low-end machines"],
    },
    verdict: "Choose MacBook if you want premium build quality, long battery life, and are invested in the Apple ecosystem. Choose Windows if you want more options, better value, or need specific software/games.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = comparisons[slug];
  if (!comp) return { title: "Comparison | Trivo Kenya" };
  return {
    title: comp.title,
    description: comp.intro,
    alternates: { canonical: `https://trivokenya.store/compare/${slug}` },
  };
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params;
  const comp = comparisons[slug];

  if (!comp) {
    return notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative py-16 md:py-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] rounded-full blur-[160px] pointer-events-none bg-accent/5" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-4xl">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/compare" className="hover:text-accent transition-colors">Comparisons</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Article</span>
          </nav>

          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
              <GitCompare className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
              Comparison
            </span>
          </div>

          <h1 id="compare-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-6">
            {comp.title}
          </h1>

          <p className="text-lg md:text-xl text-subtle mb-12 leading-relaxed">
            {comp.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 md:p-8 rounded-2xl bg-card border border-subtle">
              <h2 className="text-xl font-bold text-foreground mb-4">{comp.a.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Pros</h3>
                  <ul className="space-y-2">
                    {comp.a.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-subtle">
                        <span className="text-accent mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Cons</h3>
                  <ul className="space-y-2">
                    {comp.a.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-subtle">
                        <span className="text-red-400 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 rounded-2xl bg-card border border-subtle">
              <h2 className="text-xl font-bold text-foreground mb-4">{comp.b.name}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Pros</h3>
                  <ul className="space-y-2">
                    {comp.b.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-subtle">
                        <span className="text-accent mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Cons</h3>
                  <ul className="space-y-2">
                    {comp.b.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-subtle">
                        <span className="text-red-400 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 mb-12">
            <h3 className="text-lg font-bold text-foreground mb-3">Our Verdict</h3>
            <p className="text-subtle leading-relaxed">{comp.verdict}</p>
          </div>

          <div className="text-center rounded-3xl bg-gradient-to-br from-accent/10 to-highlight/5 border border-accent/25 p-8 md:p-12">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">Ready to buy?</h3>
            <p className="text-subtle mb-8 max-w-lg mx-auto text-sm">
              Browse our phones and laptops or chat with us on WhatsApp for personalized advice.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/products" className="inline-flex items-center justify-center rounded-full bg-accent text-black font-bold px-6 py-3 text-sm hover:scale-105 active:scale-95 transition-all">
                Browse Store
              </Link>
              <Link
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254757512769"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-default text-foreground px-6 py-3 text-sm font-bold hover:bg-surface hover:border-accent/30 active:scale-95 transition-all"
              >
                <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
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
