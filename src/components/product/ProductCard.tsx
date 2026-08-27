"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Database } from "@/types/database.types";
import { generateWhatsAppLink } from "@/lib/config";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { CheckCircle2, Heart, ShoppingCart, Package } from "lucide-react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;
  const whatsappLink = generateWhatsAppLink(product.name, product.price);
  const { addToCart } = useCart();
  const { hasItem, toggleItem } = useWishlist();
  const wished = hasItem(product.id);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(37,211,102,0.15)] border border-transparent hover:border-accent/40">
      {/* Top Image Container */}
      <Link href={`/products/${product.slug}`} className="relative aspect-square sm:aspect-[4/5] w-full overflow-hidden bg-surface flex items-center justify-center">
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={100}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full w-full text-muted-foreground/20">
            <Package className="h-20 w-20" />
          </div>
        )}
        
        {/* Wishlist Heart - top left */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, slug: product.slug });
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
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-bold text-foreground mb-1.5 hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Brand */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
          <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
          <span>{product.brand || "Genuine"}</span>
        </div>

        {/* Bottom Row: Price + Actions */}
        <div className="flex items-end justify-between mt-auto pt-3">
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
                <WhatsAppIcon className="h-4 sm:h-4.5 w-4 sm:w-4.5" />
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
