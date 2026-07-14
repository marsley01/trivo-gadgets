"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Database, type Json } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { upscaleImage } from "@/lib/upscale";
import sanitizeHtml from "sanitize-html";

type Product = Database["public"]["Tables"]["products"]["Row"];

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function verifyAdminAuth(requiredRole?: "admin" | "superadmin") {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("email", user.email)
    .single();
  if (!adminUser) {
    throw new Error("Forbidden");
  }
  if (requiredRole === "superadmin" && adminUser.role !== "superadmin") {
    throw new Error("Forbidden: superadmin role required");
  }
  return user;
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

async function handleImageUpload(supabase: ReturnType<typeof getAdminClient>, image_file: File | null, image_url: string): Promise<string> {
  if (image_file && image_file.size > 0) {
    const maxSize = 5 * 1024 * 1024;
    if (image_file.size > maxSize) {
      throw new Error("Image too large. Maximum size is 5MB.");
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(image_file.type)) {
      throw new Error("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
    }
    const arrayBuffer = await image_file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const { buffer, ext } = await upscaleImage(inputBuffer);
    const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    return publicUrl;
  }

  if (image_url && image_url.startsWith("http")) {
    if (!validateUrl(image_url)) {
      throw new Error("Invalid image URL: URL must be a valid public HTTPS URL.");
    }
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(image_url, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) {
          throw new Error("URL does not point to a valid image.");
        }
        const contentLength = res.headers.get("content-length");
        if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
          throw new Error("Remote image too large. Maximum size is 5MB.");
        }
        const inputBuffer = Buffer.from(await res.arrayBuffer());
        const { buffer, ext } = await upscaleImage(inputBuffer);
        const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        return publicUrl;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Image fetch timed out.");
      }
      if (err instanceof Error && err.message.startsWith("Image")) throw err;
    }
  }

  return image_url || "";
}

export async function createProduct(formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const name = (formData.get("name") as string || "").trim();
  if (!name) throw new Error("Product name is required.");
  if (name.length > 200) throw new Error("Product name must be 200 characters or less.");

  const description = (formData.get("description") as string || "").trim();
  const long_description = (formData.get("long_description") as string || "").trim();
  const secondary_keywords = (formData.get("secondary_keywords") as string || "").trim();
  const price = parseInt(formData.get("price") as string) || 0;
  if (price <= 0) throw new Error("Price must be greater than 0.");
  if (price > 10000000) throw new Error("Price exceeds maximum allowed.");
  const stock = Math.max(0, parseInt(formData.get("stock") as string) || 0);
  if (stock > 100000) throw new Error("Stock exceeds maximum allowed.");
  const category = (formData.get("category") as string || "").trim();
  const image_url = (formData.get("image_url") as string || "").trim();
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const seo_title = (formData.get("seo_title") as string || "").trim();
  const seo_description = (formData.get("seo_description") as string || "").trim();
  const focus_keyword = (formData.get("focus_keyword") as string || "").trim();
  const cj_product_id = (formData.get("cj_product_id") as string || "").trim();
  const brand = (formData.get("brand") as string || "").trim();
  const material = (formData.get("material") as string || "").trim();
  const weight = (formData.get("weight") as string || "").trim();
  const dimensions = (formData.get("dimensions") as string || "").trim();
  const features = formData.get("features") as string;
  const specifications = formData.get("specifications") as string;
  const tags = formData.get("tags") as string;
  const variants = formData.get("variants") as string;
  const variant_options = formData.get("variant_options") as string;

  if (is_featured) {
    await supabase.from("products").update({ is_featured: false });
  }

  const final_image_url = await handleImageUpload(supabase, image_file, image_url);

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

  const { error } = await supabase.from("products").insert({
    name,
    description: description || null,
    long_description: long_description || null,
    secondary_keywords: secondary_keywords || null,
    price,
    stock,
    category: category || null,
    image_url: final_image_url || null,
    is_featured,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    focus_keyword: focus_keyword || null,
    cj_product_id: cj_product_id || null,
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
  revalidatePath("/", "layout");
}

export async function updateProduct(id: string, formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const name = (formData.get("name") as string || "").trim();
  if (!name) throw new Error("Product name is required.");
  if (name.length > 200) throw new Error("Product name must be 200 characters or less.");

  const description = (formData.get("description") as string || "").trim();
  const long_description = (formData.get("long_description") as string || "").trim();
  const secondary_keywords = (formData.get("secondary_keywords") as string || "").trim();
  const price = parseInt(formData.get("price") as string) || 0;
  if (price <= 0) throw new Error("Price must be greater than 0.");
  if (price > 10000000) throw new Error("Price exceeds maximum allowed.");
  const stock = Math.max(0, parseInt(formData.get("stock") as string) || 0);
  if (stock > 100000) throw new Error("Stock exceeds maximum allowed.");
  const category = (formData.get("category") as string || "").trim();
  const image_url = (formData.get("image_url") as string || "").trim();
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const seo_title = (formData.get("seo_title") as string || "").trim();
  const seo_description = (formData.get("seo_description") as string || "").trim();
  const focus_keyword = (formData.get("focus_keyword") as string || "").trim();
  const brand = (formData.get("brand") as string || "").trim();
  const material = (formData.get("material") as string || "").trim();
  const weight = (formData.get("weight") as string || "").trim();
  const dimensions = (formData.get("dimensions") as string || "").trim();
  const features = formData.get("features") as string;
  const specifications = formData.get("specifications") as string;
  const tags = formData.get("tags") as string;
  const variants = formData.get("variants") as string;
  const variant_options = formData.get("variant_options") as string;

  if (is_featured) {
    await supabase.from("products").update({ is_featured: false }).neq("id", id);
  }

  const final_image_url = await handleImageUpload(supabase, image_file, image_url);

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

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: description || null,
      long_description: long_description || null,
      secondary_keywords: secondary_keywords || null,
      price,
      stock,
      category: category || null,
      image_url: final_image_url || null,
      is_featured,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      focus_keyword: focus_keyword || null,
      brand: brand || null,
      material: material || null,
      weight: weight || null,
      dimensions: dimensions || null,
      features: parsedFeatures,
      specifications: parsedSpecifications,
      tags: parsedTags,
      variants: parsedVariants,
      variant_options: parsedVariantOptions,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function getAdminStats() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*");

  if (productsError) throw new Error(productsError.message);

  const { count: subscribersCount, error: subsError } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true });

  if (subsError) throw new Error(subsError.message);

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStock = products.filter((p) => p.stock < 3).length;

  return { totalProducts, totalStock, subscribersCount: subscribersCount || 0, lowStock };
}

export async function getAdminProducts() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Product[];
}

export async function getAdminSubscribers() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("subscribers")
    .select("email, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminStatsFull() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const [productsResult, { count: subscribersCount }, { count: ordersCount }, ordersTotalResult] =
    await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("subscribers").select("*", { count: "exact", head: true }),
      supabase.from("admin_orders").select("*", { count: "exact", head: true }),
      supabase.from("admin_orders").select("total"),
    ]);

  if (productsResult.error) throw new Error(productsResult.error.message);

  const totalProducts = productsResult.data.length;
  const totalStock = productsResult.data.reduce((sum: number, p) => sum + (p.stock || 0), 0);
  const lowStock = productsResult.data.filter((p) => p.stock < 3).length;
  const revenue = (ordersTotalResult.data as { total: number }[] | null)?.reduce((sum: number, o) => sum + (o.total || 0), 0) || 0;

  return { totalProducts, totalStock, subscribersCount: subscribersCount || 0, lowStock, revenue, ordersCount: ordersCount || 0 };
}

export async function getAllOrders() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("admin_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTodaysOrderCount() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const today = new Date().toISOString().split("T")[0];
  const { count, error } = await supabase
    .from("admin_orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)
    .lt("created_at", new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]);

  if (error) throw new Error(error.message);
  return count || 0;
}

export async function createOrder(formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const customer_name = (formData.get("customer_name") as string || "").trim();
  if (!customer_name) throw new Error("Customer name is required.");
  const customer_phone = (formData.get("customer_phone") as string || "").trim();
  if (!customer_phone) throw new Error("Customer phone is required.");
  const customer_email = (formData.get("customer_email") as string || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (customer_email && !validEmail.test(customer_email)) {
    throw new Error("Invalid email format.");
  }
  let items: Json = [];
  try { const parsed = JSON.parse(formData.get("items") as string); if (Array.isArray(parsed)) items = parsed as Json; } catch { items = []; }
  const subtotal = Math.max(0, parseInt(formData.get("subtotal") as string) || 0);
  const delivery_fee = Math.max(0, parseInt(formData.get("delivery_fee") as string) || 0);
  const total = Math.max(0, parseInt(formData.get("total") as string) || 0);
  if (total <= 0) throw new Error("Total must be greater than 0.");
  const mpesa_reference = (formData.get("mpesa_reference") as string || "").toUpperCase().trim();
  if (!mpesa_reference) throw new Error("M-Pesa reference is required.");
  const vendor_id = formData.get("vendor_id") as string || null;
  const notes = (formData.get("notes") as string || "").trim() || null;

  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;
  const rand = crypto.randomUUID().slice(0, 4).toUpperCase();
  const receipt_number = `TRV-${dateStr}-${rand}`;

  const { error } = await supabase.from("admin_orders").insert({
    receipt_number,
    customer_name,
    customer_phone,
    customer_email: customer_email || null,
    items,
    subtotal,
    delivery_fee,
    total,
    mpesa_reference,
    vendor_id: vendor_id || null,
    notes: notes || null,
    status: "confirmed",
  });

  if (error) throw new Error(error.message);
  return receipt_number;
}

export async function updateOrderStatus(orderId: string, status: string) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const validStatuses = ["confirmed", "dispatched", "delivered", "refunded"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status.");
  }

  const { error } = await supabase
    .from("admin_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function deleteOrder(orderId: string) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("admin_orders")
    .delete()
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function getVendors() {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createVendor(formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const name = (formData.get("name") as string || "").trim();
  if (!name) throw new Error("Vendor name is required.");
  const email = (formData.get("email") as string || "").trim();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !validEmail.test(email)) throw new Error("Valid email is required.");
  const phone = (formData.get("phone") as string || "").trim();
  const business_name = (formData.get("business_name") as string || "").trim();

  const { error: vendorError } = await supabase.from("vendors").insert({
    name,
    email,
    phone: phone || null,
    business_name: business_name || null,
  });

  if (vendorError) throw new Error(vendorError.message);

  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role: "vendor" },
  });

  if (authError) throw new Error(`Vendor created but auth invite failed: ${authError.message}`);
}

export async function updateVendor(id: string, formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const name = (formData.get("name") as string || "").trim();
  const phone = (formData.get("phone") as string || "").trim();
  const business_name = (formData.get("business_name") as string || "").trim();
  const status = formData.get("status") as string;

  const { error } = await supabase
    .from("vendors")
    .update({
      name,
      phone: phone || null,
      business_name: business_name || null,
      status: status || "active",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function createBlogPost(formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const title = (formData.get("title") as string || "").trim();
  if (!title) throw new Error("Blog post title is required.");
  if (title.length > 200) throw new Error("Title must be 200 characters or less.");
  const slug = (formData.get("slug") as string || "").trim();
  if (!slug) throw new Error("Slug is required.");
  const content = sanitizeHtml(formData.get("content") as string || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "target", "rel"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com"],
  });
  if (!content) throw new Error("Content is required.");
  const excerpt = (formData.get("excerpt") as string || "").trim();
  const cover_image_url = (formData.get("cover_image_url") as string || "").trim();
  const seo_title = (formData.get("seo_title") as string || "").trim();
  const seo_description = (formData.get("seo_description") as string || "").trim();
  const related_product_ids = formData.get("related_product_ids") as string;
  const published_at = formData.get("published_at") as string;

  let parsedRelated: string[] = [];
  try { if (related_product_ids) parsedRelated = JSON.parse(related_product_ids); } catch {}

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    content,
    excerpt: excerpt || null,
    cover_image_url: cover_image_url || null,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
    related_product_ids: parsedRelated.length > 0 ? parsedRelated : null,
    published_at: published_at || undefined,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateBlogPost(id: string, formData: FormData) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const title = (formData.get("title") as string || "").trim();
  if (!title) throw new Error("Blog post title is required.");
  if (title.length > 200) throw new Error("Title must be 200 characters or less.");
  const slug = (formData.get("slug") as string || "").trim();
  if (!slug) throw new Error("Slug is required.");
  const content = sanitizeHtml(formData.get("content") as string || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "code", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height", "loading"],
      a: ["href", "target", "rel"],
    },
    allowedIframeHostnames: ["www.youtube.com", "youtube.com"],
  });
  if (!content) throw new Error("Content is required.");
  const excerpt = (formData.get("excerpt") as string || "").trim();
  const cover_image_url = (formData.get("cover_image_url") as string || "").trim();
  const seo_title = (formData.get("seo_title") as string || "").trim();
  const seo_description = (formData.get("seo_description") as string || "").trim();
  const related_product_ids = formData.get("related_product_ids") as string;
  const published_at = formData.get("published_at") as string;

  let parsedRelated: string[] = [];
  try { if (related_product_ids) parsedRelated = JSON.parse(related_product_ids); } catch {}

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      cover_image_url: cover_image_url || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      related_product_ids: parsedRelated.length > 0 ? parsedRelated : null,
      published_at: published_at || undefined,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteBlogPost(id: string) {
  await verifyAdminAuth();
  const supabase = getAdminClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function getBlogPosts() {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteVendor(id: string) {
  await verifyAdminAuth();
  const supabase = getAdminClient();

  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
