"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type WishlistItem = { id: string; name: string; price: number; image_url: string | null; slug?: string };

type WishlistContextType = {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  hasItem: (id: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = "trivo_wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loaded]);

  const addItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const hasItem = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev.filter((i) => i.id !== item.id);
      return [...prev, item];
    });
  }, []);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, hasItem, toggleItem }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
