import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Calendar, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tech Guides & Reviews",
  description: "Read the latest tech guides, product reviews, and gadget tips from Trivo Kenya. Stay ahead with premium tech insights.",
  openGraph: {
    title: "Blog | Trivo Kenya",
    description: "Tech guides, product reviews, and gadget tips from Trivo Kenya.",
    url: "https://trivokenya.store/blog",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
    images: [{ url: "https://trivokenya.store/og-image.jpg", width: 1200, height: 630 }],
  },
  alternates: {
    canonical: "https://trivokenya.store/blog",
  },
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-accent transition-colors">Store</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Blog</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Tech guides, product reviews, and tips to help you get the most out of your gadgets.
          </p>
        </div>

        {(!posts || posts.length === 0) && (
          <div className="text-center py-24">
            <h3 className="text-lg font-bold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted text-sm">Check back soon for new articles.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts?.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden bg-card border border-subtle/20 hover:border-accent/30 transition-all hover:-translate-y-1"
            >
              {post.cover_image_url && (
                <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
