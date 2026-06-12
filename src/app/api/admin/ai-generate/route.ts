import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Simple in-memory rate limiter
const rateLimitCache = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 5; // requests
const TIME_WINDOW = 60 * 1000; // 1 minute

export async function POST(req: Request) {
  try {
    // Optional: Get IP or user identifier for rate limiting. Using a generic 'client' if not easily available.
    const ip = req.headers.get("x-forwarded-for") || "unknown_client";
    const now = Date.now();
    
    // Check rate limit
    const userLimit = rateLimitCache.get(ip) || { count: 0, timestamp: now };
    
    if (now - userLimit.timestamp > TIME_WINDOW) {
      // Reset if window has passed
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
      maxOutputTokens: 1000,
      system: `You are an expert e-commerce product manager and SEO copywriter for Trivo Kenya, a premium tech gadget store in Kenya.
Given a rough product description or idea, generate:
- title: A compelling product title (max 70 characters, SEO-optimized, includes brand if mentioned)
- description: A detailed product description (2-4 sentences, persuasive, includes key features and benefits)
- seo_title: An SEO-optimized meta title for the page (max 60 characters)
- seo_description: An SEO-optimized meta description (max 160 characters)
- focus_keyword: A single primary keyword phrase to target for SEO
- category: Select the most appropriate category exactly from this list: Audio, Car Accessories, Smart Home, Cables, Lighting, Other

Return ONLY valid JSON with exactly these six fields: title, description, seo_title, seo_description, focus_keyword, category. No markdown formatting, no code fences, just raw JSON.`,
      prompt,
    });

    const cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({
      title: String(result.title || "").slice(0, 70),
      description: String(result.description || ""),
      seo_title: String(result.seo_title || "").slice(0, 60),
      seo_description: String(result.seo_description || "").slice(0, 160),
      focus_keyword: String(result.focus_keyword || ""),
      category: String(result.category || "Other"),
    });
  } catch (err: unknown) {
    console.error("AI Generate Error:", err);
    return NextResponse.json({ error: "AI generation failed. Make sure OPENROUTER_API_KEY is valid." }, { status: 500 });
  }
}
