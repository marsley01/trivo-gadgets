"use client";

import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database.types";
import { generateWhatsAppLink } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CheckCircle2, Heart, ShoppingCart, MessageCircle } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;
  const whatsappLink = generateWhatsAppLink(product.name, product.price);
  const { addToCart } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const wished = hasItem(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,211,102,0.15)] border border-transparent hover:border-accent/40">
      {/* Top Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-surface flex items-center justify-center p-4 sm:p-6">
        <Image
          src={product.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={80}
          className="object-contain transition-transform duration-500 group-hover:scale-105 p-2 sm:p-4"
        />
        
        {/* Wishlist Heart - top left */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
          }}
          className="absolute top-3 left-3 z-20 h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-all"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4 w-4 transition-colors ${wished ? "fill-red-500 text-red-500" : "text-white"}`} />
        </button>

        {/* Top Right Stock Badge */}
        <div className="absolute top-3 right-3 z-10">
          {!inStock ? (
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
              Out of Stock
            </span>
          ) : (
            <span className="rounded-full bg-black/80 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md shadow-md">
              In Stock
            </span>
          )}
        </div>

        {!inStock && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />
        )}
      </Link>

      {/* Bottom Content Container */}
      <div className="flex flex-1 flex-col p-4 sm:p-5 bg-card">
        <div className="mb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {product.category || "Accessory"}
        </div>
        
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Guarantee Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
          <span>Genuine • Warrantied</span>
        </div>

        {/* Bottom Row: Price + Actions */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground line-through font-medium">
              KSh {Math.round(product.price * 1.15).toLocaleString()}
            </span>
            <span className="text-base sm:text-lg font-extrabold text-accent">
              KSh {product.price.toLocaleString()}
            </span>
          </div>
          
          {inStock ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addToCart(product)}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-surface hover:bg-accent hover:text-black transition-all flex items-center justify-center text-foreground hover:scale-110 active:scale-95 shadow-md shrink-0"
                aria-label="Add to cart"
              >
                <ShoppingCart className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-green-600 hover:bg-green-500 transition-all flex items-center justify-center text-white hover:scale-110 active:scale-95 shadow-md shrink-0"
                aria-label="Order via WhatsApp"
              >
                <MessageCircle className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
              </a>
            </div>
          ) : (
            <span className="inline-flex h-8 px-2.5 items-center justify-center rounded-full bg-chat-bubble text-muted-foreground text-[10px] font-medium shrink-0">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
