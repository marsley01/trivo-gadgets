"use client";

import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database.types";
import { ArrowRight, Zap, Shield, Truck, Star } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Hero({ product }: { product: Product | null }) {
  if (!product) return null;

  const whatsappLink = `https://wa.me/254757512769?text=${encodeURIComponent(
    `Hi! I'd like to order the ${product.name} at KES ${product.price.toLocaleString()}. Is it available?`
  )}`;

  return (
    <section className="relative w-full min-h-[88vh] flex items-center overflow-hidden bg-[#060608]">
      {/* === ANIMATED BACKGROUND LAYER === */}
      {/* Deep purple/blue base glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#060608] to-[#0a0a0f] pointer-events-none" />

      {/* Large orb top-left */}
      <div
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.18) 0%, rgba(37,99,235,0.04) 50%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Accent orb center-right */}
      <div
        className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.04) 50%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      {/* Small warm orb bottom */}
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* === MAIN CONTENT === */}
      <div className="container mx-auto px-6 md:px-10 xl:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16 py-16 lg:py-24">

          {/* ─── LEFT: TEXT CONTENT ─── */}
          <div className="flex-1 max-w-2xl space-y-7">

            {/* Top badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-widest"
              style={{
                background: "rgba(37,99,235,0.08)",
                borderColor: "rgba(37,99,235,0.25)",
                color: "#60a5fa",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              Kenya&apos;s #1 Premium Tech Store
            </div>

            {/* Main heading */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white tracking-tight leading-[1.02]">
                {product.name.split(" ").map((word, i) => (
                  <span key={i} className="block">
                    {i === 0 ? (
                      <span className="text-white">{word}</span>
                    ) : i === 1 ? (
                      <span style={{
                        background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #a78bfa 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}>{word}</span>
                    ) : (
                      <span className="text-white">{word}</span>
                    )}
                    {" "}
                  </span>
                ))}
              </h1>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg text-neutral-400 max-w-md leading-relaxed line-clamp-2">
              {product.description}
            </p>

            {/* Price block */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-black text-white">
                KES {product.price.toLocaleString()}
              </span>
              <span className="text-sm text-neutral-500 line-through">
                KES {Math.round(product.price * 1.2).toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-md text-xs font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                SAVE 20%
              </span>
            </div>

            {/* Stock indicator */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-6 rounded-full ${i < 3 ? "bg-green-500" : "bg-neutral-700"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                {product.stock} units left in stock
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group inline-flex items-center justify-center gap-2 font-bold px-8 py-4 rounded-2xl text-sm overflow-hidden transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                  boxShadow: "0 0 40px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                  color: "white",
                }}
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                Order via WhatsApp
                <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </a>

              <Link
                href="/#products"
                className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#d4d4d4",
                }}
              >
                Browse All Products
                <ArrowRight className="h-4 w-4 shrink-0 opacity-60" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-white/5">
              {[
                { icon: Zap, label: "Fast Delivery" },
                { icon: Shield, label: "Genuine Products" },
                { icon: Truck, label: "Nairobi Same-Day" },
                { icon: Star, label: "5★ Rated" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Icon className="h-3.5 w-3.5 text-blue-500/70" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ─── RIGHT: PRODUCT IMAGE CARD ─── */}
          <div className="flex-1 w-full max-w-[480px] relative">
            {/* Glow behind card */}
            <div
              className="absolute inset-8 rounded-3xl pointer-events-none"
              style={{
                background: "radial-gradient(ellipse, rgba(37,99,235,0.3) 0%, transparent 70%)",
                filter: "blur(30px)",
              }}
            />

            {/* Main card */}
            <div
              className="relative rounded-3xl overflow-hidden aspect-square"
              style={{
                background: "linear-gradient(145deg, #13131f 0%, #0e0e18 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(37,99,235,0.1)",
              }}
            >
              {/* Product image */}
              <Image
                src={
                  product.image_url ||
                  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop"
                }
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 480px"
              />

              {/* Gradient overlay on image */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(6,6,8,0.7) 0%, rgba(6,6,8,0.1) 40%, transparent 100%)",
                }}
              />

              {/* Top-right featured badge */}
              <div
                className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                style={{
                  background: "rgba(37,99,235,0.85)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                ✦ FEATURED
              </div>

              {/* Bottom info strip inside card */}
              <div
                className="absolute bottom-0 left-0 right-0 p-5"
                style={{ backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-neutral-400 mb-0.5">{product.category}</p>
                    <p className="text-base font-bold text-white leading-tight truncate max-w-[200px]">
                      {product.name}
                    </p>
                  </div>
                  <div
                    className="px-3 py-2 rounded-xl text-sm font-black text-white"
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                      boxShadow: "0 4px 20px rgba(37,99,235,0.5)",
                    }}
                  >
                    KES {product.price.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating review pill */}
            <div
              className="absolute -bottom-5 left-6 flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: "rgba(18,18,28,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div className="flex -space-x-2">
                {["#2563eb","#4f46e5","#7c3aed"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-[#12121c] flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ background: c }}
                  >
                    {["M","J","A"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 leading-none">500+ happy customers</p>
              </div>
            </div>

            {/* Floating delivery pill */}
            <div
              className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2.5 rounded-2xl"
              style={{
                background: "rgba(18,18,28,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.15)" }}
              >
                <Truck className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 leading-none">Delivery</p>
                <p className="text-xs font-bold text-white leading-tight mt-0.5">Same Day</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
