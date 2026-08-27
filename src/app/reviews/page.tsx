"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Star, MessageSquare, ChevronRight } from "lucide-react";
import { getReviews, type Review } from "@/lib/reviews";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReviews()
      .then(setReviews)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-8 py-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
            <Link href="/" className="hover:text-accent transition-colors">Store</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Customer Reviews</span>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-6 w-6 text-accent" />
            <h1 className="text-3xl font-extrabold text-foreground">Customer Reviews</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Real feedback from Trivo Kenya customers ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MessageSquare className="h-16 w-16 text-red-400/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
              <p className="text-muted text-sm max-w-md mb-6">{error}</p>
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-subtle/20 bg-card/50 p-6 space-y-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`h-4 w-4 ${s < review.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">{review.customer_name}</span>
                    <span>{new Date(review.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">No reviews yet</h3>
              <p className="text-muted text-sm max-w-md mb-6">
                Reviews from our customers will appear here. Shop with us and share your experience!
              </p>
              <Link
                href="/"
                className="rounded-full bg-accent text-black px-6 py-2.5 text-sm font-bold transition-all hover:scale-105 active:scale-95"
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
