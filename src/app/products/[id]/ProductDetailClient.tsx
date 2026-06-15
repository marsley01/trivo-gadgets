"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { Shield, CheckCircle, Truck, Heart, ShoppingCart, MessageCircle, Star, Check, Tag, Ruler } from "lucide-react";
import { generateWhatsAppLink } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/product/ProductCard";
import BackButton from "@/components/BackButton";
import ShareButton from "@/components/ShareButton";
import ReviewsSection from "@/components/reviews/ReviewsSection";

type Product = Database["public"]["Tables"]["products"]["Row"];

type VariantType = { type: string; values: string[] };
type VariantOption = { sku: string; options: Record<string, string>; price: number; stock: number; image: string };

export default function ProductDetailClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const wished = hasItem(product.id);

  const variants = useMemo(() => (product.variants as VariantType[]) || [], [product.variants]);
  const variantOptions = useMemo(() => (product.variant_options as VariantOption[]) || [], [product.variant_options]);
  const hasVariants = variants.length > 0 && variantOptions.length > 0;

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState(0);

  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    return variantOptions.find((vo) =>
      Object.entries(selectedOptions).every(([key, val]) => vo.options[key] === val)
    ) || null;
  }, [selectedOptions, variantOptions, hasVariants]);

  // Initialize selected options with first values
  useEffect(() => {
    if (hasVariants && Object.keys(selectedOptions).length === 0) {
      const initial: Record<string, string> = {};
      variants.forEach((v) => { if (v.values.length > 0) initial[v.type] = v.values[0]; });
      setSelectedOptions(initial);
    }
  }, [hasVariants, variants, selectedOptions]);

  const displayPrice = activeVariant ? activeVariant.price : product.price;
  const displayStock = activeVariant ? activeVariant.stock : product.stock;
  const whatsappLink = generateWhatsAppLink(product.name, displayPrice, hasVariants && Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined);

  // Gallery: split image_url into multiple images (comma-separated) or use single
  const images = product.image_url
    ? product.image_url.split(",").map((u) => u.trim())
    : ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop"];

  const features = useMemo(() => (product.features as string[]) || [], [product.features]);
  const specifications = useMemo(() => (product.specifications as Record<string, string>) || {}, [product.specifications]);
  const tags = useMemo(() => (product.tags as string[]) || [], [product.tags]);

  const handleAddToCart = () => {
    if (hasVariants && activeVariant) {
      const variantLabel = Object.values(activeVariant.options).join(" / ");
      const variantImage = activeVariant.image || product.image_url;
      addToCart({ ...product, name: `${product.name} (${variantLabel})`, price: activeVariant.price, stock: activeVariant.stock, image_url: variantImage });
    } else {
      addToCart(product);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <BackButton fallbackHref="/#products" />
            <ShareButton
              title={product.name}
              text={`Check out ${product.name} at Trivo Kenya — KES ${product.price.toLocaleString()}`}
              url={`https://trivokenya.store/products/${product.id}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden bg-card border border-subtle group">
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {displayStock < 1 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">Out of Stock</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative h-20 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        i === selectedImage ? "border-accent ring-1 ring-accent/30" : "border-subtle/30 hover:border-default"
                      }`}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  {product.category || "Accessory"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                  {product.name}
                </h1>
              </div>

              {/* Rating Row */}
              <ReviewRating productId={product.id} />

              <p className="text-lg text-subtle leading-relaxed">
                {product.long_description || product.description}
              </p>

              {/* Variant Selectors */}
              {hasVariants && (
                <div className="space-y-3 pt-2">
                  {variants.map((variant) => (
                    <div key={variant.type}>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                        {variant.type}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {variant.values.map((val) => {
                          const isSelected = selectedOptions[variant.type] === val;
                          const isAvailable = variantOptions.some(
                            (vo) => vo.options[variant.type] === val && vo.stock > 0
                          );
                          return (
                            <button
                              key={val}
                              onClick={() => setSelectedOptions((prev) => ({ ...prev, [variant.type]: val }))}
                              disabled={!isAvailable}
                              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                                isSelected
                                  ? "border-accent bg-accent/20 text-accent font-bold"
                                  : isAvailable
                                  ? "border-default text-foreground hover:border-accent/50 hover:bg-surface"
                                  : "border-default/30 text-muted-foreground/50 cursor-not-allowed line-through"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                  KES {displayPrice.toLocaleString()}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  KES {Math.round(displayPrice * 1.15).toLocaleString()}
                </span>
                {displayStock > 0 && displayStock < 5 && (
                  <span className="text-sm text-amber-500 font-medium">
                    Only {displayStock} left
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {displayStock > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent text-black px-8 py-4 text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-default text-foreground px-8 py-4 text-sm font-bold transition-all hover:bg-surface hover:border-accent/30 active:scale-95"
                  >
                    <MessageCircle className="h-5 w-5 text-green-500" />
                    Order via WhatsApp
                  </a>
                  <button
                    onClick={() => toggleItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url })}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-4 text-sm font-bold transition-all active:scale-95 ${
                      wished
                        ? "border-red-500/30 bg-red-500/10 text-red-400"
                        : "border-default text-muted hover:text-foreground hover:bg-surface"
                    }`}
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`h-5 w-5 ${wished ? "fill-red-500" : ""}`} />
                  </button>
                </div>
              )}

              {/* Key Specs */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: "Condition", value: "Brand New" },
                  ...(product.brand ? [{ label: "Brand", value: product.brand }] : []),
                  ...(product.material ? [{ label: "Material", value: product.material }] : []),
                  ...(product.weight ? [{ label: "Weight", value: product.weight }] : []),
                  ...(product.dimensions ? [{ label: "Dimensions", value: product.dimensions }] : []),
                  { label: "Stock", value: displayStock > 0 ? `${displayStock} units` : "Out of stock" },
                  { label: "Delivery", value: displayStock > 0 ? "1-2 days (Nairobi)" : "—" },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-xl bg-surface/30 border border-subtle/20 px-4 py-3">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{spec.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Delivery and Payment Details Panel */}
              <div className="border border-subtle rounded-2xl bg-card/50 p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5">
                  <Truck className="h-4.5 w-4.5 text-accent" />
                  Delivery & Payment Details
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-surface/50 border border-default space-y-1">
                    <span className="font-bold text-foreground block">📍 Free Nairobi Delivery</span>
                    <span className="text-muted-foreground block leading-relaxed">Free delivery within 1 to 2 days. You get to open and check your item before paying via M-PESA.</span>
                  </div>
                  
                  <div className="p-3.5 rounded-xl bg-surface/50 border border-default space-y-1">
                    <span className="font-bold text-foreground block">🌍 Upcountry Delivery</span>
                    <span className="text-muted-foreground block leading-relaxed">Takes 2 to 3 days via courier. We share the tracking slip with you on WhatsApp as soon as it&apos;s sent.</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs pt-3 border-t border-subtle">
                  <div className="flex items-center gap-1.5 text-muted">
                    <CheckCircle className="h-4 w-4 text-accent" />
                    <span>Quality Checked</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Shield className="h-4 w-4 text-accent" />
                    <span>100% Genuine Tech</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          {features.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Key Features
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl bg-surface/30 border border-subtle/20 px-4 py-3">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-sm text-foreground">{feat}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Specifications Section */}
          {Object.keys(specifications).length > 0 && (
            <section className="mt-16">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-accent" />
                Specifications
              </h2>
              <div className="rounded-xl border border-subtle overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specifications).map(([key, val], i) => (
                      <tr key={key} className={i % 2 === 0 ? "bg-surface/20" : "bg-transparent"}>
                        <td className="px-4 py-3 font-medium text-muted-foreground w-1/3 border-r border-subtle/50">{key}</td>
                        <td className="px-4 py-3 text-foreground">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tags Section */}
          {tags.length > 0 && (
            <section className="mt-10">
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {tags.map((tag, i) => (
                  <span key={i} className="rounded-full bg-surface border border-default px-3 py-1 text-xs font-medium text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Customer Reviews Section */}
          <ReviewsSection productId={product.id} productName={product.name} />

          {relatedProducts.length > 0 && (
            <section className="mt-24">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ReviewRating({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<{ rating: number }[]>([]);
  useEffect(() => {
    import("@/lib/reviews").then((m) => setReviews(m.getReviews(productId)));
  }, [productId]);
  const avg = reviews.length > 0
    ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
    : 0;
  return (
    <div className="flex items-center gap-3">
      {reviews.length > 0 ? (
        <>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-4 w-4 ${star <= Math.round(avg) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">No reviews yet</span>
      )}
    </div>
  );
}
