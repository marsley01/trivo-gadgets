import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  const supabase = createStaticClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: posts } = await supabase.from("blog_posts").select("slug");
  return (posts || []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!post) return { title: "Post Not Found | Trivo Kenya" };

  return {
    title: post.seo_title || `${post.title} | Trivo Kenya Blog`,
    description: post.seo_description || post.excerpt || `Read ${post.title} on the Trivo Kenya blog.`,
    openGraph: {
      title: post.seo_title || `${post.title} — Trivo Kenya Blog`,
      description: post.seo_description || post.excerpt || "",
      url: `https://trivokenya.store/blog/${post.slug}`,
      siteName: "Trivo Kenya",
      type: "article",
      publishedTime: post.published_at,
      images: post.cover_image_url ? [{ url: post.cover_image_url, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || `${post.title} | Trivo Kenya`,
      description: post.seo_description || post.excerpt || "",
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const supabase = createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!post) notFound();

  let relatedProducts: {
    id: string; name: string; slug: string; price: number; image_url: string | null;
  }[] = [];
  if (post.related_product_ids && post.related_product_ids.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select("id, name, slug, price, image_url")
      .in("id", post.related_product_ids);
    relatedProducts = products || [];
  }

  const readTime = Math.max(1, Math.ceil((post.content?.length || 0) / 3000));

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-8 py-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-6">
          <Link href="/" className="hover:text-accent transition-colors">Store</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
        </nav>

        <article className="max-w-3xl mx-auto">
          {post.cover_image_url && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface mb-8">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <header className="mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {readTime} min read
              </span>
            </div>
          </header>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 pb-8 border-b border-subtle">
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-accent prose-img:rounded-xl prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-surface prose-pre:border prose-pre:border-default mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {relatedProducts.length > 0 && (
          <section className="max-w-5xl mx-auto mt-16 pt-8 border-t border-subtle">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group rounded-xl border border-subtle/20 bg-card p-3 hover:border-accent/30 transition-all"
                >
                  {p.image_url && (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface mb-3">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-sm font-bold text-accent mt-1">KES {p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt || post.seo_description || "",
            image: post.cover_image_url || undefined,
            datePublished: post.published_at,
            dateModified: post.published_at,
            author: {
              "@type": "Organization",
              name: "Trivo Kenya",
              url: "https://trivokenya.store",
            },
            publisher: {
              "@type": "Organization",
              name: "Trivo Kenya",
              logo: {
                "@type": "ImageObject",
                url: "https://trivokenya.store/favicon.svg",
              },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://trivokenya.store/blog/${post.slug}`,
            },
          }),
        }}
      />
    </main>
  );
}
