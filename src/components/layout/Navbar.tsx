"use client";

import Link from "next/link";
import { Search, Menu, User, X, Sun, Moon, ChevronDown, Heart } from "lucide-react";
import CartButton from "@/components/cart/CartButton";
import { useTheme } from "@/context/ThemeContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { items: wishlistItems } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchRef.current?.focus();
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-foreground hover:text-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
            {mounted ? (
              <img 
                src={theme === "dark" ? "/logo-transparent.svg" : "/logo-light.svg"} 
                alt="Trivo Kenya Logo" 
                className="h-10 w-auto" 
              />
            ) : (
              <div className="h-10 w-28 opacity-0" />
            )}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors py-2">Store Home</Link>
          
          <div className="relative group py-2">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              Categories <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-48 pt-2">
              <div className="bg-card border border-default rounded-xl p-2 shadow-xl space-y-1 backdrop-blur-md">
                <Link href="/categories/audio" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Audio</Link>
                <Link href="/categories/car-accessories" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Car Accessories</Link>
                <Link href="/categories/smart-home" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Smart Home</Link>
                <Link href="/categories/cables" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Cables & Chargers</Link>
              </div>
            </div>
          </div>

          <div className="relative group py-2">
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              Support <ChevronDown className="h-4 w-4 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-0 hidden group-hover:block w-48 pt-2">
              <div className="bg-card border border-default rounded-xl p-2 shadow-xl space-y-1 backdrop-blur-md">
                <Link href="/how-to-order" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">How to Order</Link>
                <Link href="/delivery" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Delivery Info</Link>
                <Link href="/returns" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">Returns & Warranty</Link>
                <Link href="/faq" className="block px-3 py-2 rounded-lg hover:bg-surface text-foreground transition-colors">FAQs & Help</Link>
              </div>
            </div>
          </div>

          <Link href="/about" className="hover:text-foreground transition-colors py-2">About Us</Link>
          <Link href="/blog" className="hover:text-foreground transition-colors py-2">Blog</Link>
        </nav>

        <div className="flex items-center gap-4 text-foreground">
          <button onClick={() => setSearchOpen(true)} className="hover:text-accent transition-colors" aria-label="Open search">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/wishlist" className="relative hover:text-accent transition-colors" aria-label="Wishlist">
            <Heart className="h-5 w-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          <Link href="/account" className="hover:text-accent transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleTheme}
            className="hover:text-accent transition-colors w-5 h-5 flex items-center justify-center"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {mounted ? (theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <div className="w-5 h-5 opacity-0" />}
          </button>
          <CartButton />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-default bg-background/95 backdrop-blur-md animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="flex flex-col px-6 py-6 gap-6 text-sm">
            {/* Main Links */}
            <div className="flex flex-col gap-3">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-bold text-foreground hover:text-accent transition-colors py-1">Store Home</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="font-bold text-foreground hover:text-accent transition-colors py-1">About Trivo</Link>
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="font-bold text-foreground hover:text-accent transition-colors py-1">Blog</Link>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Shop Collections</span>
              <div className="grid grid-cols-1 gap-2 pl-2 border-l border-default">
                <Link href="/categories/audio" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Audio</Link>
                <Link href="/categories/car-accessories" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Car Accessories</Link>
                <Link href="/categories/smart-home" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Smart Home</Link>
                <Link href="/categories/cables" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Cables & Chargers</Link>
              </div>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer Support</span>
              <div className="grid grid-cols-1 gap-2 pl-2 border-l border-default">
                <Link href="/how-to-order" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">How to Order</Link>
                <Link href="/delivery" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Delivery Information</Link>
                <Link href="/returns" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">Returns & Warranty</Link>
                <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="text-subtle hover:text-accent transition-colors py-1">FAQs & Help</Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* iTey Store Style Search Modal Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200 flex flex-col items-center pt-24 px-4">
          <div className="w-full max-w-2xl bg-card border border-subtle/20 rounded-2xl p-2 flex items-center shadow-2xl relative">
            <Search className="h-6 w-6 text-muted-foreground ml-3 shrink-0" />
            <form onSubmit={handleSearch} className="flex-1 flex items-center">
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search premium gadgets..."
                className="w-full bg-transparent px-4 py-3 text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoFocus
              />
              <button type="submit" className="text-xs font-bold bg-accent text-black px-4 py-2 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md mr-2">
                Search
              </button>
            </form>
            <button onClick={() => setSearchOpen(false)} className="p-2 text-muted-foreground hover:text-white transition-colors" aria-label="Close search">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Results Box / Helper */}
          <div className="w-full max-w-2xl bg-card/60 border border-subtle/10 rounded-2xl p-8 mt-4 text-center text-muted-foreground shadow-2xl backdrop-blur-md">
            {searchQuery.trim() ? (
              <p className="text-base font-medium text-foreground">
                Press <kbd className="px-2 py-1 bg-surface rounded text-accent font-mono text-xs">Enter</kbd> to explore premium gadgets for &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              <p className="text-sm">
                Type above to search our exclusive catalog of tech gadgets, smart home devices, and accessories.
              </p>
            )}
          </div>

          <p className="mt-6 text-xs text-muted-foreground font-medium tracking-wide">
            Press <kbd className="px-1.5 py-0.5 bg-surface rounded">Esc</kbd> to close • <kbd className="px-1.5 py-0.5 bg-surface rounded">Enter</kbd> to browse results
          </p>
        </div>
      )}
    </header>
  );
}
