"""
generate-blog.py — Fully automated blog post generator for Trivo Kenya.

Usage:
  # Fully automatic: picks a random uncovered product from Supabase and saves it
  python generate-blog.py --auto

  # Generate for a specific product name (saves to Supabase automatically)
  python generate-blog.py --product "Xiaomi Redmi Note 14 Pro"

  # Generate with full details
  python generate-blog.py --product "Samsung Galaxy S25" --desc "Flagship Android" --specs '{"RAM":"12GB","Storage":"256GB"}'

  # Dry-run: generate but do NOT save to Supabase, only write a local JSON file
  python generate-blog.py --product "Test Product" --dry-run

Environment variables required:
  OPENROUTER_API_KEY       — OpenRouter API key
  NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
  SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (bypasses RLS)
"""

import json
import os
import sys
import urllib.request
import urllib.error
import re
import random
import string
from datetime import datetime, timezone


# ── Configuration ──────────────────────────────────────────────────────────────
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
# Use SERVICE_ROLE_KEY — the anon key is RLS-restricted and cannot write blog_posts
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

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


# ── Helpers ────────────────────────────────────────────────────────────────────
def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"(^-|-$)", "", text)
    return text[:80]


def random_suffix(n: int = 4) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=n))


def supabase_request(method: str, path: str, payload: dict | None = None) -> tuple[int, dict | list | None]:
    """Make an authenticated request to Supabase REST API using the service role key."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise EnvironmentError("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")

    url = f"{SUPABASE_URL}/rest/v1{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None

    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        },
        method=method,
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return resp.status, body
    except urllib.error.HTTPError as e:
        body_text = e.read().decode("utf-8", errors="replace")
        print(f"Supabase HTTP {e.code}: {body_text}", file=sys.stderr)
        return e.code, None
    except Exception as exc:
        print(f"Supabase request error: {exc}", file=sys.stderr)
        return 0, None


def get_uncovered_products() -> list[dict]:
    """Fetch products that do NOT yet have a blog post, for deduplication."""
    # Get all existing blog post product IDs
    status, posts = supabase_request("GET", "/blog_posts?select=related_product_ids&limit=1000")
    covered_ids: set[str] = set()
    if status == 200 and isinstance(posts, list):
        for post in posts:
            ids = post.get("related_product_ids") or []
            covered_ids.update(ids)

    # Fetch products
    status, products = supabase_request("GET", "/products?select=id,name,description,category,price,specs&limit=100")
    if status != 200 or not isinstance(products, list):
        return []

    uncovered = [p for p in products if p.get("id") not in covered_ids]
    return uncovered if uncovered else products  # fall back to all if all covered


def call_openrouter(prompt: str) -> str | None:
    if not OPENROUTER_API_KEY:
        print("Error: OPENROUTER_API_KEY not set.", file=sys.stderr)
        return None

    payload = json.dumps({
        "model": "google/gemini-2.5-flash",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 4096,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://trivokenya.store",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"]
    except Exception as exc:
        print(f"OpenRouter API error: {exc}", file=sys.stderr)
        return None


def generate_blog_post(product_info: str) -> dict | None:
    prompt = (
        f"Write a detailed SEO-optimized blog post for this tech product:\n\n"
        f"{product_info}\n\n"
        f"Make it informative, engaging for Kenyan readers, and include real specifications and buying advice."
    )

    raw = call_openrouter(prompt)
    if not raw:
        return None

    cleaned = re.sub(r"```json\s*", "", raw)
    cleaned = re.sub(r"```\s*", "", cleaned).strip()

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        print(f"JSON parse error: {exc}", file=sys.stderr)
        print(f"Raw output (first 500 chars): {raw[:500]}", file=sys.stderr)
        return None

    base_slug = slugify(str(result.get("slug", result.get("title", "blog-post"))))
    slug = f"{base_slug}-{random_suffix()}"

    return {
        "title": str(result.get("title", ""))[:200],
        "slug": slug,
        "excerpt": str(result.get("excerpt", ""))[:500],
        "content": str(result.get("content", "")),
        "seo_title": str(result.get("seo_title", ""))[:65],
        "seo_description": str(result.get("seo_description", ""))[:160],
        "cover_image_url": "",
        "published_at": datetime.now(timezone.utc).isoformat(),
    }


def save_to_supabase(post: dict, product_id: str | None = None) -> bool:
    payload = {**post}
    if product_id:
        payload["related_product_ids"] = [product_id]

    status, _ = supabase_request("POST", "/blog_posts", payload)
    if status in (200, 201):
        print(f"✅ Blog post saved to Supabase (slug: {post['slug']})")
        return True
    print(f"❌ Failed to save blog post (HTTP {status})", file=sys.stderr)
    return False


def save_local(post: dict) -> str:
    output_file = f"blog-{post['slug']}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(post, f, indent=2, ensure_ascii=False)
    print(f"📄 Blog post JSON written to: {output_file}")
    return output_file


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    auto_mode = "--auto" in args

    if not args or args == ["--dry-run"]:
        print(__doc__)
        sys.exit(0)

    product_id: str | None = None

    if auto_mode:
        print("🤖 Auto mode: fetching uncovered products from Supabase...")
        products = get_uncovered_products()
        if not products:
            print("No products found in database.", file=sys.stderr)
            sys.exit(1)
        product = random.choice(products)
        product_id = product.get("id")
        product_info = (
            f"Product: {product.get('name', '')}\n"
            f"Description: {product.get('description', '')}\n"
            f"Category: {product.get('category', '')}\n"
            f"Price: KES {product.get('price', '')}\n"
            f"Specs: {json.dumps(product.get('specs') or {})}"
        )
        print(f"📦 Selected product: {product.get('name')}")
    elif "--product" in args or "-p" in args:
        flag = "--product" if "--product" in args else "-p"
        idx = args.index(flag)
        if idx + 1 >= len(args):
            print("Error: --product requires a value", file=sys.stderr)
            sys.exit(1)
        name = args[idx + 1]
        desc, specs = "", {}
        for i, arg in enumerate(args):
            if arg in ("--desc", "-d") and i + 1 < len(args):
                desc = args[i + 1]
            if arg in ("--specs", "-s") and i + 1 < len(args):
                try:
                    specs = json.loads(args[i + 1])
                except json.JSONDecodeError:
                    print("Warning: --specs must be valid JSON. Ignoring.", file=sys.stderr)
        product_info = f"Product: {name}\nDescription: {desc}\nSpecs: {json.dumps(specs)}"
    else:
        product_info = f"Product: {' '.join(a for a in args if a != '--dry-run')}"

    print(f"\n✍️  Generating blog post...")
    print("-" * 60)

    post = generate_blog_post(product_info)
    if not post:
        print("❌ Failed to generate blog post.", file=sys.stderr)
        sys.exit(1)

    print(f"Title:       {post['title']}")
    print(f"Slug:        {post['slug']}")
    print(f"SEO Title:   {post['seo_title']}")
    print(f"Excerpt:     {post['excerpt'][:100]}...")
    print(f"Content len: {len(post['content'])} chars")
    print("-" * 60)

    if dry_run:
        print("🔵 Dry-run mode: skipping Supabase save.")
        save_local(post)
    else:
        if save_to_supabase(post, product_id):
            save_local(post)
        else:
            print("Saving local copy as fallback...")
            save_local(post)
            sys.exit(1)


if __name__ == "__main__":
    main()
