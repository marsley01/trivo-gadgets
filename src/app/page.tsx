import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ProductGrid from "@/components/product/ProductGrid";

type Product = Database["public"]["Tables"]["products"]["Row"];
type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"];

// Revalidate every hour just in case tags fail, but primary cache clearing is via tags.
export const revalidate = 3600;

// Create a static client for public data fetching so it doesn't access cookies (which breaks static rendering)
const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getCachedProducts = unstable_cache(
  async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    return (data || []) as Product[];
  },
  ["products-homepage"],
  { tags: ["products"] }
);

const getCachedHeroSlides = unstable_cache(
  async () => {
    const { data } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order", { ascending: true });
    return (data || []) as HeroSlide[];
  },
  ["hero-slides-homepage"],
  { tags: ["hero_slides"] }
);

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
  let heroSlides: HeroSlide[] = [];

  try {
    const [productsRes, slidesRes] = await Promise.all([
      getCachedProducts(),
      getCachedHeroSlides(),
    ]);

    products = productsRes;
    heroSlides = slidesRes;
  } catch (e) {
    console.error("Homepage fetch error:", e);
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSlideshow slides={heroSlides} />
        <div id="products">
          <ProductGrid products={products as never} />
        </div>
      </main>
      <Footer />
    </>
  );
}
