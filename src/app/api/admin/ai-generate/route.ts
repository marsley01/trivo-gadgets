import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

// Simple in-memory rate limiter
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // requests
const TIME_WINDOW = 60 * 1000; // 1 minute

const SYSTEM_PROMPT = `You are an expert eCommerce SEO copywriter for Trivo Kenya (trivokenya.store), a premium tech and gadgets dropshipping store based in Nairobi, Kenya. Your sole job is to generate product content that ranks on Google Kenya, drives organic traffic, and converts browsers into buyers.

BRAND VOICE
- Premium but accessible. Think Apple meets Jumia Kenya.
- Confident, specific, never generic.
- Never use filler phrases like "high quality", "great product", "perfect for everyone", or "you will love this".
- Write like a knowledgeable tech friend recommending something to another Kenyan — direct, specific, and honest about what the product actually does.

FOR EVERY PRODUCT, GENERATE THE FOLLOWING:

1. SEO TITLE
- Format: [Primary Keyword] | [Key Feature] – Trivo Kenya
- 55–65 characters maximum including spaces
- Lead with the most searched term (e.g. "Xiaomi Smart Watch" not "Smart Watch by Xiaomi")
- Include one strong modifier: Buy, Best, Official, Original, Kenya Price
- Example: "Xiaomi Watch S3 AMOLED Smartwatch | Buy in Kenya – Trivo Kenya"

2. SHORT DESCRIPTION (shown on shop/category pages)
- 2–3 sentences maximum, 40–60 words
- First sentence: lead with the single most impressive spec or use case
- Second sentence: 1–2 supporting features that differentiate this product
- Third sentence (optional): a soft local hook (delivery, price, M-Pesa)
- Must naturally include: product name + brand + primary keyword + "Kenya"

3. LONG DESCRIPTION (shown on product page)
- 180–280 words
- Structure:
  • Opening hook (1 sentence) — lead with the problem it solves or the experience it delivers, not the product name
  • Feature breakdown (4–6 bullet points) — each bullet: bold the feature name, then explain WHY it matters to the buyer. Never just list specs.
  • Use case paragraph (2–3 sentences) — who is this for and when/where do they use it
  • Local trust close (1–2 sentences) — mention Kenya delivery, M-Pesa payment, or Trivo quality check
- Use the primary keyword naturally 2–3 times across the full description

4. SEO META DESCRIPTION
- 145–160 characters including spaces
- Must include: primary keyword + a benefit or feature + "Kenya" + a soft CTA

5. FOCUS KEYWORD
- Single most searchable phrase a Kenyan buyer would type into Google
- Format: "[Brand] [Product Type] [Key Feature] Kenya" or "[Product Type] price in Kenya"

6. SECONDARY KEYWORDS (5–8 keywords)
- Mix of: branded terms, use-case terms, local terms, comparison terms
- Include at least one "price in Kenya" or "buy in Kenya" variant
- Include at least one longer-tail phrase (e.g. "best smartwatch under 10000 in Kenya")
- Comma-separated list

7. PRODUCT TAGS (8–12 tags)
- Short, single or two-word tags for internal site search
- Include brand name, product type, key features, and relevant category names
- Comma-separated list

Return ONLY valid JSON with exactly these eight fields: seo_title, short_description, long_description, seo_description, focus_keyword, secondary_keywords, product_tags, category.
- seo_title: string (max 65 chars)
- short_description: string (40-60 words)
- long_description: string (180-280 words)
- seo_description: string (145-160 chars)
- focus_keyword: string
- secondary_keywords: string (comma-separated, 5-8 keywords)
- product_tags: string (comma-separated, 8-12 tags)
- category: string from this exact list: Audio, Car Accessories, Smart Home, Cables, Lighting, Other

No markdown formatting, no code fences, just raw JSON.`;

export async function POST(req: Request) {
  try {
    // Optional: Get IP or user identifier for rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown_client";
    const now = Date.now();
    
    // Check rate limit
    const userLimit = rateLimitCache.get(ip) || { count: 0, timestamp: now };
    
    if (now - userLimit.timestamp > TIME_WINDOW) {
      userLimit.count = 1;
      userLimit.timestamp = now;
    } else {
      userLimit.count += 1;
    }
    
    rateLimitCache.set(ip, userLimit);

    if (userLimit.count > RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit exceeded. Please wait a minute." }, { status: 429 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const { text } = await generateText({
      model: openrouter("google/gemini-2.5-flash"),
      maxOutputTokens: 2000,
      system: SYSTEM_PROMPT,
      prompt,
    });

    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    // Parse comma-separated tags into an array
    const tags = (result.product_tags || "")
      .split(",")
      .map((t: string) => t.trim().toLowerCase())
      .filter((t: string) => t.length > 0)
      .slice(0, 12);

    return NextResponse.json({
      seo_title: String(result.seo_title || "").slice(0, 65),
      short_description: String(result.short_description || ""),
      long_description: String(result.long_description || ""),
      seo_description: String(result.seo_description || "").slice(0, 160),
      focus_keyword: String(result.focus_keyword || ""),
      secondary_keywords: String(result.secondary_keywords || ""),
      product_tags: tags,
      category: String(result.category || "Other"),
    });
  } catch (err: unknown) {
    console.error("AI Generate Error:", err);
    return NextResponse.json({ error: "AI generation failed. Make sure OPENROUTER_API_KEY is valid." }, { status: 500 });
  }
}
