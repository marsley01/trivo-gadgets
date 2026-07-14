"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database.types";
import { generateWhatsAppLink as genWhatsApp } from "@/lib/config";
import { ArrowRight } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Hero({ product }: { product: Product | null }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (windowH - rect.top) / windowH));
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const blurAmount = scrollProgress * 16;
  const contentOpacity = Math.max(0, 1 - scrollProgress * 1.5);
  const scale = 1 + scrollProgress * 0.04;

  const heroImage = product?.image_url
    || "https://images.unsplash.com/photo-1635048424329-a9bfb146d7aa?q=80&w=1920&auto=format&fit=crop";

  return (
    <section
      ref={sectionRef}
      className="sticky top-0 h-screen w-full overflow-hidden bg-neutral-950 font-sans"
      style={{ zIndex: 1 }}
    >
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
          style={{ filter: `blur(${blurAmount}px)`, transform: `scale(${scale})` }}
        />
        <div
          className="absolute inset-0 transition-all duration-75"
          style={{
            background: `linear-gradient(180deg, 
              rgba(0,0,0,${0.2 + scrollProgress * 0.4}) 0%, 
              rgba(0,0,0,${0.4 + scrollProgress * 0.3}) 40%, 
              rgba(0,0,0,${0.7 + scrollProgress * 0.3}) 100%
            )`,
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex h-full flex-col justify-center px-6 md:px-12 lg:px-20"
        style={{ opacity: contentOpacity }}
      >
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
            Trivo Kenya
          </p>

          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
            {product ? (
              product.name.split(" ").map((word, i, arr) => (
                <span key={i} className="mr-3 inline-block">
                  {i === Math.floor(arr.length / 2) ? (
                    <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                      {word}
                    </span>
                  ) : (
                    word
                  )}
                </span>
              ))
            ) : (
              <span className="bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                Premium Tech Gadgets
              </span>
            )}
          </h1>

          {product && (
            <>
              <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-neutral-300 md:text-xl">
                {product.description}
              </p>

              <div className="mt-8 flex items-baseline gap-4">
                <span className="text-5xl font-black text-white drop-shadow-lg">
                  KES {product.price.toLocaleString()}
                </span>
                <span className="text-lg font-medium text-neutral-500 line-through">
                  KES {Math.round(product.price * 1.15).toLocaleString()}
                </span>
              </div>
            </>
          )}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={product ? genWhatsApp(product.name, product.price) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <Link
              href="/#products"
              className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              Browse Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-300"
        style={{ opacity: Math.max(0, 1 - scrollProgress * 2) }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">
            Scroll
          </span>
          <div className="h-10 w-[1px] animate-scroll-line bg-gradient-to-b from-neutral-400 to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes scroll-line {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          50.01% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        .animate-scroll-line {
          animation: scroll-line 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
