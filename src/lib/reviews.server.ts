import { createClient } from "@/lib/supabase/server";
import type { Review } from "./reviews";

export async function getServerReviews(productId?: string): Promise<Review[]> {
  const supabase = createClient();
  let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (productId) {
    query = query.eq("product_id", productId);
  }
  const { data } = await query;
  return (data as Review[]) || [];
}
