import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { getServerReviews } from "@/lib/reviews.server";

export async function generateStaticParams() {
  // Guard: if env vars aren't present (e.g. CI build without .env.local),
  // return empty array so Next.js falls back to on-demand rendering.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: products } = await supabase.from("products").select("slug");
  return (products || []).map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
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
      url: `https://trivokenya.store/products/${product.slug}`,
      siteName: "Trivo Kenya",
      images: product.image_url ? [{ url: product.image_url, width: 1200, height: 630 }] : [],
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
      canonical: `https://trivokenya.store/products/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*")
    .neq("id", product.id)
    .limit(4);

  const reviews = await getServerReviews(product.id);
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
    : 0;

  const productSchema: Record<string, unknown> = {
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
      name: product.brand || "Trivo Kenya",
    },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "KES",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `https://trivokenya.store/products/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Trivo Kenya",
        url: "https://trivokenya.store",
      },
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
    },
    merchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "KE",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "KE",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 3,
          unitCode: "DAY",
        },
      },
      shippingRate: {
        "@type": "MonetaryAmount",
        value: 0,
        currency: "KES",
      },
    },
  };

  if (reviews.length > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
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
