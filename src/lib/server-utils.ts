import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import crypto from "crypto";

// ── Slug helpers ──────────────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function generateUniqueSlug(name: string): string {
  const base = slugify(name) || "product";
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}

// ── URL validation — blocks SSRF targets ─────────────────────────────────────

export function validateUrl(input: string): boolean {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const h = url.hostname;
    if (
      h === "localhost" ||
      h === "127.0.0.1" ||
      h === "0.0.0.0" ||
      h.startsWith("169.254") || // link-local
      h.startsWith("10.") || // RFC-1918
      h.startsWith("172.") || // RFC-1918 (172.16–31.x.x)
      h.startsWith("192.168") // RFC-1918
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ── Admin Supabase client (service-role, no cookie handling needed) ───────────

export function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// ── HTML escaping — prevent XSS in email templates ───────────────────────────

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch] ?? ch);
}

// ── Timing-safe string comparison (prevents timing attacks on secrets) ────────

export function timingSafeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      // Still run the comparison on bufA to consume constant time
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// ── Email format validation ───────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_REGEX.test(email) && email.length <= 254;
}
