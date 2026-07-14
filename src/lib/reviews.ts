export type Review = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  text: string;
  created_at: string;
};

export async function getReviews(productId?: string): Promise<Review[]> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    let query = supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (productId) {
      query = query.eq("product_id", productId);
    }
    const { data } = await query;
    return (data as Review[]) || [];
  } catch {
    return [];
  }
}

export async function addReview(review: Omit<Review, "id" | "created_at">): Promise<Review | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase.from("reviews").insert(review).select().single();
    return data as Review | null;
  } catch {
    return null;
  }
}

export async function getAverageRating(productId: string): Promise<number> {
  try {
    const reviews = await getReviews(productId);
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  } catch {
    return 0;
  }
}
