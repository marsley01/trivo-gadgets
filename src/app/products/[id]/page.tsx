import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

export async function generateStaticParams() {
  const supabase = createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: products } = await supabase.from("products").select("id");
  return (products || []).map((p) => ({ id: p.id }));
}

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) return { title: "Product Not Found | Trivo Kenya" };

  const seoTitle = product.seo_title || `${product.name} | Trivo Kenya`;
  const seoDesc = product.seo_description || product.description || `Shop ${product.name} at Trivo Kenya. Premium tech gadgets in Kenya. Best price guaranteed.`;
  const tags = (product.tags as string[]) || [];
  const secondaryKw = product.secondary_keywords || "";
  const allKeywords = [product.focus_keyword, secondaryKw, ...tags].filter(Boolean).join(", ");

  return {
    title: seoTitle,
    description: seoDesc,
    keywords: allKeywords || undefined,
    openGraph: {
      title: product.seo_title || `${product.name} — Trivo Kenya`,
      description: seoDesc,
      url: `https://trivokenya.store/products/${params.id}`,
      siteName: "Trivo Kenya",
      images: product.image_url ? [{ url: product.image_url, width: 1200, height: 1200 }] : [],
      locale: "en_KE",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.seo_title || `${product.name} | Trivo Kenya`,
      description: seoDesc,
      images: product.image_url ? [product.image_url] : [],
    },
    alternates: {
      canonical: `/products/${params.id}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .neq("id", params.id)
    .limit(4);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.long_description || product.description || `Premium ${product.category || "tech"} product available at Trivo Kenya`,
            image: product.image_url || undefined,
            category: product.category || "Electronics",
            sku: product.id,
            keywords: (product.tags as string[])?.join(", ") || undefined,
            brand: {
              "@type": "Brand",
              name: "Trivo Kenya",
            },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "KES",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: `https://trivokenya.store/products/${params.id}`,
              seller: {
                "@type": "Organization",
                name: "Trivo Kenya",
                url: "https://trivokenya.store",
              },
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              itemCondition: "https://schema.org/NewCondition",
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://trivokenya.store" },
              { "@type": "ListItem", position: 2, name: "All Products", item: "https://trivokenya.store/products" },
              { "@type": "ListItem", position: 3, name: product.name },
            ],
          }),
        }}
      />
      <ProductDetailClient product={product} relatedProducts={related || []} />
    </>
  );
}
