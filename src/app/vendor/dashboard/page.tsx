import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VendorDashboardClient from "./VendorDashboardClient";

export const dynamic = "force-dynamic";

async function getVendor() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/vendor");

  if (!user.email) redirect("/vendor");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!vendor) redirect("/vendor");
  if (vendor.status === "suspended") redirect("/vendor");

  return vendor;
}

export default async function VendorDashboard() {
  const vendor = await getVendor();

  return <VendorDashboardClient vendor={vendor} />;
}
