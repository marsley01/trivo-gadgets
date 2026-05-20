"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { getVendorProducts, getVendorOrders, updateProductStock, createVendorProduct } from "@/lib/actions/vendor";
import { Package, PackageOpen, ShoppingCart, DollarSign, Plus, X, Edit2, ExternalLink, Save, Menu, LogOut, LayoutDashboard } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];
type AdminOrder = Database["public"]["Tables"]["admin_orders"]["Row"];
type Vendor = Database["public"]["Tables"]["vendors"]["Row"];

type OrderItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
};

const categories = ["Audio", "Car Accessories", "Smart Home", "Cables", "Lighting", "Other"];

type Toast = { id: number; message: string; type: "success" | "error" };
let toastId = 0;

export default function VendorDashboardClient({ vendor }: { vendor: Vendor }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);
  const [tab, setTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        getVendorProducts(vendor.id),
        getVendorOrders(vendor.id),
      ]);
      setProducts(productsRes);
      setOrders(ordersRes);
    } catch {
      addToast("Failed to refresh data", "error");
    }
    setLoading(false);
  }, [vendor.id, addToast]);

  useEffect(() => { refresh(); }, [refresh]);

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Product form
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "0",
    category: "",
    image_url: "",
  });

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "0", category: "", image_url: "" });
    setShowForm(false);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", form.name);
      fd.set("description", form.description);
      fd.set("price", form.price);
      fd.set("stock", form.stock);
      fd.set("category", form.category);
      fd.set("image_url", form.image_url);
      fd.set("is_featured", "false");

      await createVendorProduct(fd, vendor.id);
      addToast("Product created", "success");
      resetForm();
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create product";
      addToast(message, "error");
    }
    setSaving(false);
  };

  const handleStockUpdate = async (productId: string) => {
    if (!editingStock) return;
    const newStock = parseInt(editingStock.value);
    if (isNaN(newStock) || newStock < 0) return;

    try {
      await updateProductStock(productId, newStock);
      addToast("Stock updated", "success");
      setEditingStock(null);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update stock";
      addToast(message, "error");
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "text-blue-500 bg-blue-500/10",
      dispatched: "text-yellow-500 bg-yellow-500/10",
      delivered: "text-green-500 bg-green-500/10",
      refunded: "text-red-500 bg-red-500/10",
    };
    return colors[status] || "text-neutral-500 bg-neutral-500/10";
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden text-foreground">
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-800">
          <span className="text-xl font-bold tracking-tight text-white">
            TRIVO <span className="text-accent">VENDOR</span>
          </span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 border-b border-neutral-800">
          <p className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Store Name</p>
          <p className="text-base font-bold text-white truncate">{vendor.business_name || vendor.name}</p>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
            { id: "products" as const, label: "Products", icon: Package },
            { id: "orders" as const, label: "Orders", icon: ShoppingCart },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id 
                  ? "bg-accent text-white shadow-lg shadow-accent/20" 
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <t.icon className="h-5 w-5" />
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-default flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-foreground capitalize hidden md:block">{tab}</h1>
          </div>
          <div className="flex items-center gap-4">
            <form action="/auth/signout" method="post">
              <input type="hidden" name="redirect" value="/vendor" />
              <button
                type="submit"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors bg-surface hover:bg-surface/80 px-4 py-2 rounded-lg"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-foreground md:hidden capitalize">{tab}</h1>

            {tab === "dashboard" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-default bg-card p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-surface text-muted">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">My Products</p>
            <p className="text-xl font-bold text-foreground">{products.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-default bg-card p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-surface text-muted">
            <PackageOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Stock</p>
            <p className="text-xl font-bold text-foreground">{totalStock}</p>
          </div>
        </div>
        <div className="rounded-xl border border-default bg-card p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-surface text-muted">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
            <p className="text-xl font-bold text-foreground">{orders.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-default bg-card p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-surface text-muted">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="text-xl font-bold text-foreground">KES {revenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

              </div>
            )}

            {tab === "products" && (
              <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">My Products</h2>
          <button
            onClick={() => { resetForm(); setShowForm((v) => !v); }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add Product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateProduct} className="mb-6 rounded-xl border border-default bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <input type="text" placeholder="Product Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
              <div className="md:col-span-2">
                <textarea placeholder="Description" required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <input type="number" placeholder="Price (KES)" required min="0" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <input type="number" placeholder="Stock" required min="0" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent">
                  <option value="">Category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <input type="url" placeholder="Image URL" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="rounded-lg border border-default px-5 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />}
                Create Product
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-default bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground border-b border-default">
              <tr>
                <th className="px-4 py-3 w-12">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 w-24">Stock</th>
                <th className="px-4 py-3 w-16 text-center">Featured</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-subtle hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-surface">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">KES {p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {editingStock?.id === p.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={editingStock.value}
                          onChange={(e) => setEditingStock({ id: p.id, value: e.target.value })}
                          onBlur={() => handleStockUpdate(p.id)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleStockUpdate(p.id); if (e.key === "Escape") setEditingStock(null); }}
                          className="w-16 bg-background border border-accent rounded px-2 py-1 text-sm text-foreground focus:outline-none"
                          autoFocus
                        />
                        <button onClick={() => handleStockUpdate(p.id)} className="text-accent hover:text-accent/80">
                          <Save className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingStock({ id: p.id, value: p.stock.toString() })}
                        className={`inline-flex items-center gap-1 ${p.stock < 3 ? "text-red-500 font-semibold" : "text-foreground"} hover:text-accent transition-colors`}
                      >
                        {p.stock}
                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-3 w-3 rounded-full ${p.is_featured ? "bg-green-500" : "bg-neutral-600"}`} />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No products yet. Add your first product above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

              </section>
            )}

            {tab === "orders" && (
              <section>
        <h2 className="text-lg font-bold text-foreground mb-4">My Orders</h2>
        <div className="overflow-x-auto rounded-xl border border-default bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground border-b border-default">
              <tr>
                <th className="px-4 py-3">Receipt No.</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const orderItems = o.items as unknown as OrderItem[];
                return (
                  <tr key={o.id} className="border-b border-subtle hover:bg-surface/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{o.receipt_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground font-medium">{o.customer_name}</p>
                      <p className="text-[11px] text-muted-foreground">{o.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{orderItems.length} item{orderItems.length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">KES {o.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${statusBadge(o.status)}`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <a href={`/receipt/${o.receipt_number}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors">
                        <ExternalLink className="h-3.5 w-3.5" /> View Receipt
                      </a>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
              </section>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-lg px-5 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
