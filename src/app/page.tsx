"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/product/ProductGrid";
import { Package } from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch("/api/products", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(true);
        } else {
          setProducts(data.products || []);
        }
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        clearTimeout(timeout);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const featuredProduct = products.find((p) => p.is_featured) || products[0] || null;
  const gridProducts = products.filter((p) => p.id !== featuredProduct?.id);

  return (
    <>
      <Navbar />
      <main>
        <Hero product={featuredProduct as never} />
        <div id="products">
          {loading ? (
            <section className="py-24 text-center">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            </section>
          ) : error ? (
            <section className="py-24 text-center">
              <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Unable to load products right now. Please refresh the page.</p>
            </section>
          ) : (
            <ProductGrid products={gridProducts as never} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
