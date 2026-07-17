import { getAdminStatsFull, getAdminProducts, getAdminSubscribers, getAllOrders, getVendors, getBlogPosts, getHeroSlides } from "@/lib/actions/admin";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, products, subscribers, orders, vendors, blogPosts, heroSlides] = await Promise.all([
    getAdminStatsFull(),
    getAdminProducts(),
    getAdminSubscribers(),
    getAllOrders(),
    getVendors(),
    getBlogPosts(),
    getHeroSlides(),
  ]);

  return (
    <AdminDashboardClient
      initialStats={stats}
      initialProducts={products}
      initialSubscribers={subscribers}
      initialOrders={orders}
      initialVendors={vendors}
      initialBlogPosts={blogPosts}
      initialHeroSlides={heroSlides}
    />
  );
}
