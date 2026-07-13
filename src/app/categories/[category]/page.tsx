import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, Sparkles, AudioLines, ShieldAlert, Cpu, Cable, Car } from "lucide-react";
import type { Metadata } from "next";

const siteName = "Trivo Kenya";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const categoryName = getCategoryName(category);
  return {
    title: `${categoryName} — ${siteName}`,
    description: `Shop original ${categoryName} at Trivo Kenya. Free Nairobi delivery within 1 to 2 days and secure payment on delivery. Genuine tech, best prices.`,
    alternates: {
      canonical: `https://trivokenya.store/categories/${category}`,
    },
    openGraph: {
      title: `${categoryName} | ${siteName}`,
      description: `Shop original ${categoryName} at Trivo Kenya. Free Nairobi delivery.`,
      url: `https://trivokenya.store/categories/${category}`,
      siteName,
      locale: "en_KE",
      type: "website",
    },
  };
}

function getCategoryName(slug: string): string {
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

function getCategoryDetails(slug: string) {
  const normalized = slug.toLowerCase();
  switch (normalized) {
    case "audio":
      return {
        icon: AudioLines,
        title: "Audio Gear",
        desc: "Great audio makes all the difference. Explore our collection of genuine wireless earbuds, portable bluetooth speakers, and home audio gear.",
        glowColor: "bg-blue-500/10",
      };
    case "car-accessories":
      return {
        icon: Car,
        title: "Car Upgrades & Tech",
        desc: "Make your daily drive more comfortable and connected. Browse our reliable dash cams, fast in-car wireless chargers, and bluetooth adapters.",
        glowColor: "bg-red-500/10",
      };
    case "smart-home":
      return {
        icon: Cpu,
        title: "Smart Home Gadgets",
        desc: "Make your home smarter and more secure. Check out our reliable smart locks, automated lighting, and smart plugs.",
        glowColor: "bg-purple-500/10",
      };
    case "cables":
      return {
        icon: Cable,
        title: "Cables & Fast Chargers",
        desc: "Don't let a bad cable ruin your battery. Find durable braided cables, fast power delivery (PD) chargers, and multi-port adapters.",
        glowColor: "bg-amber-500/10",
      };
    default:
      return {
        icon: Sparkles,
        title: getCategoryName(slug),
        desc: `Explore our collection of genuine ${getCategoryName(slug)}. Free hand-delivery in Nairobi within 1 to 2 days.`,
        glowColor: "bg-accent/10",
      };
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const supabase = await createClient();
  const dbCategory = getDbCategoryName(category);
  const details = getCategoryDetails(category);
  const Icon = details.icon;

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
      { "@type": "ListItem", position: 3, name: getCategoryName(category) },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${getCategoryName(category)} | Trivo Kenya`,
    description: `Shop original ${getCategoryName(category)} at Trivo Kenya. Free Nairobi delivery.`,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <Navbar />
      <main className="min-h-screen bg-background text-foreground overflow-hidden relative pb-24">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] rounded-full blur-[160px] pointer-events-none ${details.glowColor}`} />

        <div className="container mx-auto px-4 md:px-8 pt-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Categories</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">{getCategoryName(category)}</span>
          </nav>

          <div className="p-8 md:p-12 rounded-3xl bg-card border border-subtle backdrop-blur-xl mb-16 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                    <Icon className="h-5 w-5 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                    Collection
                  </span>
                </div>
                <h1 id="category-page-title" className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {details.title}
                </h1>
                <p className="text-subtle text-base md:text-lg leading-relaxed">
                  {details.desc}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
