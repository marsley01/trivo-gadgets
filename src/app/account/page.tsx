import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, User, Bell, LogOut, ShoppingBag, Clock, Heart, MapPin, Edit3, Star, LayoutDashboard, type LucideIcon } from "lucide-react";
import { format } from "date-fns";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id) redirect("/auth/login");

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const customerId = customer?.id ?? "";
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  const orderCount = orders?.length || 0;
  const totalSpent = orders?.reduce((sum, o) => sum + o.total, 0) || 0;

  // Parse items from latest order for preview
  const latestItems: Array<{ name?: string; product_name?: string; quantity?: number }> =
    orders && orders.length > 0 && Array.isArray(orders[0].items)
      ? (orders[0].items as Array<{ name?: string; product_name?: string; quantity?: number }>).slice(0, 3)
      : [];

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-neutral-950 text-white shrink-0">
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-800">
          <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="h-5 w-5 text-accent" /> Account
          </Link>
        </div>
        <div className="p-6 border-b border-neutral-800">
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Welcome back</p>
          <p className="text-base font-bold text-white truncate">{customer?.full_name || user.email}</p>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <Link href="/account" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-accent text-white shadow-lg shadow-accent/20">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/wishlist" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
            <Heart className="h-5 w-5" /> Wishlist
          </Link>
          <Link href="/reviews" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
            <Star className="h-5 w-5" /> Reviews
          </Link>
          <Link href="/how-to-order" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
            <ShoppingBag className="h-5 w-5" /> Guide
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        <header className="h-16 bg-card border-b border-default flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground md:hidden">My Account</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface hover:bg-surface/80 px-4 py-2 rounded-lg">
               Store
            </Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface hover:bg-surface/80 px-4 py-2 rounded-lg">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">

          {/* Stats Row */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="bg-card/50 border border-default rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted">Profile</p>
                  <p className="text-foreground font-semibold text-sm truncate max-w-[120px]">{customer?.full_name || "Add name"}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted">
                <p className="truncate">{user.email}</p>
                <p>{customer?.phone || "Add phone"}</p>
                <p className="text-muted-foreground">
                  Joined {customer?.created_at ? format(new Date(customer.created_at), "MMM yyyy") : "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-card/50 border border-default rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted">Orders</p>
                  <p className="text-foreground font-bold text-2xl">{orderCount}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                KES {totalSpent.toLocaleString()} total spent
              </p>
            </div>

            <div className="bg-card/50 border border-default rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted">Notifications</p>
                  <p className="text-foreground font-semibold text-sm">Push alerts</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Stay updated on drops & orders</p>
            </div>

            <div className="bg-card/50 border border-default rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted">Wishlist</p>
                  <p className="text-foreground font-semibold text-sm">Saved items</p>
                </div>
              </div>
              <Link href="/wishlist" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                View Wishlist &rarr;
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <QuickLink href="/wishlist" icon={Heart} label="Wishlist" desc="Saved products" />
            <QuickLink href="/reviews" icon={Star} label="Reviews" desc="Your feedback" />
            <QuickLink href="/how-to-order" icon={ShoppingBag} label="How to Order" desc="Step-by-step guide" />
            <QuickLink href="/delivery" icon={MapPin} label="Delivery Info" desc="Free Nairobi delivery" />
          </div>

          {/* Recent Order + Profile Edit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Order Preview */}
            {latestItems.length > 0 && (
              <div className="bg-card/50 border border-default rounded-xl p-6">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  Latest Order Items
                </h3>
                <div className="space-y-3">
                  {latestItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground truncate">{item.name || item.product_name}</span>
                      <span className="text-foreground font-medium shrink-0 ml-2">
                        {item.quantity ? `x${item.quantity}` : ""}
                      </span>
                    </div>
                  ))}
                  <Link
                    href={`/account/orders`}
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                  >
                    View all orders &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Profile Edit Card */}
            <div className="bg-card/50 border border-default rounded-xl p-6">
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-accent" />
                Profile Settings
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="text-foreground font-medium">{customer?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-foreground font-medium">{customer?.phone || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
                <Link
                  href="/auth/update-password"
                  className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium"
                >
                  Change Password &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="bg-card/50 border border-default rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-accent" />
              Order History
            </h2>

            {orders && orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between bg-overlay-heavy/50 rounded-lg p-4 border border-subtle hover:border-default transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground font-medium">
                          KES {order.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {Array.isArray(order.items) && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : order.status === "completed"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-neutral-500/10 text-neutral-400"
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No orders yet</p>
                <Link
                  href="/"
                  className="text-accent text-sm hover:underline inline-block mt-2"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc }: { href: string; icon: LucideIcon; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-default bg-card/50 p-4 transition-all hover:border-accent/30 hover:bg-card hover:-translate-y-0.5"
    >
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-accent" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
    </Link>
  );
}
