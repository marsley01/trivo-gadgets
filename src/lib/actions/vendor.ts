"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { upscaleImage } from "@/lib/upscale";
import crypto from "crypto";
import { rateLimitServerAction } from "@/lib/rate-limiter";

type Product = Database["public"]["Tables"]["products"]["Row"];

function slugify(text: string): string {
  return text
    .toLowerCase().trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function generateUniqueSlug(name: string): string {
  const base = slugify(name) || "product";
  const suffix = crypto.randomUUID().slice(0, 6);
  return `${base}-${suffix}`;
}

function validateUrl(input: string): boolean {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "0.0.0.0") return false;
    if (url.hostname.startsWith("169.254") || url.hostname.startsWith("10.") || url.hostname.startsWith("172.") || url.hostname.startsWith("192.168")) return false;
    return true;
  } catch {
    return false;
  }
}

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function verifyVendorAuth(vendorId?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user?.email) {
    throw new Error("Not authenticated");
  }

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, email, status")
    .eq("email", user.email)
    .single();

  if (!vendor) {
    throw new Error("Vendor account not found");
  }

  if (vendor.status === "suspended") {
    throw new Error("Vendor account is suspended");
  }

  if (vendorId && vendor.id !== vendorId) {
    throw new Error("Forbidden: cannot access another vendor's data");
  }

  return vendor;
}

export async function getVendorProfile() {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
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
  if (!user?.email) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("vendors")
    .select("id, name, email, phone, business_name, status")
    .eq("email", user.email)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getVendorProducts(vendorId: string) {
  const vendor = await verifyVendorAuth(vendorId);
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("products")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Product[];
}

export async function getVendorOrders(vendorId: string) {
  const vendor = await verifyVendorAuth(vendorId);
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("admin_orders")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProductStock(productId: string, stock: number) {
  const adminClient = getAdminClient();

  // First verify the caller owns this product
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("Not authenticated");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("email", user.email)
    .single();
  if (!vendor) throw new Error("Vendor account not found");

  const { data: product } = await adminClient
    .from("products")
    .select("vendor_id")
    .eq("id", productId)
    .single();
  if (!product || product.vendor_id !== vendor.id) {
    throw new Error("Forbidden: cannot modify another vendor's product");
  }

  const { error } = await adminClient
    .from("products")
    .update({ stock: Math.max(0, stock) })
    .eq("id", productId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function createVendorProduct(formData: FormData, vendorId: string) {
  const { allowed } = rateLimitServerAction("create-vendor-product", 10, 60000);
  if (!allowed) throw new Error("Too many requests. Please slow down.");
  const vendor = await verifyVendorAuth(vendorId);
  const adminClient = getAdminClient();

  const name = (formData.get("name") as string || "").trim();
  if (!name) throw new Error("Product name is required.");
  const description = (formData.get("description") as string || "").trim();
  const price = parseInt(formData.get("price") as string) || 0;
  if (price <= 0) throw new Error("Price must be greater than 0.");
  const stock = Math.max(0, parseInt(formData.get("stock") as string) || 0);
  const category = (formData.get("category") as string || "").trim();
  const image_url = (formData.get("image_url") as string || "").trim();
  const image_file = formData.get("image_file") as File | null;
  const brand = (formData.get("brand") as string || "").trim();
  const material = (formData.get("material") as string || "").trim();
  const weight = (formData.get("weight") as string || "").trim();
  const dimensions = (formData.get("dimensions") as string || "").trim();
  const features = formData.get("features") as string;
  const specifications = formData.get("specifications") as string;
  const tags = formData.get("tags") as string;
  const variants = formData.get("variants") as string;
  const variant_options = formData.get("variant_options") as string;

  let final_image_url = image_url;

  if (image_file && image_file.size > 0) {
    const maxSize = 5 * 1024 * 1024;
    if (image_file.size > maxSize) throw new Error("Image too large. Maximum size is 5MB.");
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image_file.type)) throw new Error("Invalid file type.");
    const arrayBuffer = await image_file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const { buffer, ext } = await upscaleImage(inputBuffer);
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await adminClient.storage
      .from("product-images")
      .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = adminClient.storage
      .from("product-images")
      .getPublicUrl(fileName);
    final_image_url = publicUrl;
  } else if (image_url && image_url.startsWith("http")) {
    if (!validateUrl(image_url)) {
      throw new Error("Invalid image URL: URL must be a valid public HTTPS URL.");
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(image_url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const inputBuffer = Buffer.from(await res.arrayBuffer());
        const { buffer, ext } = await upscaleImage(inputBuffer);
        const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { error: uploadError } = await adminClient.storage
          .from("product-images")
          .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = adminClient.storage
          .from("product-images")
          .getPublicUrl(fileName);
        final_image_url = publicUrl;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Image fetch timed out.");
      }
    }
  }

  let parsedFeatures: string[] = [];
  let parsedSpecifications: Record<string, string> = {};
  let parsedTags: string[] = [];
  let parsedVariants: { type: string; values: string[] }[] = [];
  let parsedVariantOptions: { sku: string; options: Record<string, string>; price: number; stock: number; image: string }[] = [];

  try { if (features) parsedFeatures = JSON.parse(features); } catch {}
  try { if (specifications) parsedSpecifications = JSON.parse(specifications); } catch {}
  try { if (tags) parsedTags = JSON.parse(tags); } catch {}
  try { if (variants) parsedVariants = JSON.parse(variants); } catch {}
  try { if (variant_options) parsedVariantOptions = JSON.parse(variant_options); } catch {}

  const slug = generateUniqueSlug(name);

  const { error } = await adminClient.from("products").insert({
    name,
    slug,
    description: description || null,
    price,
    stock,
    category: category || null,
    image_url: final_image_url || null,
    is_featured: false,
    vendor_id: vendor.id,
    brand: brand || null,
    material: material || null,
    weight: weight || null,
    dimensions: dimensions || null,
    features: parsedFeatures,
    specifications: parsedSpecifications,
    tags: parsedTags,
    variants: parsedVariants,
    variant_options: parsedVariantOptions,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
