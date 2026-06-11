"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Database } from "@/types/database.types";
import { getAdminStatsFull, getAllOrders, getVendors, createProduct, updateProduct, deleteProduct, updateOrderStatus, createVendor, updateVendor, deleteVendor, createOrder, deleteOrder } from "@/lib/actions/admin";
import { sendReceiptEmail } from "@/lib/email/receipt";
import { analyzeProductSEO, getGradeColor, getGradeBg } from "@/lib/seo";
import { Package, Users, AlertTriangle, PackageOpen, Plus, X, Edit2, Trash2, BarChart3, DollarSign, ShoppingCart, Truck, Send, Eye, ExternalLink, Download, Loader2, ChevronLeft, Menu, LogOut } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];
type AdminOrder = Database["public"]["Tables"]["admin_orders"]["Row"];
type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
type Subscriber = { email: string; subscribed_at: string | null };

const categories = ["Audio", "Car Accessories", "Smart Home", "Cables", "Lighting", "Other"];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category: "",
  image_url: "",
  is_featured: false,
  seo_title: "",
  seo_description: "",
  focus_keyword: "",
  brand: "",
  material: "",
  weight: "",
  dimensions: "",
  features: "",
  specifications: "",
  tags: "",
  variants: "",
  variant_options: "",
  image_file: null as File | null,
};

interface OrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

type Toast = { id: number; message: string; type: "success" | "error" };
let toastId = 0;

const ORDER_STATUSES = ["confirmed", "dispatched", "delivered", "refunded"];

export default function AdminDashboardClient({
  initialStats,
  initialProducts,
  initialSubscribers,
  initialOrders,
  initialVendors,
}: {
  initialStats: { totalProducts: number; totalStock: number; subscribersCount: number; lowStock: number };
  initialProducts: Product[];
  initialSubscribers: Subscriber[];
  initialOrders: AdminOrder[];
  initialVendors: Vendor[];
}) {
  const [stats, setStats] = useState(initialStats);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [subscribers, setSubscribers] = useState(initialSubscribers);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"products" | "seo" | "transactions" | "vendors" | "import">("products");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | AdminOrder | Vendor | null>(null);
  const [deleteType, setDeleteType] = useState<"product" | "order" | "vendor">("product");
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // CJ Import state
  const [cjInput, setCjInput] = useState("");
  const [cjFetching, setCjFetching] = useState(false);
  const [cjProduct, setCjProduct] = useState<CJProduct | null>(null);
  const [cjError, setCjError] = useState("");
  const [cjImportForm, setCjImportForm] = useState({
    name: "",
    description: "",
    sellPrice: "",
    mainImage: "",
    selectedImages: [] as string[],
    category: "",
    is_featured: false,
    stock: "0",
  });
  const [cjImportSuccess, setCjImportSuccess] = useState<{ id: string; name: string } | null>(null);
  const [cjImporting, setCjImporting] = useState(false);

  interface CJProduct {
    pid: string;
    productName: string;
    description: string;
    sellPrice: number;
    weight: number;
    productImage: string;
    productImageSet: string[];
    categoryName: string;
    variants: { variantName: string; variantSellPrice: number; variantImage: string }[];
  }

  // New Transaction form state
  const [txForm, setTxForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_fee: "0",
    mpesa_reference: "",
    notes: "",
  });
  const [txItems, setTxItems] = useState<OrderItem[]>([{ product_name: "", quantity: 1, unit_price: 0 }]);
  const [txSuccess, setTxSuccess] = useState<{ receiptNumber: string; total: number; customerName: string; customerPhone: string; customerEmail: string } | null>(null);

  // Vendor form state
  const [vForm, setVForm] = useState({
    name: "",
    email: "",
    phone: "",
    business_name: "",
    status: "active",
  });

  const { ordersCount = 0, revenue = 0 } = stats as { ordersCount?: number; revenue?: number; totalProducts: number; totalStock: number; subscribersCount: number; lowStock: number };
  const pendingDispatch = orders.filter((o) => o.status === "confirmed").length;

  const addToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, subsRes, ordersRes, vendorsRes] = await Promise.all([
        import("@/lib/actions/admin").then((m) => m.getAdminStatsFull()),
        import("@/lib/actions/admin").then((m) => m.getAdminProducts()),
        import("@/lib/actions/admin").then((m) => m.getAdminSubscribers()),
        import("@/lib/actions/admin").then((m) => m.getAllOrders()),
        import("@/lib/actions/admin").then((m) => m.getVendors()),
      ]);
      setStats(statsRes);
      setProducts(productsRes);
      setSubscribers(subsRes);
      setOrders(ordersRes);
      setVendors(vendorsRes);
    } catch {
      addToast("Failed to refresh data", "error");
    }
    setLoading(false);
  }, [addToast]);

  // --- Product handlers ---
  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const openEditForm = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured,
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      focus_keyword: product.focus_keyword || "",
      brand: product.brand || "",
      material: product.material || "",
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      features: JSON.stringify(product.features || []),
      specifications: JSON.stringify(product.specifications || {}),
      tags: JSON.stringify(product.tags || []),
      variants: JSON.stringify(product.variants || []),
      variant_options: JSON.stringify(product.variant_options || []),
      image_file: null,
    });
    setEditingId(product.id);
    setShowForm(true);
    setTab("products");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
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
      if (form.image_file) {
        fd.set("image_file", form.image_file);
      }
      fd.set("is_featured", form.is_featured ? "true" : "false");
      fd.set("seo_title", form.seo_title);
      fd.set("seo_description", form.seo_description);
      fd.set("focus_keyword", form.focus_keyword);
      fd.set("brand", form.brand);
      fd.set("material", form.material);
      fd.set("weight", form.weight);
      fd.set("dimensions", form.dimensions);
      fd.set("features", form.features);
      fd.set("specifications", form.specifications);
      fd.set("tags", form.tags);
      fd.set("variants", form.variants);
      fd.set("variant_options", form.variant_options);

      if (editingId) {
        await updateProduct(editingId, fd);
        addToast("Product updated", "success");
      } else {
        await createProduct(fd);
        addToast("Product created", "success");
      }
      resetForm();
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      addToast(message, "error");
    }
    setSaving(false);
  };

  // --- Transaction handlers ---
  const computeSubtotal = () => txItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0);
  const computeTotal = () => computeSubtotal() + (parseInt(txForm.delivery_fee) || 0);

  const addTxItem = () => {
    setTxItems([...txItems, { product_name: "", quantity: 1, unit_price: 0 }]);
  };

  const removeTxItem = (idx: number) => {
    if (txItems.length <= 1) return;
    setTxItems(txItems.filter((_, i) => i !== idx));
  };

  const updateTxItem = (idx: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...txItems];
    const item = { ...updated[idx] };
    if (field === "quantity") item.quantity = Math.max(1, parseInt(value as string) || 1);
    else if (field === "unit_price") item.unit_price = Math.max(0, parseInt(value as string) || 0);
    else if (field === "product_name") item.product_name = value as string;
    updated[idx] = item;
    setTxItems(updated);
  };

  const selectProductForItem = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    const updated = [...txItems];
    updated[idx] = { ...updated[idx], product_id: p.id, product_name: p.name, unit_price: p.price };
    setTxItems(updated);
  };

  const resetTxForm = () => {
    setTxForm({ customer_name: "", customer_phone: "", customer_email: "", delivery_fee: "0", mpesa_reference: "", notes: "" });
    setTxItems([{ product_name: "", quantity: 1, unit_price: 0 }]);
    setTxSuccess(null);
    setShowNewTransaction(false);
  };

  const handleNewTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("customer_name", txForm.customer_name);
      fd.set("customer_phone", txForm.customer_phone);
      fd.set("customer_email", txForm.customer_email);
      fd.set("items", JSON.stringify(txItems));
      fd.set("subtotal", computeSubtotal().toString());
      fd.set("delivery_fee", txForm.delivery_fee || "0");
      fd.set("total", computeTotal().toString());
      fd.set("mpesa_reference", txForm.mpesa_reference);
      fd.set("notes", txForm.notes);

      const receiptNumber = await createOrder(fd);

      setTxSuccess({
        receiptNumber,
        total: computeTotal(),
        customerName: txForm.customer_name,
        customerPhone: txForm.customer_phone,
        customerEmail: txForm.customer_email,
      });

      addToast(`Transaction recorded: ${receiptNumber}`, "success");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create transaction";
      addToast(message, "error");
    }
    setSaving(false);
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      addToast("Status updated", "success");
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      addToast(message, "error");
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteTarget || deleteType !== "order") return;
    setDeleting(true);
    try {
      await deleteOrder((deleteTarget as AdminOrder).id);
      addToast("Order deleted", "success");
      setDeleteTarget(null);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      addToast(message, "error");
    }
    setDeleting(false);
  };

  // --- Vendor handlers ---
  const resetVendorForm = () => {
    setVForm({ name: "", email: "", phone: "", business_name: "", status: "active" });
    setEditingVendorId(null);
    setShowAddVendor(false);
  };

  const openEditVendor = (v: Vendor) => {
    setVForm({ name: v.name, email: v.email, phone: v.phone || "", business_name: v.business_name || "", status: v.status });
    setEditingVendorId(v.id);
    setShowAddVendor(true);
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("name", vForm.name);
      fd.set("email", vForm.email);
      fd.set("phone", vForm.phone);
      fd.set("business_name", vForm.business_name);
      fd.set("status", vForm.status);

      if (editingVendorId) {
        await updateVendor(editingVendorId, fd);
        addToast("Vendor updated", "success");
      } else {
        await createVendor(fd);
        addToast("Vendor created. They will receive an invite email.", "success");
      }
      resetVendorForm();
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save vendor";
      addToast(message, "error");
    }
    setSaving(false);
  };

  const confirmDeleteVendor = async () => {
    if (!deleteTarget || deleteType !== "vendor") return;
    setDeleting(true);
    try {
      await deleteVendor((deleteTarget as Vendor).id);
      addToast("Vendor deleted", "success");
      setDeleteTarget(null);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      addToast(message, "error");
    }
    setDeleting(false);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget || deleteType !== "product") return;
    setDeleting(true);
    try {
      await deleteProduct((deleteTarget as Product).id);
      addToast("Product deleted", "success");
      setDeleteTarget(null);
      await refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete";
      addToast(message, "error");
    }
    setDeleting(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: "text-blue-500 bg-blue-500/10",
      dispatched: "text-yellow-500 bg-yellow-500/10",
      delivered: "text-green-500 bg-green-500/10",
      refunded: "text-red-500 bg-red-500/10",
    };
    return colors[status] || "text-neutral-500 bg-neutral-500/10";
  };

  const productCountForVendor = (vendorId: string) => products.filter((p) => p.vendor_id === vendorId).length;

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
            TRIVO <span className="text-accent">ADMIN</span>
          </span>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { id: "products" as const, label: "Products", icon: Package },
            { id: "seo" as const, label: "SEO Audit", icon: BarChart3 },
            { id: "transactions" as const, label: "Transactions", icon: ShoppingCart },
            { id: "vendors" as const, label: "Vendors", icon: Users },
            { id: "import" as const, label: "Import", icon: Download },
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
              <input type="hidden" name="redirect" value="/admin/login" />
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

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
              <StatCard icon={PackageOpen} label="Total Stock" value={stats.totalStock} />
              <StatCard icon={Users} label="Subscribers" value={stats.subscribersCount} />
              <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStock} warning valueRed />
              <StatCard icon={ShoppingCart} label="Total Orders" value={ordersCount} />
              <StatCard icon={DollarSign} label="Revenue" value={`KES ${revenue.toLocaleString()}`} />
              <StatCard icon={Truck} label="Pending Dispatch" value={pendingDispatch} />
            </div>

      {/* ============ PRODUCTS TAB ============ */}
      {tab === "products" && (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Products</h2>
          <button
            onClick={() => { resetForm(); setShowForm((v) => !v); }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "Add New Product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleFormSubmit} className="mb-6 rounded-xl border border-default bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="md:col-span-2 lg:col-span-3">
                <input type="text" placeholder="Product Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
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
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Product Image (Upload or Paste URL)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="url" placeholder="Paste Image URL" value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                  <input type="file" accept="image/*" onChange={(e) => setForm((f) => ({ ...f, image_file: e.target.files?.[0] || null }))} className="w-full bg-background border border-default rounded-lg px-4 py-2 text-sm text-foreground file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-accent file:text-black hover:file:bg-accent/90" />
                </div>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))} className="h-4 w-4 rounded border-default bg-surface text-accent focus:ring-accent" />
              <span className="text-xs text-muted">Set as Featured (unfeatures all others)</span>
            </label>
            <div className="border-t border-default pt-4 mt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">SEO Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2 lg:col-span-3">
                  <input type="text" placeholder="SEO Title" value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <textarea placeholder="SEO Meta Description" rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none" />
                </div>
                <div>
                  <input type="text" placeholder="Focus Keyword" value={form.focus_keyword} onChange={(e) => setForm((f) => ({ ...f, focus_keyword: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>

            <div className="border-t border-default pt-4 mt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Enhanced Product Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Brand (e.g. Samsung)" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                <input type="text" placeholder="Material (e.g. Aluminum)" value={form.material} onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                <input type="text" placeholder="Weight (e.g. 200g)" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                <input type="text" placeholder="Dimensions (e.g. 10x5x3cm)" value={form.dimensions} onChange={(e) => setForm((f) => ({ ...f, dimensions: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-1 gap-4 mt-3">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Features (JSON array, e.g. ["Feature 1", "Feature 2"])</label>
                  <textarea placeholder='["Noise Cancelling", "24hr Battery", "Water Resistant"]' rows={2} value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Specifications (JSON object, e.g. {"{"}"Weight":"200g","Color":"Black"{"}"})</label>
                  <textarea placeholder='{"Weight": "200g", "Color": "Black", "Connectivity": "Bluetooth 5.3"}' rows={2} value={form.specifications} onChange={(e) => setForm((f) => ({ ...f, specifications: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Tags (JSON array, e.g. ["wireless", "bluetooth", "earphones"])</label>
                  <textarea placeholder='["wireless", "bluetooth", "earphones", "new-arrival"]' rows={1} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-mono text-xs" />
                </div>
              </div>
            </div>

            <div className="border-t border-default pt-4 mt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Product Variants (Like WooCommerce)</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Variant Types (JSON array, e.g. [{"{"}"type":"Color","values":["Red","Blue","Black"]{"}"}])</label>
                  <textarea placeholder='[{"type": "Color", "values": ["Red", "Blue", "Black"]}, {"type": "Size", "values": ["S", "M", "L", "XL"]}]' rows={2} value={form.variants} onChange={(e) => setForm((f) => ({ ...f, variants: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Variant Options (JSON array with SKU, options, price, stock, image)</label>
                  <textarea placeholder='[{"sku": "PROD-RED-M", "options": {"Color": "Red", "Size": "M"}, "price": 3500, "stock": 5, "image": ""}, {"sku": "PROD-BLUE-L", "options": {"Color": "Blue", "Size": "L"}, "price": 3500, "stock": 3, "image": ""}]' rows={3} value={form.variant_options} onChange={(e) => setForm((f) => ({ ...f, variant_options: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none font-mono text-xs" />
                </div>
                <p className="text-[11px] text-muted-foreground">Leave empty for simple products. When variant options exist, customers choose from available options.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetForm} className="rounded-lg border border-default px-5 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />}
                {editingId ? "Save Changes" : "Create Product"}
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
                <th className="px-4 py-3 w-20">Stock</th>
                <th className="px-4 py-3 w-16 text-center">Featured</th>
                <th className="px-4 py-3 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-subtle hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-surface flex-shrink-0">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">—</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      {p.name}
                      {p.cj_product_id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                          <Download className="h-2.5 w-2.5" /> CJ
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category || "—"}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">KES {p.price.toLocaleString()}</td>
                  <td className={`px-4 py-3 whitespace-nowrap ${p.stock < 3 ? "text-red-500 font-semibold" : "text-foreground"}`}>{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block h-3 w-3 rounded-full ${p.is_featured ? "bg-green-500" : "bg-neutral-600"}`} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEditForm(p)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors mr-3">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => { setDeleteTarget(p); setDeleteType("product"); }} className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* ============ SEO TAB ============ */}
      {tab === "seo" && (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">SEO Audit</h2>
          <span className="text-xs text-muted-foreground">{products.filter((p) => { const s = analyzeProductSEO(p); return s.percentage >= 70; }).length}/{products.length} optimized</span>
        </div>
        <div className="space-y-3">
          {products.map((p) => {
            const score = analyzeProductSEO(p);
            const gradeColor = getGradeColor(score.grade);
            const gradeBg = getGradeBg(score.grade);
            return (
              <div key={p.id} className={`rounded-xl border p-4 ${gradeBg}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`text-lg font-bold ${gradeColor}`}>{score.percentage}%</div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground capitalize">{score.grade} — {score.total}/{score.max} pts</p>
                    </div>
                  </div>
                  <button onClick={() => { openEditForm(p); setTab("products"); }} className="shrink-0 rounded-lg border border-default px-3 py-1.5 text-xs text-muted hover:text-foreground transition-colors">Edit SEO</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {score.checks.map((check, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={`shrink-0 ${check.pass ? "text-green-500" : "text-red-500"}`}>{check.pass ? "✓" : "✗"}</span>
                      <span className="text-muted-foreground truncate">{check.label}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground">{check.score}/{check.max}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {products.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">No products to audit.</p>}
        </div>
      </section>
      )}

      {/* ============ TRANSACTIONS TAB ============ */}
      {tab === "transactions" && (
      <section className="space-y-8">
        {/* New Transaction Button and Form */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Record New Transaction</h2>
            <button
              onClick={() => { resetTxForm(); setShowNewTransaction((v) => !v); }}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
            >
              {showNewTransaction ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showNewTransaction ? "Cancel" : "New Transaction"}
            </button>
          </div>

          {showNewTransaction && !txSuccess && (
            <form onSubmit={handleNewTransaction} className="rounded-xl border border-default bg-card p-5 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Customer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Customer Name *" required value={txForm.customer_name} onChange={(e) => setTxForm((f) => ({ ...f, customer_name: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                <input type="text" placeholder="Phone (07XXXXXXXX) *" required value={txForm.customer_phone} onChange={(e) => setTxForm((f) => ({ ...f, customer_phone: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
                <input type="email" placeholder="Email (optional)" value={txForm.customer_email} onChange={(e) => setTxForm((f) => ({ ...f, customer_email: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              </div>

              <h3 className="text-sm font-bold text-foreground pt-2">Order Items</h3>
              {txItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={item.product_id || ""}
                    onChange={(e) => selectProductForItem(idx, e.target.value)}
                    className="flex-1 bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>KES {p.price.toLocaleString()} — {p.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Product name"
                    value={item.product_name}
                    onChange={(e) => updateTxItem(idx, "product_name", e.target.value)}
                    className="flex-[2] bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                  />
                  <input type="number" placeholder="Qty" min="1" value={item.quantity} onChange={(e) => updateTxItem(idx, "quantity", e.target.value)} className="w-20 bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
                  <input type="number" placeholder="Price" min="0" value={item.unit_price} onChange={(e) => updateTxItem(idx, "unit_price", e.target.value)} className="w-28 bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
                  <span className="text-sm text-foreground font-medium w-24 text-right">KES {(item.quantity * item.unit_price).toLocaleString()}</span>
                  {txItems.length > 1 && (
                    <button type="button" onClick={() => removeTxItem(idx)} className="text-red-500 hover:text-red-400 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTxItem} className="text-xs text-accent hover:underline">+ Add another item</button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Delivery Fee (KES)</label>
                  <input type="number" min="0" value={txForm.delivery_fee} onChange={(e) => setTxForm((f) => ({ ...f, delivery_fee: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">M-Pesa Reference *</label>
                  <input type="text" placeholder="QGH4X7K9P2" required maxLength={10} value={txForm.mpesa_reference} onChange={(e) => setTxForm((f) => ({ ...f, mpesa_reference: e.target.value.toUpperCase() }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent uppercase" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Order Notes</label>
                  <textarea placeholder="Optional notes" rows={1} value={txForm.notes} onChange={(e) => setTxForm((f) => ({ ...f, notes: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-default">
                <div className="text-sm text-muted-foreground">
                  Subtotal: <span className="text-foreground font-medium">KES {computeSubtotal().toLocaleString()}</span>
                  {" | "}Delivery: <span className="text-foreground font-medium">KES {(parseInt(txForm.delivery_fee) || 0).toLocaleString()}</span>
                  {" | "}Total: <span className="text-accent font-bold text-base">KES {computeTotal().toLocaleString()}</span>
                </div>
                <button type="submit" disabled={saving} className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {saving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />}
                  Record Transaction
                </button>
              </div>
            </form>
          )}

          {txSuccess && (
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-lg font-bold text-green-500">Transaction Recorded!</p>
                <p className="text-sm text-muted-foreground mt-1">Receipt: {txSuccess.receiptNumber}</p>
                <p className="text-sm text-foreground font-medium">KES {txSuccess.total.toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/254${txSuccess.customerPhone.replace(/^0+/, "")}?text=${encodeURIComponent(`Hi ${txSuccess.customerName}! ✅ Your payment of KES ${txSuccess.total.toLocaleString()} has been confirmed. View your Trivo Kenya receipt here: https://trivokenya.store/receipt/${txSuccess.receiptNumber} Thank you for your order! 🛍️`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-500 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Send via WhatsApp
                </a>
                {txSuccess.customerEmail && (
                  <button
                    onClick={async () => {
                      try {
                        await sendReceiptEmail({
                          to: txSuccess.customerEmail as string,
                          receiptNumber: txSuccess.receiptNumber,
                          customerName: txSuccess.customerName,
                          items: txItems,
                          subtotal: computeSubtotal(),
                          deliveryFee: parseInt(txForm.delivery_fee) || 0,
                          total: txSuccess.total,
                          mpesaReference: txForm.mpesa_reference,
                        });
                        addToast("Receipt sent via email", "success");
                      } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : "Failed to send email";
                        addToast(msg, "error");
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" /> Send via Email
                  </button>
                )}
                <a
                  href={`/receipt/${txSuccess.receiptNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-default px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> View Receipt
                </a>
              </div>
              <button onClick={resetTxForm} className="text-xs text-muted hover:text-foreground underline">Record another transaction</button>
            </div>
          )}
        </div>

        {/* All Transactions Table */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">All Transactions</h2>
          <div className="overflow-x-auto rounded-xl border border-default bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase text-muted-foreground border-b border-default">
                <tr>
                  <th className="px-4 py-3">Receipt No.</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">M-Pesa Ref</th>
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
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.mpesa_reference}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                          className={`text-[11px] font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer ${statusColor(o.status)}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <a href={`/receipt/${o.receipt_number}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors mr-3">
                          <ExternalLink className="h-3.5 w-3.5" /> Receipt
                        </a>
                        <button onClick={() => { setDeleteTarget(o); setDeleteType("order"); }} className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      )}

      {/* ============ IMPORT TAB ============ */}
      {tab === "import" && (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Import from CJ Dropshipping</h2>
          {cjProduct && (
            <button
              onClick={() => { setCjProduct(null); setCjError(""); setCjInput(""); setCjImportSuccess(null); }}
              className="flex items-center gap-2 rounded-lg border border-default px-4 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}
        </div>

        {cjImportSuccess ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20">
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div>
              <p className="text-lg font-bold text-green-500">Product added!</p>
              <p className="text-sm text-muted-foreground mt-1">It's now live on the store.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`/products/${cjImportSuccess.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
              >
                <Eye className="h-3.5 w-3.5" /> View on store
              </a>
              <button
                onClick={() => { setCjProduct(null); setCjError(""); setCjInput(""); setCjImportSuccess(null); }}
                className="inline-flex items-center gap-2 rounded-lg border border-default px-4 py-2.5 text-xs font-medium text-foreground hover:bg-surface transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Import another product
              </button>
            </div>
          </div>
        ) : !cjProduct ? (
          /* STEP 1 — Paste CJ Link */
          <div className="rounded-xl border border-default bg-card p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste a CJ Dropshipping product URL or product ID to fetch its details.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Paste CJ product URL or product ID"
                value={cjInput}
                onChange={(e) => { setCjInput(e.target.value); setCjError(""); }}
                className="flex-1 bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
              <button
                onClick={async () => {
                  const { extractProductId } = await import("@/lib/cj-utils");
                  const pid = extractProductId(cjInput);
                  if (!pid) { setCjError("Invalid CJ URL or product ID"); return; }
                  setCjFetching(true);
                  setCjError("");
                  try {
                    const res = await fetch(`/api/cj/product?pid=${encodeURIComponent(pid)}`);
                    const data = await res.json();
                    if (!res.ok) { setCjError(data.error || "Product not found. Check the URL and try again."); return; }
                    setCjProduct(data);
                    setCjImportForm({
                      name: data.productName,
                      description: data.description,
                      sellPrice: data.sellPrice.toString(),
                      mainImage: data.productImage,
                      selectedImages: data.productImageSet,
                      category: ["Audio","Car Accessories","Smart Home","Cables","Lighting"].includes(data.categoryName) ? data.categoryName : "Other",
                      is_featured: false,
                      stock: "0",
                    });
                  } catch {
                    setCjError("Failed to fetch product. Check the URL and try again.");
                  }
                  setCjFetching(false);
                }}
                disabled={cjFetching || !cjInput.trim()}
                className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cjFetching ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching from CJ...</>
                ) : (
                  "Fetch Product"
                )}
              </button>
            </div>
            {cjError && <p className="text-xs text-red-400">{cjError}</p>}
          </div>
        ) : (
          /* STEP 2 — Preview + Edit */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN — Product preview from CJ */}
            <div className="rounded-xl border border-default bg-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">CJ Product Preview</h3>
              <div className="relative aspect-square rounded-lg overflow-hidden bg-surface">
                {cjImportForm.mainImage ? (
                  <Image src={cjImportForm.mainImage} alt={cjImportForm.name} fill className="object-cover" sizes="400px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">No image</div>
                )}
              </div>
              {cjImportForm.selectedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {cjImportForm.selectedImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCjImportForm((f) => ({ ...f, mainImage: img }))}
                      className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        cjImportForm.mainImage === img ? "border-blue-500" : "border-transparent hover:border-default"
                      }`}
                    >
                      <Image src={img} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
              <div>
                <input
                  type="text"
                  value={cjImportForm.name}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-default rounded-lg px-3 py-2 text-sm font-medium text-foreground focus:outline-none focus:border-accent"
                />
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  CJ Price: <span className="text-foreground font-medium">${cjProduct.sellPrice.toFixed(2)} USD</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  (≈ KES {Math.round(cjProduct.sellPrice * 130).toLocaleString()} at current rate)
                </p>
                <p className="text-muted-foreground">
                  Weight: <span className="text-foreground font-medium">{cjProduct.weight}g</span>
                </p>
              </div>
              <div>
                <textarea
                  value={cjImportForm.description}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, description: e.target.value }))}
                  rows={5}
                  className="w-full bg-background border border-default rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>
            </div>

            {/* RIGHT COLUMN — Store settings */}
            <div className="rounded-xl border border-default bg-card p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Store Settings</h3>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Product Name</label>
                <input
                  type="text"
                  value={cjImportForm.name}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                <textarea
                  value={cjImportForm.description}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  Your KES Selling Price <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 4500"
                    value={cjImportForm.sellPrice}
                    onChange={(e) => setCjImportForm((f) => ({ ...f, sellPrice: e.target.value }))}
                    className="w-full bg-background border border-default rounded-lg px-4 py-2.5 pr-12 text-sm text-foreground focus:outline-none focus:border-accent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">KSh</span>
                </div>
                {cjImportForm.sellPrice && parseFloat(cjImportForm.sellPrice) > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] text-muted-foreground">
                      Supplier cost ≈ KES {Math.round(cjProduct.sellPrice * 130).toLocaleString()} + cargo ≈ KES 400 = landed cost ≈ KES {(Math.round(cjProduct.sellPrice * 130) + 400).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Your margin at this price: KES {(parseFloat(cjImportForm.sellPrice) - (Math.round(cjProduct.sellPrice * 130) + 400)).toLocaleString()} ({((parseFloat(cjImportForm.sellPrice) - (Math.round(cjProduct.sellPrice * 130) + 400)) / parseFloat(cjImportForm.sellPrice) * 100).toFixed(0)}%)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category</label>
                <select
                  value={cjImportForm.category}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-2">Main Image</label>
                <div className="flex gap-2 overflow-x-auto">
                  {cjImportForm.selectedImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCjImportForm((f) => ({ ...f, mainImage: img }))}
                      className={`relative h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                        cjImportForm.mainImage === img ? "border-blue-500" : "border-transparent hover:border-default"
                      }`}
                    >
                      <Image src={img} alt={`Option ${i + 1}`} fill className="object-cover" sizes="64px" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cj-featured"
                  checked={cjImportForm.is_featured}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="h-4 w-4 rounded border-default bg-surface text-accent focus:ring-accent"
                />
                <label htmlFor="cj-featured" className="text-xs text-muted cursor-pointer">Set as Featured Product</label>
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={cjImportForm.stock}
                  onChange={(e) => setCjImportForm((f) => ({ ...f, stock: e.target.value }))}
                  className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-accent"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Set to 0 if you haven't received stock yet. Update after your first shipment arrives.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={async () => {
                    if (!cjImportForm.sellPrice || parseFloat(cjImportForm.sellPrice) <= 0) {
                      setCjError("Please enter a selling price");
                      return;
                    }
                    setCjImporting(true);
                    setCjError("");
                    try {
                      const fd = new FormData();
                      fd.set("name", cjImportForm.name);
                      fd.set("description", cjImportForm.description);
                      fd.set("price", cjImportForm.sellPrice);
                      fd.set("stock", cjImportForm.stock);
                      fd.set("category", cjImportForm.category);
                      fd.set("image_url", cjImportForm.mainImage);
                      fd.set("is_featured", cjImportForm.is_featured ? "true" : "false");
                      fd.set("seo_title", cjImportForm.name);
                      fd.set("seo_description", cjImportForm.description.slice(0, 160));
                      fd.set("focus_keyword", "");
                      fd.set("cj_product_id", cjProduct.pid);
                      await createProduct(fd);
                      await refresh();
                      const newProduct = products.find((p) => p.cj_product_id === cjProduct.pid);
                      setCjImportSuccess({ id: newProduct?.id || "", name: cjImportForm.name });
                      addToast("Product added! It's now live on the store.", "success");
                    } catch (err: unknown) {
                      const message = err instanceof Error ? err.message : "Failed to add product";
                      setCjError(message);
                    }
                    setCjImporting(false);
                  }}
                  disabled={cjImporting}
                  className="flex-1 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cjImporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add to Store
                </button>
                <button
                  onClick={() => { setCjProduct(null); setCjError(""); setCjInput(""); }}
                  className="text-xs text-muted hover:text-foreground underline"
                >
                  Cancel
                </button>
              </div>
              {cjError && <p className="text-xs text-red-400">{cjError}</p>}
            </div>
          </div>
        )}
      </section>
      )}

      {/* ============ VENDORS TAB ============ */}
      {tab === "vendors" && (
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Vendors</h2>
          <button
            onClick={() => { resetVendorForm(); setShowAddVendor((v) => !v); }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
          >
            {showAddVendor ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddVendor ? "Cancel" : "Add Vendor"}
          </button>
        </div>

        {showAddVendor && (
          <form onSubmit={handleVendorSubmit} className="rounded-xl border border-default bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Business Name *" required value={vForm.business_name} onChange={(e) => setVForm((f) => ({ ...f, business_name: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              <input type="text" placeholder="Contact Name *" required value={vForm.name} onChange={(e) => setVForm((f) => ({ ...f, name: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              <input type="email" placeholder="Email * (becomes login)" required value={vForm.email} onChange={(e) => setVForm((f) => ({ ...f, email: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
              <input type="text" placeholder="Phone" value={vForm.phone} onChange={(e) => setVForm((f) => ({ ...f, phone: e.target.value }))} className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={resetVendorForm} className="rounded-lg border border-default px-5 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-black border-t-transparent" />}
                {editingVendorId ? "Update Vendor" : "Add Vendor"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-default bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground border-b border-default">
              <tr>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id} className="border-b border-subtle hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{v.business_name || v.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{v.phone || "—"}</td>
                  <td className="px-4 py-3 text-foreground">{productCountForVendor(v.id)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium rounded-full px-2.5 py-1 ${
                      v.status === "active" ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEditVendor(v)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors mr-3">
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => { setDeleteTarget(v); setDeleteType("vendor"); }} className="inline-flex items-center gap-1 text-xs text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No vendors yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* Subscribers Section (always visible below tabs) */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">Subscribers</h2>
        <div className="overflow-x-auto rounded-xl border border-default bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase text-muted-foreground border-b border-default">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 w-48">Date Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={i} className="border-b border-subtle last:border-0 hover:bg-surface/20 transition-colors">
                  <td className="px-4 py-3 text-foreground">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(s.subscribed_at)}</td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr><td colSpan={2} className="px-4 py-10 text-center text-sm text-muted-foreground">No subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {loading && (
        <div className="flex justify-center py-4">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl border border-default bg-card p-6 shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-2">Delete {deleteType === "product" ? "Product" : deleteType === "order" ? "Order" : "Vendor"}</h3>
            <p className="text-sm text-muted mb-6">
              {deleteType === "product" && <>Delete <span className="font-medium text-foreground">{(deleteTarget as Product).name}</span>? This cannot be undone.</>}
              {deleteType === "order" && <>Delete order <span className="font-medium text-foreground">{(deleteTarget as AdminOrder).receipt_number}</span>? This cannot be undone.</>}
              {deleteType === "vendor" && <>Delete vendor <span className="font-medium text-foreground">{(deleteTarget as Vendor).business_name || (deleteTarget as Vendor).name}</span>? This cannot be undone.</>}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-lg border border-default px-5 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors disabled:opacity-50">Cancel</button>
              <button
                onClick={deleteType === "product" ? confirmDeleteProduct : deleteType === "order" ? confirmDeleteOrder : confirmDeleteVendor}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-lg px-5 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-right ${t.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
            {t.message}
          </div>
        ))}
      </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  warning,
  valueRed,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  warning?: boolean;
  valueRed?: boolean;
}) {
  const isWarning = warning && typeof value === "number" && value > 0;
  return (
    <div className="rounded-xl border border-default bg-card p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${isWarning ? "bg-red-500/20 text-red-500" : "bg-surface text-muted"}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-xl font-bold ${valueRed && isWarning ? "text-red-500" : "text-foreground"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
