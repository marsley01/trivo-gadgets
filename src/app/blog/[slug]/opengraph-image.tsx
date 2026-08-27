import { ImageResponse } from "next/og";
import { createClient as createStaticClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Trivo Kenya Blog Post Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createStaticClient(url, key, { auth: { persistSession: false } });

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, cover_image_url, published_at")
    .eq("slug", slug)
    .single();

  const title = post?.title || "Trivo Kenya Blog";
  const excerpt = post?.excerpt || "Read the latest tech guides, product reviews, and gadget tips from Trivo Kenya.";
  const coverImage = post?.cover_image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop";

  const dateStr = post?.published_at
    ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "Latest Update";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #030712 0%, #0c111d 100%)",
          padding: "60px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(37, 99, 235, 0.12)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            right: "-150px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.08)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />

        {/* Left Column (Meta + Title + Excerpt) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "60%",
            height: "100%",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                background: "linear-gradient(90deg, #f97316 0%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
                fontWeight: "900",
                fontSize: "20px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              TRIVO KENYA
            </span>
            <span style={{ color: "#4b5563", fontSize: "18px" }}>|</span>
            <span style={{ color: "#9ca3af", fontWeight: "600", fontSize: "16px", letterSpacing: "0.1em" }}>
              TECH BLOG
            </span>
          </div>

          {/* Title & Excerpt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", margin: "40px 0" }}>
            <h1
              style={{
                fontSize: "46px",
                fontWeight: "800",
                color: "#ffffff",
                lineHeight: "1.15",
                margin: 0,
                padding: 0,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "20px",
                color: "#9ca3af",
                lineHeight: "1.5",
                margin: 0,
                padding: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {excerpt}
            </p>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Published on
              </span>
              <span style={{ color: "#ffffff", fontSize: "15px", fontWeight: "600" }}>{dateStr}</span>
            </div>
            <div style={{ width: "1px", height: "30px", backgroundColor: "#374151" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Read at
              </span>
              <span style={{ color: "#f97316", fontSize: "15px", fontWeight: "600" }}>trivokenya.store</span>
            </div>
          </div>
        </div>

        {/* Right Column (Cover Image Preview Card) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "35%",
            height: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1.2",
              borderRadius: "24px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "16px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Image container */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "16px",
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
