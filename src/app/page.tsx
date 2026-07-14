import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/product/ProductGrid";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const revalidate = 60;

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
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  const featuredProduct = products?.find((p) => p.is_featured) || products?.[0] || null;
  const gridProducts = products?.filter((p) => p.id !== featuredProduct?.id) || [];

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Hero product={featuredProduct} />
        <ProductGrid products={gridProducts} />
      </main>
      <Footer />
    </>
  );
}
