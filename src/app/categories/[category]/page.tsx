import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, Sparkles, AudioLines, ShieldAlert, Cpu, Cable, Car, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

const siteName = "Trivo Kenya";
export const revalidate = 60;

interface CategorySeoData {
  seoTitle: string;
  seoDesc: string;
  keywords: string[];
  h1Title: string;
  heroDesc: string;
  icon: typeof Sparkles;
  glowColor: string;
  faqs: { question: string; answer: string }[];
}

const CATEGORY_MAP: Record<string, CategorySeoData> = {
  "car-accessories": {
    seoTitle: "Car Accessories in Kenya - Buy Dash Cams & Car Gadgets | Trivo Kenya",
    seoDesc: "Shop top-rated car accessories in Kenya at Trivo Kenya. High quality dash cams, fast wireless car chargers, FM transmitters & bluetooth adapters. Free Nairobi delivery & pay on delivery.",
    keywords: ["car accessories in kenya", "dash cams nairobi", "wireless car charger kenya", "car gadgets nairobi", "bluetooth car adapter kenya"],
    h1Title: "Car Accessories & Tech in Kenya",
    heroDesc: "Upgrade your daily drive with premium car accessories in Kenya. Explore clear dash cams, ultra-fast wireless chargers, FM transmitters, and smart interior gadgets built for Kenyan roads.",
    icon: Car,
    glowColor: "bg-red-500/10",
    faqs: [
      {
        question: "Where can I buy reliable car accessories in Nairobi, Kenya?",
        answer: "You can buy genuine, high-quality car accessories directly from Trivo Kenya with free hand-delivery in Nairobi within 1 to 2 days and pay-on-delivery options."
      },
      {
        question: "Do dash cams work automatically when starting the car?",
        answer: "Yes, our smart dash cams automatically turn on and start recording as soon as your car engine starts or detects motion while parked."
      },
      {
        question: "Can I pay via M-Pesa on delivery for car accessories?",
        answer: "Absolutely! We support M-Pesa and cash payment on delivery for all orders across Nairobi."
      }
    ]
  },
  "audio": {
    seoTitle: "Audio & Wireless Earbuds in Kenya - Bluetooth Speakers | Trivo Kenya",
    seoDesc: "Shop authentic wireless earbuds, noise-cancelling headphones & portable bluetooth speakers in Kenya. Genuine audio gear, best prices & free Nairobi delivery.",
    keywords: ["wireless earbuds kenya", "bluetooth speakers nairobi", "earphones kenya", "audio gear nairobi", "oraimo earbuds kenya"],
    h1Title: "Audio Gear & Wireless Earbuds in Kenya",
    heroDesc: "Experience crystal-clear sound with our curated selection of original wireless earbuds, heavy-bass bluetooth speakers, and noise-cancelling headphones in Kenya.",
    icon: AudioLines,
    glowColor: "bg-blue-500/10",
    faqs: [
      {
        question: "Are your wireless earbuds and speakers genuine?",
        answer: "Yes, all audio gear sold at Trivo Kenya is 100% authentic and covered by warranty."
      },
      {
        question: "How long does delivery take for audio accessories in Nairobi?",
        answer: "We offer free delivery within 1 to 2 business days anywhere in Nairobi."
      }
    ]
  },
  "smart-home": {
    seoTitle: "Smart Home Gadgets & Security Devices in Kenya | Trivo Kenya",
    seoDesc: "Buy smart home devices, security cameras, smart door locks & ambient lighting in Kenya. Upgrade your living space with Trivo Kenya. Fast delivery available.",
    keywords: ["smart home devices kenya", "smart locks nairobi", "security cameras kenya", "smart plugs nairobi"],
    h1Title: "Smart Home Gadgets & Security in Kenya",
    heroDesc: "Transform your home into an intelligent, secure living space. Browse reliable smart door locks, automated lighting, plug adapters, and security sensors.",
    icon: Cpu,
    glowColor: "bg-purple-500/10",
    faqs: [
      {
        question: "Do smart home devices work with Kenyan power sockets?",
        answer: "Yes, all our smart plugs and electrical devices are built for standard UK/Kenyan 3-pin wall outlets (220V-240V)."
      }
    ]
  },
  "cables": {
    seoTitle: "Fast Chargers & Braided Cables in Kenya - USB-C & Lightning | Trivo Kenya",
    seoDesc: "Durable fast charging cables, PD wall chargers & multi-port power adapters in Kenya. Safe, rapid charging for smartphones and laptops.",
    keywords: ["fast chargers kenya", "usb-c cable nairobi", "pd charger kenya", "iphone cable kenya"],
    h1Title: "Fast Chargers & Braided Cables in Kenya",
    heroDesc: "Protect your battery life with heavy-duty braided cables and Power Delivery (PD) fast chargers designed for smartphones, tablets, and laptops.",
    icon: Cable,
    glowColor: "bg-amber-500/10",
    faqs: [
      {
        question: "Do you sell fast chargers for iPhone and Android in Kenya?",
        answer: "Yes, we stock high-speed 20W to 65W PD chargers compatible with both iPhone and Android devices."
      }
    ]
  }
};

function getCategoryData(slug: string): CategorySeoData {
  const normalized = slug.toLowerCase();
  if (CATEGORY_MAP[normalized]) {
    return CATEGORY_MAP[normalized];
  }

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
  return {
    seoTitle: `${categoryName} in Kenya - Buy Online | Trivo Kenya`,
    seoDesc: `Shop genuine ${categoryName} in Kenya at Trivo Kenya. Best prices, free Nairobi delivery, and secure pay on delivery.`,
    keywords: [`${categoryName.toLowerCase()} kenya`, `buy ${categoryName.toLowerCase()} nairobi`],
    h1Title: `${categoryName} in Kenya`,
    heroDesc: `Explore our collection of authentic ${categoryName}. Free hand-delivery in Nairobi within 1 to 2 days with M-Pesa payment on delivery.`,
    icon: Sparkles,
    glowColor: "bg-accent/10",
    faqs: [
      {
        question: `How can I order ${categoryName} in Kenya?`,
        answer: "Simply choose your items on Trivo Kenya and check out via WhatsApp for quick delivery confirmation and M-Pesa on delivery."
      }
    ]
  };
}

function getDbCategoryName(slug: string): string {
  const map: Record<string, string> = {
    "audio": "Audio",
    "car-accessories": "Car Accessories",
    "smart-home": "Smart Home",
    "cables": "Cables",
    "lighting": "Lighting",
    "other": "Other",
  };
  return map[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const data = getCategoryData(category);
  const canonicalUrl = `https://trivokenya.store/categories/${category}`;

  return {
    title: data.seoTitle,
    description: data.seoDesc,
    keywords: data.keywords.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: data.seoTitle,
      description: data.seoDesc,
      url: canonicalUrl,
      siteName,
      locale: "en_KE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.seoTitle,
      description: data.seoDesc,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const supabase = await createClient();
  const dbCategory = getDbCategoryName(category);
  const data = getCategoryData(category);
  const Icon = data.icon;

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("category", dbCategory)
    .order("created_at", { ascending: false });

  if (!products) {
    return notFound();
  }

  const categoryBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://trivokenya.store" },
      { "@type": "ListItem", position: 2, name: "Categories", item: "https://trivokenya.store/products" },
      { "@type": "ListItem", position: 3, name: data.h1Title },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.h1Title} | Trivo Kenya`,
    description: data.seoDesc,
    url: `https://trivokenya.store/categories/${category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://trivokenya.store/products/${p.slug}`,
      })),
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative pb-24">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] rounded-full blur-[160px] pointer-events-none ${data.glowColor}`} />

        <div className="container mx-auto px-4 md:px-8 pt-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-8 flex-wrap">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-accent transition-colors">Categories</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{data.h1Title}</span>
          </nav>

          <div className="p-8 md:p-12 rounded-3xl bg-card border border-subtle backdrop-blur-xl mb-16 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <Icon className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    Collection in Kenya
                  </span>
                </div>
                <h1 id="category-page-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {data.h1Title}
                </h1>
                <p className="text-subtle text-base md:text-lg leading-relaxed">
                  {data.heroDesc}
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end gap-1 shrink-0 p-4 rounded-2xl bg-surface/50 border border-default">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available Items</span>
                <span className="text-3xl font-extrabold text-foreground">{products.length}</span>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl bg-card/30 border border-dashed border-default">
              <ShieldAlert className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No items found</h3>
              <p className="text-muted text-sm max-w-xs leading-relaxed">
                We're currently restocking this category. Check back soon for new arrivals, or message us on WhatsApp if you're looking for a specific model!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-20">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Category FAQs Section for Google SEO & User Trust */}
          {data.faqs.length > 0 && (
            <section className="mt-16 p-8 md:p-12 rounded-3xl bg-card/50 border border-subtle backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">
                  Frequently Asked Questions about {data.h1Title}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {data.faqs.map((faq, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-surface/40 border border-default/50 space-y-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
