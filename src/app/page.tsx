import type { Metadata } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import ProductGrid from "@/components/product/ProductGrid";

type Product = Database["public"]["Tables"]["products"]["Row"];
type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"];

export const revalidate = 3600;

async function getProducts(): Promise<Product[]> {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  return (data || []) as Product[];
}

async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("hero_slides").select("*").eq("is_active", true).order("sort_order", { ascending: true });
  return (data || []) as HeroSlide[];
}

export const metadata: Metadata = {
  title: "Phones & Laptops in Kenya | Trivo Kenya",
  description:
    "Shop genuine phones, laptops, and tech accessories in Kenya. Find the best prices on iPhones, Samsung, HP, Lenovo, and MacBooks. Delivery across Kenya. Pay on delivery.",
  openGraph: {
    title: "Phones & Laptops in Kenya — Honest Prices | Trivo Kenya",
    description:
      "Shop genuine phones, laptops, and tech accessories in Kenya. Find the best prices on iPhones, Samsung, HP, Lenovo, and MacBooks. Delivery across Kenya.",
    url: "https://trivokenya.store",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
    images: [
      {
        url: "https://trivokenya.store/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Trivo Kenya — Phones & Laptops",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phones & Laptops in Kenya | Trivo Kenya",
    description:
      "Genuine phones and laptops delivered to your door in Kenya. Free Nairobi delivery, pay on delivery.",
    images: ["https://trivokenya.store/og-image.jpg"],
  },
  alternates: {
    canonical: "https://trivokenya.store",
  },
  keywords: [
    "buy phones in Kenya",
    "buy laptops in Kenya",
    "smartphones in Kenya",
    "iPhone price in Kenya",
    "Samsung phone prices in Kenya",
    "laptop prices in Kenya",
    "HP laptops Kenya",
    "MacBook price in Kenya",
    "Trivo Kenya",
    "cheap phones in Kenya",
  ],
};

export default async function Home() {
  let products: Product[] = [];
  let heroSlides: HeroSlide[] = [];

  try {
    const [productsRes, slidesRes] = await Promise.all([
      getProducts(),
      getHeroSlides(),
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
