"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2, ChevronRight } from "lucide-react";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addToCart } = useCart();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Wishlist</span>
          </nav>

          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-6 w-6 text-accent" />
            <h1 className="text-3xl font-extrabold text-foreground">Your Wishlist</h1>
            <span className="text-sm text-muted-foreground">({items.length} items)</span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Heart className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Your wishlist is empty</h3>
              <p className="text-muted text-sm max-w-md mb-6">
                Save items you love by tapping the heart icon on any product.
              </p>
              <Link
                href="/"
                className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {items.map((item) => (
                <div key={item.id} className="group relative rounded-2xl overflow-hidden bg-card border border-subtle/20 hover:border-accent/30 transition-all">
                  <Link href={`/products/${item.slug ?? item.id}`} className="relative aspect-square block bg-white">
                    <Image
                      src={item.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop"}
                      alt={item.name}
                      fill
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </Link>
                  <div className="p-4 space-y-3">
                    <Link href={`/products/${item.slug ?? item.id}`}>
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 hover:text-accent transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-extrabold text-accent">KES {(item.price ?? 0).toLocaleString()}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: item.price ?? 0,
                            image_url: item.image_url,
                            stock: 1,
                            description: null,
                            category: null,
                            is_featured: false,
                            seo_title: null,
                            seo_description: null,
                            focus_keyword: null,
                            cj_product_id: null,
                            vendor_id: null,
                            brand: null,
                            features: [],
                            specifications: {},
                            tags: [],
                            material: null,
                            weight: null,
                            dimensions: null,
                            long_description: null,
                            secondary_keywords: null,
                            variants: [],
                            variant_options: [],
                            slug: item.slug ?? "",
                            created_at: new Date().toISOString(),
                          });
                          removeItem(item.id);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-accent text-black px-4 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded-full border border-default p-2 text-muted hover:text-red-400 hover:border-red-400/30 transition-all"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
