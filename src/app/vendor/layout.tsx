import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/vendor");
  }

  // Verify user is a vendor
  if (!user.email) redirect("/vendor");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, business_name, status")
    .eq("email", user.email)
    .single();

  if (!vendor) {
    redirect("/vendor");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
