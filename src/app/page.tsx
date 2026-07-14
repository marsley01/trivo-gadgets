import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/product/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: "Get exclusive premium tech gadgets, smart home devices, and accessories in Kenya. Free delivery in Nairobi. Shop the latest drops.",
  openGraph: {
    title: "Trivo Kenya | Premium Tech Gadgets",
    description: "Get exclusive premium tech gadgets, smart home devices, and accessories in Kenya. Free delivery in Nairobi.",
    url: "https://trivokenya.store",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    images: [{ url: "/logo-transparent.svg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://trivokenya.store",
  },
};

export default async function Home() {
  let products: Record<string, unknown>[] = [];
  let dbError = false;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Homepage products fetch error:", error.message);
      dbError = true;
    } else {
      products = (data || []) as Record<string, unknown>[];
    }
  } catch (e) {
    console.error("Homepage error:", e);
    dbError = true;
  }

  const featuredProduct = products.find((p) => p.is_featured) || products[0] || null;
  const gridProducts = products.filter((p) => p.id !== featuredProduct?.id);

  return (
    <>
      <Navbar />
      <main>
        <Hero product={featuredProduct as never} />
        <div className="relative bg-background" style={{ zIndex: 2 }}>
          {dbError ? (
            <section className="py-24 text-center">
              <p className="text-muted-foreground">Unable to load products right now. Please refresh the page.</p>
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
