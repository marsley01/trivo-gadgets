import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Calendar, ChevronRight, Clock, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Tech Guides & Reviews – Trivo Kenya",
  description: "Read the latest tech guides, product reviews, and gadget tips from Trivo Kenya. Stay ahead with premium tech insights.",
  openGraph: {
    title: "Blog | Trivo Kenya",
    description: "Tech guides, product reviews, and gadget tips from Trivo Kenya.",
    url: "https://trivokenya.store/blog",
    siteName: "Trivo Kenya",
    locale: "en_KE",
    type: "website",
    images: [{ url: "/logo-transparent.svg", width: 1200, height: 630 }],
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

  const featured = posts?.[0] ?? null;
  const rest = posts?.slice(1) ?? [];

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-8 md:py-16">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-accent transition-colors">Store</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">Blog</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4 leading-[1.05]">Blog</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Tech guides, product reviews, and tips to help you get the most out of your gadgets in Kenya.
          </p>
        </div>

        {(!posts || posts.length === 0) && (
          <div className="text-center py-24">
            <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-surface flex items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted text-sm max-w-md mx-auto">We are working on fresh tech content for you. Check back soon for reviews, guides, and the latest gadget news.</p>
          </div>
        )}

        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block mb-12 rounded-2xl overflow-hidden bg-card border border-subtle/20 hover:border-accent/30 transition-all"
          >
            <div className="grid md:grid-cols-2 gap-0">
              {featured.cover_image_url && (
                <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[400px] overflow-hidden bg-surface">
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
                </div>
              )}
              <div className="flex flex-col justify-center p-6 md:p-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-3">
                  Featured Post
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground group-hover:text-accent transition-colors leading-[1.1] mb-4">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                    {featured.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(featured.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {Math.max(1, Math.ceil((featured.content?.length || 0) / 3000))} min read
                  </span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-accent group-hover:gap-3 transition-all">
                  Read Article <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-bold text-foreground">Latest Articles</h2>
              <div className="flex-1 h-px bg-subtle" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl overflow-hidden bg-card border border-subtle/20 hover:border-accent/30 transition-all hover:-translate-y-1"
                >
                  {post.cover_image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-surface">
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
                    <h2 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-accent group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
