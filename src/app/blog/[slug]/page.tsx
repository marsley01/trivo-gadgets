import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createClient as createStaticClient } from "@supabase/supabase-js";
import { Calendar, ChevronRight, Clock, ArrowLeft, Share2 } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

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
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
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
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo_title || `${post.title} | Trivo Kenya`,
      description: post.seo_description || post.excerpt || "",
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
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
      <article className="container mx-auto px-4 md:px-8 py-8 md:py-16">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-accent transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Store
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="max-w-3xl mx-auto">
          {post.cover_image_url && (
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-surface mb-10 shadow-lg">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white/90">
                  <Clock className="h-3 w-3" />
                  {readTime} min read
                </span>
              </div>
            </div>
          )}

          <header className="mb-10">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
              {!post.cover_image_url && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {readTime} min read
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.08] mb-6">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed border-l-4 border-accent/30 pl-5 italic">
                {post.excerpt}
              </p>
            )}
          </header>

          {post.content && (
            <div
              className="blog-content prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-muted-foreground prose-p:mb-5 prose-a:text-accent prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md prose-img:my-8 prose-strong:text-foreground prose-strong:font-bold prose-code:bg-surface prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:text-accent prose-pre:bg-surface prose-pre:border prose-pre:border-default prose-pre:shadow-sm prose-li:text-muted-foreground prose-li:leading-relaxed prose-table:w-full prose-table:border-collapse prose-th:bg-surface prose-th:text-foreground prose-th:text-left prose-th:px-4 prose-th:py-3 prose-th:text-sm prose-th:font-bold prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-muted-foreground prose-td:border-b prose-td:border-subtle prose-tr:last:prose-td:border-b-0 prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-default prose-table:my-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          <div className="mt-12 pt-8 border-t border-subtle flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-accent hover:gap-3 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
            <button
              onClick={async () => {
                try {
                  await navigator.share({
                    title: post.title,
                    text: post.excerpt || `Check out this article from Trivo Kenya`,
                    url: window.location.href,
                  });
                } catch {
                  await navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="max-w-5xl mx-auto mt-16 pt-10 border-t border-subtle">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              <div className="flex-1 h-px bg-subtle" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group rounded-xl border border-subtle/20 bg-card p-3 hover:border-accent/30 transition-all hover:-translate-y-0.5"
                >
                  {p.image_url && (
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-surface mb-3">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-sm font-bold text-accent mt-1">KES {p.price.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

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
