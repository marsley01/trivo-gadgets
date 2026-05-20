import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  // Check admin_users table for role verification
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("email", user.email)
    .single();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
