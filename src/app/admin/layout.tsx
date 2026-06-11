import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the current URL from the request headers to detect login page.
  // Next.js sets x-invoke-path, or we can read x-url / x-pathname from middleware.
  // As a reliable fallback we also check the referer and next-url headers.
  const headersList = headers();
  const pathname =
    headersList.get("x-next-url") ||
    headersList.get("x-invoke-path") ||
    headersList.get("x-middleware-invoke") ||
    "";

  // If the request is for the login page, skip auth checks entirely.
  // The login page has its own layout that renders children directly.
  // We must NOT redirect here or we create an infinite loop.
  const isLoginPage = pathname.startsWith("/admin/login");

  if (!isLoginPage) {
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
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
