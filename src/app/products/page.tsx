import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse the full catalog of premium tech gadgets, smart home devices, and accessories available at Trivo Kenya. Free delivery in Nairobi.",
  openGraph: {
    title: "All Products | Trivo Kenya",
    description: "Browse the full catalog of premium tech gadgets, smart home devices, and accessories available at Trivo Kenya.",
    url: "https://trivokenya.store/products",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/logo-transparent.svg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://trivokenya.store/products",
  },
};

export default async function ProductsPage() {
  let products: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string | null;
    seo_description: string | null;
    description: string | null;
    slug: string;
  }[] = [];
  let dbError = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price, image_url, category, seo_description, description, slug")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products fetch error:", error.message);
      dbError = true;
    } else {
      products = (data || []) as typeof products;
    }
  } catch (e) {
    console.error("Products page error:", e);
    dbError = true;
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-accent/10 via-background to-background pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,211,102,0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <ShoppingBag className="h-10 w-10 text-accent mb-4" />
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
              All <span className="text-accent">Products</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl">
              Browse our full catalog of premium tech gadgets and accessories. Free delivery in Nairobi, pay on delivery.
            </p>
            {!dbError && products.length > 0 && (
              <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {products.length} product{products.length !== 1 ? "s" : ""}
                </span>
                {categories.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        {dbError ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Unable to load products</h3>
            <p className="text-muted text-sm max-w-md mb-6">
              We&apos;re having trouble fetching our product catalog. Please refresh the page or check back later.
            </p>
            <Link
              href="/"
              className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              Go Home
            </Link>
          </div>
        ) : products.length > 0 ? (
          <>
            {/* Category Pills */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10 justify-center">
                <span className="rounded-full bg-accent/20 text-accent border border-accent/30 px-4 py-1.5 text-xs font-bold">
                  All
                </span>
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/categories/${encodeURIComponent(cat.toLowerCase())}`}
                    className="rounded-full bg-surface border border-default px-4 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group rounded-2xl border border-default bg-card overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-square bg-surface overflow-hidden">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/30">
                        <ShoppingBag className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1.5">
                    {product.category && (
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {product.category}
                      </p>
                    )}
                    <h2 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                      {product.name}
                    </h2>
                    {product.seo_description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.seo_description}
                      </p>
                    )}
                    <p className="text-base font-extrabold text-accent pt-1">
                      KSh {product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No products yet</h3>
            <p className="text-muted text-sm max-w-md mb-6">
              Our catalog is being updated. Check back soon for the latest tech gadgets and accessories.
            </p>
            <Link
              href="/"
              className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              Back to Home
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
