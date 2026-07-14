import json
import os
import sys
import urllib.request
import urllib.parse
import urllib.error
import re
from datetime import datetime


OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY", "")

SYSTEM_PROMPT = """You are an expert tech blog writer for Trivo Kenya (trivokenya.store), a premium gadgets store in Nairobi, Kenya. Your job is to write engaging, informative blog posts about tech products that rank on Google Kenya.

BRAND VOICE
- Professional but conversational — like a knowledgeable tech enthusiast sharing insights
- Specific, detailed, and honest about specs and real-world use
- Never use filler phrases like "game-changer", "revolutionary", or "you won't believe"
- Include practical Kenyan context (e.g., "works with Kenya's 4G/5G networks", "available with M-Pesa")

FOR EVERY PRODUCT BLOG POST, GENERATE:

1. TITLE - Click-worthy but not clickbait. Include the product name and key benefit. 50-65 characters.

2. SLUG - URL-friendly, lowercase, hyphens. 4-6 words.

3. EXCERPT - 2-3 sentences (30-50 words) summarizing the post. Include product name and Kenya context.

4. CONTENT (full HTML blog post, 500-800 words)
Structure:
- <h2>Introduction</h2> (2-3 paragraphs)
- <h2>Key Specifications</h2> (table with at least 6 rows)
- <h2>Design & Build</h2> (2 paragraphs)
- <h2>Performance</h2> (2-3 paragraphs)
- <h2>Where to Buy in Kenya</h2> (1-2 paragraphs about Trivo Kenya, pricing, M-Pesa, delivery)
- <h2>Verdict</h2> (1-2 paragraphs final recommendation)
- Include <img> tags with placeholder Unsplash URLs using tech photo IDs

5. SEO TITLE (55-65 chars, includes primary keyword + "Kenya")

6. SEO DESCRIPTION (145-160 chars, includes primary keyword + benefit + "Trivo Kenya")

Return ONLY valid JSON with these fields: title, slug, excerpt, content, seo_title, seo_description.
No markdown formatting, no code fences, just raw JSON."""


def call_openrouter(prompt: str) -> str | None:
    if not OPENROUTER_API_KEY:
        print("Error: OPENROUTER_API_KEY environment variable not set.", file=sys.stderr)
        return None

    data = json.dumps({
        "model": "google/gemini-2.5-flash",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 4096,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=data,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://trivokenya.store",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"OpenRouter API error: {e}", file=sys.stderr)
        return None


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"(^-|-$)", "", text)
    return text[:100]


def generate_blog_post(product_info: str) -> dict | None:
    prompt = f"Write a detailed SEO-optimized blog post for this tech product:\n\n{product_info}\n\nMake it informative, engaging for Kenyan readers, and include real specifications and buying advice."

    raw = call_openrouter(prompt)
    if not raw:
        return None

    cleaned = raw.replace("```json", "").replace("```", "").strip()
    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}", file=sys.stderr)
        print(f"Raw output: {raw[:500]}", file=sys.stderr)
        return None

    return {
        "title": str(result.get("title", ""))[:200],
        "slug": slugify(str(result.get("slug", ""))),
        "excerpt": str(result.get("excerpt", ""))[:500],
        "content": str(result.get("content", "")),
        "seo_title": str(result.get("seo_title", ""))[:65],
        "seo_description": str(result.get("seo_description", ""))[:160],
    }


def save_to_supabase(post: dict) -> bool:
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("Skipping Supabase save: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.", file=sys.stderr)
        return False

    data = json.dumps({
        **post,
        "published_at": datetime.utcnow().isoformat(),
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/blog_posts",
        data=data,
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=30):
            print("Blog post saved to Supabase.")
            return True
    except Exception as e:
        print(f"Supabase save error: {e}", file=sys.stderr)
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-blog.py \"Product Name\"")
        print("   or: python generate-blog.py --product \"Product Name\" --desc \"Description\" --specs '{\"key\": \"value\"}'")
        sys.exit(1)

    if len(sys.argv) >= 3 and sys.argv[1] in ("-p", "--product"):
        name = sys.argv[2]
        desc = ""
        specs = {}
        for i, arg in enumerate(sys.argv):
            if arg in ("-d", "--desc") and i + 1 < len(sys.argv):
                desc = sys.argv[i + 1]
            if arg in ("-s", "--specs") and i + 1 < len(sys.argv):
                try:
                    specs = json.loads(sys.argv[i + 1])
                except json.JSONDecodeError:
                    print("Warning: Specs must be valid JSON. Ignoring.", file=sys.stderr)
        product_info = f"Product: {name}\nDescription: {desc}\nSpecs: {json.dumps(specs)}"
    else:
        product_info = f"Product: {' '.join(sys.argv[1:])}"

    print(f"Generating blog post for: {product_info.split(chr(10))[0]}")
    print("-" * 60)

    post = generate_blog_post(product_info)
    if not post:
        print("Failed to generate blog post.", file=sys.stderr)
        sys.exit(1)

    print(f"\nTitle: {post['title']}")
    print(f"Slug: {post['slug']}")
    print(f"Excerpt: {post['excerpt'][:100]}...")
    print(f"SEO Title: {post['seo_title']}")
    print(f"Content length: {len(post['content'])} chars")
    print("-" * 60)

    save = input("Save to Supabase? (y/N): ").strip().lower()
    if save == "y":
        if save_to_supabase(post):
            print("Saved successfully!")
        else:
            print("Save failed.", file=sys.stderr)
            sys.exit(1)

    output_file = f"blog-{post['slug']}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(post, f, indent=2, ensure_ascii=False)
    print(f"Blog post saved to {output_file}")


if __name__ == "__main__":
    main()
