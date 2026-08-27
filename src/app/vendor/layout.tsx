import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-middleware-supabase-url") || "";

  // The /vendor page itself is the login page — skip auth check there.
  // We detect this by checking if we're NOT on a /vendor/dashboard or deeper path.
  // Next.js layouts nest, so /vendor/dashboard will hit this layout too.
  // We use cookies to read the URL from the request.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no user, only block /vendor/dashboard routes (not the /vendor login page itself)
  // The middleware already handles redirecting /vendor/dashboard -> /vendor when not logged in.
  // This layout just provides the shell.

  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
