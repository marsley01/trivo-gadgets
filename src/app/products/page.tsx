"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShoppingBag, Search, X, SlidersHorizontal, ChevronDown } from "lucide-react";

type ProductData = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string | null;
  seo_description: string | null;
  description: string | null;
  slug: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState<"newest" | "price-low" | "price-high">("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/products", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setDbError(true);
        } else {
          setProducts(data.products || []);
        }
      })
      .catch(() => setDbError(true))
      .finally(() => {
        setLoading(false);
        clearTimeout(timeout);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
    return ["All", ...cats.sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.seo_description || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    switch (sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        break;
    }

    return result;
  }, [products, search, selectedCategory, sort]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="relative bg-gradient-to-br from-accent/10 via-background to-background pt-16 pb-8 md:pt-24 md:pb-12 overflow-hidden">
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
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 md:px-8 py-8">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}

          {/* Error */}
          {!loading && dbError && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Unable to load products</h3>
              <p className="text-muted text-sm max-w-md mb-6">
                We&apos;re having trouble fetching our product catalog. Please refresh the page or check back later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Refresh
              </button>
            </div>
          )}

          {!loading && !dbError && (
            <>
              {/* Search + Filter Bar */}
              <div className="flex flex-col md:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-card border border-default rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as typeof sort)}
                      className="appearance-none bg-card border border-default rounded-xl px-4 py-3 pr-10 text-sm text-foreground focus:outline-none focus:border-accent cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low</option>
                      <option value="price-high">Price: High</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {/* Mobile filter toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden inline-flex items-center gap-2 rounded-xl border border-default px-4 py-3 text-sm text-foreground hover:bg-surface transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>

              {/* Category Chips */}
              <div className={`flex flex-wrap gap-2 mb-8 ${showFilters ? "" : "hidden md:flex"}`}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold border transition-colors ${
                      selectedCategory === cat
                        ? "bg-accent/20 text-accent border-accent/30"
                        : "bg-surface border-default text-muted-foreground hover:text-foreground hover:border-accent/30"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Results count */}
              <p className="text-sm text-muted-foreground mb-6">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
              </p>

              {/* Products Grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                  {filtered.map((product) => (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
                  <h3 className="text-lg font-bold text-foreground mb-2">No products found</h3>
                  <p className="text-muted text-sm max-w-md mb-6">
                    {search
                      ? `No products match "${search}". Try a different search term.`
                      : "No products in this category yet."}
                  </p>
                  <button
                    onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                    className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
