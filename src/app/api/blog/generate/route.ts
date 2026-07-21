import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { rateLimit } from "@/lib/rate-limiter";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert tech blog writer for Trivo Kenya (trivokenya.store), a premium gadgets store in Nairobi, Kenya. Your job is to write engaging, informative blog posts about tech products that rank on Google Kenya and drive organic traffic.

BRAND VOICE
- Professional but conversational — like a knowledgeable tech enthusiast sharing insights
- Specific, detailed, and honest about specs and real-world use
- Never use filler phrases like "game-changer", "revolutionary", or "you won't believe"
- Include practical Kenyan context (e.g., "works with Kenya's 4G/5G networks", "available with M-Pesa")

FOR EVERY PRODUCT BLOG POST, GENERATE:

1. TITLE
- Click-worthy but not clickbait. Include the product name and key benefit.
- 50-65 characters. Example: "Xiaomi Watch S3 Review: Premium Smartwatch Under 15K in Kenya"

2. SLUG
- URL-friendly, lowercase, hyphens instead of spaces. 4-6 words.
- Example: "xiaomi-watch-s3-review-kenya"

3. EXCERPT
- 2-3 sentences (30-50 words) summarizing the post. Include product name and Kenya context.

4. CONTENT (full HTML blog post, 500-800 words)
Structure:
- <h2>Introduction</h2> (2-3 paragraphs setting context — what is this product, why does it matter in Kenya)
- <h2>Key Specifications</h2> (table with specs like display, battery, processor, camera, connectivity — at least 6 rows using <table><thead><tr><th>Spec</th><th>Detail</th></tr></thead><tbody><tr><td>...</td></tr></tbody></table>)
- <h2>Design & Build</h2> (2 paragraphs about look, feel, build quality, what's in the box)
- <h2>Performance</h2> (2-3 paragraphs about real-world performance, speed, battery life, software)
- <h2>Where to Buy in Kenya</h2> (1-2 paragraphs about Trivo Kenya, pricing, M-Pesa, delivery, warranty)
- <h2>Verdict</h2> (1-2 paragraphs final recommendation, who should buy it)
- Include <img> tags with placeholder Unsplash URLs using relevant search terms: https://images.unsplash.com/photo-XXXXX?w=800&auto=format&fit=crop
  Use real Unsplash photo IDs from this list for tech photos:
  - 1468498841-36c1a0e3a5ca (gadgets on desk)
  - 1498050108023-c5249f4df085 (laptop/tablet)
  - 1511707171634-5f897ff02aa9 (phone on table)
  - 1550745165-9bc0b252726f (tech setup)
  - 1461749280684-dccba630e2f6 (circuit board)
  - 1518770660439-4636190af475 (smartwatch/tech)
  - 1563772076637-4a9f5b7f5b5f (headphones)
  - 1505740420928-5e560c06d30e (earbuds)
  - 1546868871-af0c0e0b1f5e (speaker)
  - 1550686041-c9cf8e0b1f5b (camera gear)
  Each <img> must have alt text and class="w-full rounded-lg my-4"

5. SEO TITLE (55-65 chars, includes primary keyword + "Kenya")

6. SEO DESCRIPTION (145-160 chars, includes primary keyword + benefit + "Trivo Kenya")

Return ONLY valid JSON with these fields: title, slug, excerpt, content, seo_title, seo_description, unsplash_keywords (comma-separated list of 5-8 Unsplash search terms for this product).

No markdown formatting, no code fences, just raw JSON.`;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    // Admin-only: verify the user is in admin_users table
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("id")
      .eq("email", user.email)
      .single();
    if (!adminUser) {
      return NextResponse.json({ error: "Forbidden: admin access required." }, { status: 403 });
    }

    const rawIp = req.headers.get("x-forwarded-for") || user.id;
    const ip = rawIp.split(",")[0].trim();
    const { allowed, retryAfter } = rateLimit(`blog-generate:${ip}`, 10, 60000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute." },
        { status: 429, headers: { "Retry-After": retryAfter.toString() } }
      );
    }

    const { productId, productName, productSpecs } = await req.json();

    if (!productName && !productId) {
      return NextResponse.json({ error: "productName or productId is required" }, { status: 400 });
    }

    let productInfo = productName;
    if (productId && !productName) {
      const { data: product } = await supabase
        .from("products")
        .select("name, description, category, price, specs")
        .eq("id", productId)
        .single();
      if (product) {
        productInfo = `Product: ${product.name}\nDescription: ${product.description || ""}\nCategory: ${product.category || ""}\nPrice: KES ${product.price?.toLocaleString() || ""}\nSpecs: ${JSON.stringify(product.specs || {})}`;
      } else {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
    }

    const prompt = `Write a detailed SEO-optimized blog post for this tech product:\n\n${productInfo}\n\nMake it informative, engaging for Kenyan readers, and include real specifications and buying advice.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const { text } = await generateText({
      model: openrouter("google/gemini-2.5-flash"),
      maxOutputTokens: 4096,
      system: SYSTEM_PROMPT,
      prompt,
      abortSignal: controller.signal,
    });

    clearTimeout(timeout);

    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({
      title: String(result.title || "").slice(0, 200),
      slug: String(result.slug || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 100),
      excerpt: String(result.excerpt || "").slice(0, 500),
      content: String(result.content || ""),
      seo_title: String(result.seo_title || "").slice(0, 65),
      seo_description: String(result.seo_description || "").slice(0, 160),
      unsplash_keywords: String(result.unsplash_keywords || ""),
    });
  } catch (err: unknown) {
    console.error("Blog Generate Error:", err);
    return NextResponse.json({ error: "Blog generation failed. Check OPENROUTER_API_KEY." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Use POST" }, { status: 405 });
}
