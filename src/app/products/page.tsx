import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
    images: [{ url: "https://trivokenya.store/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://trivokenya.store/products",
  },
};

export default async function ProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, image_url, category, seo_description, description, slug")
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2">All Products</h1>
      <p className="text-muted-foreground mb-10 max-w-2xl">
        Browse our full catalog of {products?.length || 0} premium tech gadgets and accessories. 
        Free delivery in Nairobi, pay on delivery.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {(products || []).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group rounded-xl border border-default bg-card p-4 hover:shadow-lg transition-shadow"
          >
            {product.image_url && (
              <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            )}
            <h2 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
              {product.name}
            </h2>
            {product.seo_description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.seo_description}</p>
            )}
            <p className="text-sm font-bold text-foreground mt-2">KES {product.price.toLocaleString()}</p>
          </Link>
        ))}
      </div>
      {(!products || products.length === 0) && (
        <p className="text-center text-muted-foreground py-20">No products available yet. Check back soon.</p>
      )}
    </main>
  );
}
