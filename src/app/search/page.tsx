import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products | Trivo Kenya",
  description: "Search our catalog of premium tech gadgets in Kenya.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() || "";

  const supabase = createClient();
  let products: Database["public"]["Tables"]["products"]["Row"][] = [];

  if (query.length >= 2) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
      .order("created_at", { ascending: false });
    products = data || [];
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Search</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-foreground mb-2">Search Results</h1>
          <p className="text-sm text-muted mb-8">
            {query && query.length >= 2 ? (
              <>
                Showing results for <span className="text-foreground font-medium">&ldquo;{query}&rdquo;</span>
                &mdash; {products.length} {products.length === 1 ? "product" : "products"} found
              </>
            ) : query && query.length === 1 ? (
              "Please enter at least 2 characters to search."
            ) : (
              "Enter a search term to find products."
            )}
          </p>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : query && query.length >= 2 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4 text-muted-foreground/30">🔍</div>
              <h3 className="text-lg font-bold text-foreground mb-2">No products found</h3>
              <p className="text-muted text-sm max-w-md">
                We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
                Try a different search term or browse our categories.
              </p>
              <Link
                href="/"
                className="mt-6 rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Browse All Products
              </Link>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
