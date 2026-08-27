import { ImageResponse } from "next/og";
import { createClient as createStaticClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const alt = "Trivo Kenya Product Preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createStaticClient(url, key, { auth: { persistSession: false } });

  const { data: product } = await supabase
    .from("products")
    .select("name, description, price, image_url, brand, stock, category")
    .eq("slug", slug)
    .single();

  const name = product?.name || "Premium Gadget";
  const brand = product?.brand || "Trivo";
  const price = product?.price ? `KES ${product.price.toLocaleString()}` : "Price on Request";
  const imageUrl = product?.image_url || "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop";
  const stock = product?.stock !== undefined ? product.stock : 5;
  const isAvailable = stock > 0;

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
          background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
          padding: "60px",
          position: "relative",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.12)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "rgba(249, 115, 22, 0.08)",
            filter: "blur(120px)",
            display: "flex",
          }}
        />

        {/* Left Column (Brand + Name + Price + Action) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "55%",
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
                letterSpacing: "0.25em",
                textTransform: "uppercase",
              }}
            >
              TRIVO KENYA
            </span>
          </div>

          {/* Brand & Name & Price */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <span
              style={{
                color: "#3b82f6",
                fontWeight: "700",
                fontSize: "16px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {brand}
            </span>
            <h1
              style={{
                fontSize: "44px",
                fontWeight: "800",
                color: "#ffffff",
                lineHeight: "1.15",
                margin: 0,
                padding: 0,
                letterSpacing: "-0.02em",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </h1>

            {/* Price Pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  borderRadius: "100px",
                  padding: "10px 24px",
                  display: "flex",
                  boxShadow: "0 8px 16px rgba(249, 115, 22, 0.2)",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: "800", color: "#ffffff" }}>{price}</span>
              </div>

              {/* Stock status pill */}
              <div
                style={{
                  backgroundColor: isAvailable ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                  border: isAvailable ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "100px",
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: isAvailable ? "#10b981" : "#ef4444",
                  }}
                />
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: isAvailable ? "#34d399" : "#f87171",
                  }}
                >
                  {isAvailable ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ color: "#9ca3af", fontSize: "15px", fontWeight: "500" }}>
              Order via WhatsApp &middot; Pay on Delivery
            </span>
          </div>
        </div>

        {/* Right Column (Product Image Showcase) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40%",
            height: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: "32px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(255, 255, 255, 0.02)",
              padding: "20px",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "20px",
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
