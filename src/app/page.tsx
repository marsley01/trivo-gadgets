import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ProductGrid from "@/components/product/ProductGrid";
import { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

// ✅ SSR — Googlebot sees real product content in raw HTML
export const dynamic = "force-dynamic";

// ✅ Let the layout's `default` title handle the homepage to avoid duplication
// Layout default: "Trivo Kenya | Premium Tech Gadgets"
export const metadata: Metadata = {
  description:
    "Shop genuine premium tech gadgets in Kenya. Wireless earbuds, smart home devices, car accessories, cables and more. Free delivery in Nairobi. Pay on delivery accepted.",
  openGraph: {
    title: "Trivo Kenya | Premium Tech Gadgets in Kenya",
    description:
      "Shop genuine premium tech gadgets in Kenya. Wireless earbuds, smart home devices, car accessories. Free Nairobi delivery. Pay on delivery.",
    url: "https://trivokenya.store",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "https://trivokenya.store/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trivo Kenya — Premium Tech Gadgets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trivo Kenya | Premium Tech Gadgets in Kenya",
    description:
      "Genuine tech gadgets delivered to your door in Kenya. Free Nairobi delivery, pay on delivery.",
    images: ["https://trivokenya.store/og-image.jpg"],
  },
  alternates: {
    canonical: "https://trivokenya.store",
  },
  keywords: [
    "buy gadgets Kenya",
    "premium tech gadgets Kenya",
    "wireless earbuds Kenya",
    "smart home devices Kenya",
    "car accessories Kenya",
    "buy smartwatch Kenya",
    "online gadget store Kenya",
    "Trivo Kenya",
    "free delivery Nairobi gadgets",
    "pay on delivery Kenya tech",
  ],
};

export default async function Home() {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    products = (data || []) as Product[];
  } catch (e) {
    console.error("Homepage fetch error:", e);
  }

  const featuredProduct =
    (products.find((p) => p.is_featured) || products[0] || null) as Product | null;

  return (
    <>
      <Navbar />
      <main>
        <Hero product={featuredProduct} />
        <div id="products">
          <ProductGrid products={products as never} />
        </div>
      </main>
      <Footer />
    </>
  );
}
