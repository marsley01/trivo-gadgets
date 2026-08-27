"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { generateCartWhatsAppLink } from "@/lib/config";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeFromCart,
    cartTotal,
  } = useCart();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isDrawerOpen || !mounted) return null;

  const handleCheckout = () => {
    const link = generateCartWhatsAppLink(items, cartTotal);
    window.open(link, "_blank");
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-overlay-heavy/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-2xl transition-transform sm:border-l sm:border-default animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-default px-6 py-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </h2>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="rounded-full p-2 hover:bg-surface transition-colors text-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-20" />
              <p className="mb-2">Your cart is empty.</p>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-sm text-accent hover:underline font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-24 w-20 overflow-hidden rounded-md bg-neutral-900 flex-shrink-0">
                    <Image
                      src={item.image_url || "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop"}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col py-1">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-medium text-sm line-clamp-2 text-foreground/90">{item.name}</h3>
                      <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-red-400 transition-colors mt-0.5"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-1 text-sm text-muted font-medium">
                      KES {item.price.toLocaleString()}
                    </p>
                    <div className="mt-auto flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-default bg-card/50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:text-accent disabled:opacity-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:text-accent disabled:opacity-50 transition-colors"
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-default p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-card/20">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-medium text-subtle">Subtotal</span>
              <span className="text-lg font-bold text-foreground">KES {cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-6 flex justify-between">
              <span>Shipping & taxes</span>
              <span>Calculated at checkout</span>
            </p>
            <button
              onClick={handleCheckout}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-accent py-4 text-sm font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(var(--accent),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent),0.5)]"
            >
              Checkout via WhatsApp
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
