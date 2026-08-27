"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import { getReviews, addReview, getAverageRating, type Review } from "@/lib/reviews";

export default function ReviewsSection({ productId, productName }: { productId: string; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getReviews(productId).then(setReviews).catch(() => setError("Failed to load reviews"));
    getAverageRating(productId).then(setAvgRating).catch(() => {});
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await addReview({ product_id: productId, customer_name: name, rating, text });
      if (!result) { setError("Failed to submit review. Please try again."); setSubmitting(false); return; }
      const updated = await getReviews(productId);
      setReviews(updated);
      setAvgRating(await getAverageRating(productId));
      // Notify admin
      const notifyController = new AbortController();
      setTimeout(() => notifyController.abort(), 5000);
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "review", productName, customerName: name, rating, text }),
        signal: notifyController.signal,
      }).catch(() => {});
      setName("");
      setRating(5);
      setText("");
      setShowForm(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <section className="mt-24">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length > 0 ? (
              <>
                <span className="inline-flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                  ))}
                </span>
                <span className="ml-2">{avgRating} out of 5 ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
              </>
            ) : (
              "Be the first to review this product"
            )}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-full bg-accent text-black px-5 py-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
        >
          <MessageSquare className="h-4 w-4" />
          Write a Review
        </button>
      </div>

      {submitted && (
        <div className="mb-6 rounded-xl bg-green-500/10 border border-green-500/20 px-5 py-3 text-sm text-green-400">
          Thank you! Your review has been submitted.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-default bg-card/50 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John D."
                required
                className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Rating</label>
              <div className="flex items-center gap-1 pt-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                    <Star className={`h-6 w-6 ${s <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Your Review</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`How was your experience with ${productName}?`}
              required
              rows={3}
              className="w-full bg-background border border-default rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-full border border-default px-5 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-accent text-black px-5 py-2 text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">No reviews yet. Be the first to share your experience!</p>
        </div>
      )}
    </section>
  );
}
