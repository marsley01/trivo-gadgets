"use client";

import Image from "next/image";
import Link from "next/link";
import { Database } from "@/types/database.types";
import { generateWhatsAppLink as genWhatsApp } from "@/lib/config";
import { ArrowRight, Zap, Shield, Truck, Star, Play } from "lucide-react";
import { useEffect, useState } from "react";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Hero({ product }: { product: Product | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product) return null;

  const whatsappLink = genWhatsApp(product.name, product.price);

  return (
    <section className="relative w-full min-h-[92vh] flex items-center overflow-hidden bg-[#030305] font-sans selection:bg-blue-500/30">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep ambient base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#13152a] via-[#030305] to-[#000000]" />
        
        {/* Animated glowing orbs */}
        <div 
          className={`absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full blur-[120px] mix-blend-screen transition-opacity duration-1000 ${mounted ? 'opacity-40' : 'opacity-0'}`}
          style={{
            background: "radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(59,130,246,0) 70%)",
            animation: "pulse-slow 8s infinite alternate"
          }}
        />
        <div 
          className={`absolute top-[20%] -right-[20%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-screen transition-opacity duration-1000 delay-300 ${mounted ? 'opacity-30' : 'opacity-0'}`}
          style={{
            background: "radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(139,92,246,0) 70%)",
            animation: "pulse-slow 12s infinite alternate-reverse"
          }}
        />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 md:px-10 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center py-16 lg:py-24">
          
          {/* Left Content Column */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col space-y-8">
            
            {/* Premium Badge */}
            <div className={`inline-flex items-center self-start gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                Exclusive Drop
              </span>
            </div>

            {/* Title */}
            <div className={`space-y-4 transition-all duration-1000 delay-100 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                {product.name.split(" ").map((word, i, arr) => (
                  <span key={i} className="inline-block mr-3">
                    {i === Math.floor(arr.length / 2) ? (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                        {word}
                      </span>
                    ) : (
                      word
                    )}
                  </span>
                ))}
              </h1>
              
              <p className="text-lg md:text-xl text-neutral-300 font-light max-w-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price & Action */}
            <div className={`space-y-8 transition-all duration-1000 delay-200 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-400 line-through mb-1">
                    KES {Math.round(product.price * 1.15).toLocaleString()}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      KES {product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="h-12 w-px bg-white/10 hidden sm:block"></div>
                <div className="hidden sm:flex flex-col gap-1.5">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-neutral-300">500+ Verified Reviews</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-bold text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Order Now via WhatsApp</span>
                  <ArrowRight className="relative h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <Link
                  href="/#products"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm text-white bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
                >
                  Explore Collection
                </Link>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className={`pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              {[
                { icon: Truck, label: "Fast Nairobi Delivery" },
                { icon: Shield, label: "100% Genuine" },
                { icon: Zap, label: "Instant Support" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20">
                    <Icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-neutral-400">{label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Right Product Showcase Column */}
          <div className="lg:col-span-6 xl:col-span-7 relative flex items-center justify-center mt-10 lg:mt-0">
            {/* Showcase Backdrop */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] aspect-square rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent backdrop-blur-3xl transition-all duration-1500 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}></div>
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[480px] aspect-square rounded-full border border-white/10 bg-gradient-to-bl from-blue-500/10 to-transparent backdrop-blur-xl transition-all duration-1500 delay-200 ${mounted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}></div>
            
            {/* The Product Image container */}
            <div className={`relative w-full max-w-[500px] aspect-[4/5] sm:aspect-square z-20 group transition-all duration-1000 delay-300 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
              
              {/* Floating animation wrapper */}
              <div className="w-full h-full animate-float">
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-white/20 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                  {/* Glass reflections */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/20 via-transparent to-black/60 pointer-events-none mix-blend-overlay"></div>
                  <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none transform -skew-y-6 -translate-y-10"></div>
                  
                  <Image
                    src={product.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1200&auto=format&fit=crop"}
                    alt={product.name}
                    fill
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="flex items-center justify-center w-20 h-20 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-black/60 hover:border-white/50">
                      <Play className="h-8 w-8 ml-1" fill="currentColor" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className={`absolute -bottom-6 -left-6 sm:-left-12 p-4 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-30 transition-all duration-1000 delay-500 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", 
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop", 
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"].map((src, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-black overflow-hidden">
                        <Image src={src} alt="Customer" width={40} height={40} className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">Best Seller</div>
                    <div className="text-neutral-400 text-xs">Loved by creators</div>
                  </div>
                </div>
              </div>
              
              <div className={`absolute -top-6 -right-6 sm:-right-8 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-xl border border-white/20 shadow-2xl z-30 transition-all duration-1000 delay-700 transform ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  <span className="text-white font-bold text-sm tracking-wide">IN STOCK</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); opacity: 0.3; }
          100% { transform: scale(1.1); opacity: 0.6; }
        }
      `}} />
    </section>
  );
}
