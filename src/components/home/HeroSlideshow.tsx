"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Database } from "@/types/database.types";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"];

export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [progressKey, setProgressKey] = useState(0);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
      setProgressKey((k) => k + 1);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered, currentIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setProgressKey((k) => k + 1);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setProgressKey((k) => k + 1);
  }, [slides.length]);

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) goToNext();
    if (distance < -minSwipeDistance) goToPrev();
  };

  // Fallback if no slides exist
  if (!slides || slides.length === 0) {
    return (
      <section
        className="relative w-full overflow-hidden bg-neutral-950 font-sans flex items-center justify-center"
        style={{ minHeight: "calc(100dvh - 64px)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900" />
        <div className="relative z-10 text-center px-6">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
            Premium Tech Gadgets
          </h1>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            Discover our collection of high-quality electronics.
          </p>
          <Link
            href="/#products"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105"
          >
            Browse Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className="hero-slideshow relative w-full overflow-hidden bg-neutral-950 font-sans group"
      style={{ minHeight: "calc(100dvh - 64px)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
            aria-hidden={!isActive}
          >
            {/* Image with Ken Burns zoom */}
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                transform: isActive ? "scale(1.08)" : "scale(1)",
                transition: isActive ? "transform 8s ease-out" : "none",
              }}
            >
              <Image
                src={slide.image_url}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                unoptimized
              />
            </div>

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col justify-end md:justify-center px-6 md:px-12 lg:px-20 pb-24 md:pb-0">
              <div className="max-w-3xl">
                {/* Badge */}
                {slide.badge && (
                  <div
                    className={`mb-5 transition-all duration-700 delay-200 transform ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    <span className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {slide.badge}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h1
                  className={`text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-7xl transition-all duration-700 delay-400 transform ${
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p
                    className={`mt-5 max-w-xl text-base font-light leading-relaxed text-neutral-300 md:text-xl transition-all duration-700 delay-600 transform ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                  >
                    {slide.subtitle}
                  </p>
                )}

                {/* CTA buttons */}
                <div
                  className={`mt-8 flex flex-col gap-3 sm:flex-row transition-all duration-700 delay-[800ms] transform ${
                    isActive
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <Link
                    href={slide.cta_url || "/products"}
                    className="group/btn inline-flex items-center justify-center gap-3 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
                  >
                    {slide.cta_label || "Shop Now"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                  <Link
                    href="/#products"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
                  >
                    Browse Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows — desktop only */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrev();
            }}
            className="absolute left-5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            className="absolute right-5 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/30 p-3 text-white backdrop-blur-md transition-all hover:bg-black/50 opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots + Progress */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex flex-col items-center gap-4">
          {/* Dot indicators */}
          <div className="flex gap-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setProgressKey((k) => k + 1);
                }}
                className={`h-2 transition-all duration-500 rounded-full ${
                  index === currentIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress bar (desktop) */}
          <div className="w-40 h-[3px] bg-white/15 rounded-full overflow-hidden hidden md:block">
            <div
              key={progressKey}
              className="h-full bg-white/70 rounded-full"
              style={{
                animation: isHovered ? "none" : "hero-progress 6s linear forwards",
              }}
            />
          </div>
        </div>
      )}

      {/* Scroll indicator */}
      <div className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 pb-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-500">
          Scroll
        </span>
        <div className="h-8 w-[1px] hero-scroll-line bg-gradient-to-b from-neutral-400 to-transparent" />
      </div>

      <style>{`
        @keyframes hero-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes hero-scroll-anim {
          0% { transform: scaleY(0); transform-origin: top; }
          50% { transform: scaleY(1); transform-origin: top; }
          50.01% { transform: scaleY(1); transform-origin: bottom; }
          100% { transform: scaleY(0); transform-origin: bottom; }
        }
        .hero-scroll-line {
          animation: hero-scroll-anim 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
