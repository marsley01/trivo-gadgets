"use server";

import { createServerClient } from "@supabase/ssr";
import { Database, type Json } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import { upscaleImage } from "@/lib/upscale";

type Product = Database["public"]["Tables"]["products"]["Row"];

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function createProduct(formData: FormData) {
  const supabase = getAdminClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const long_description = formData.get("long_description") as string;
  const secondary_keywords = formData.get("secondary_keywords") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const category = formData.get("category") as string;
  const image_url = formData.get("image_url") as string;
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const seo_title = formData.get("seo_title") as string;
  const seo_description = formData.get("seo_description") as string;
  const focus_keyword = formData.get("focus_keyword") as string;
  const cj_product_id = formData.get("cj_product_id") as string;
  const brand = formData.get("brand") as string;
  const material = formData.get("material") as string;
  const weight = formData.get("weight") as string;
  const dimensions = formData.get("dimensions") as string;
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

async function handleImageUpload(supabase: ReturnType<typeof getAdminClient>, image_file: File | null, image_url: string): Promise<string> {
  if (image_file && image_file.size > 0) {
    const arrayBuffer = await image_file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);
    const { buffer, ext } = await upscaleImage(inputBuffer);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
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
    try {
      const res = await fetch(image_url);
      if (res.ok) {
        const inputBuffer = Buffer.from(await res.arrayBuffer());
        const { buffer, ext } = await upscaleImage(inputBuffer);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, buffer, { contentType: `image/${ext === "jpg" ? "jpeg" : ext}` });
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);
        return publicUrl;
      }
    } catch {}
  }

  return image_url;
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = getAdminClient();
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const long_description = formData.get("long_description") as string;
  const secondary_keywords = formData.get("secondary_keywords") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const category = formData.get("category") as string;
  const image_url = formData.get("image_url") as string;
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const seo_title = formData.get("seo_title") as string;
  const seo_description = formData.get("seo_description") as string;
  const focus_keyword = formData.get("focus_keyword") as string;
  const brand = formData.get("brand") as string;
  const material = formData.get("material") as string;
  const weight = formData.get("weight") as string;
  const dimensions = formData.get("dimensions") as string;
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
  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function getAdminStats() {
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
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Product[];
}

export async function getAdminSubscribers() {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("subscribers")
    .select("email, subscribed_at")
    .order("subscribed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminStatsFull() {
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
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("admin_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTodaysOrderCount() {
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
  const supabase = getAdminClient();

  const customer_name = formData.get("customer_name") as string;
  const customer_phone = formData.get("customer_phone") as string;
  const customer_email = formData.get("customer_email") as string;
  let items: Json = [];
  try { const parsed = JSON.parse(formData.get("items") as string); if (Array.isArray(parsed)) items = parsed as Json; } catch { items = []; }
  const subtotal = parseInt(formData.get("subtotal") as string) || 0;
  const delivery_fee = parseInt(formData.get("delivery_fee") as string) || 0;
  const total = parseInt(formData.get("total") as string) || 0;
  const mpesa_reference = (formData.get("mpesa_reference") as string || "").toUpperCase();
  const vendor_id = formData.get("vendor_id") as string || null;
  const notes = formData.get("notes") as string || null;

  // Generate receipt number with timestamp + random suffix to avoid race conditions
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const dateStr = `${yyyy}${mm}${dd}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
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
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("admin_orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function deleteOrder(orderId: string) {
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("admin_orders")
    .delete()
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}

export async function getVendors() {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createVendor(formData: FormData) {
  const supabase = getAdminClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const business_name = formData.get("business_name") as string;

  // Insert into vendors table
  const { error: vendorError } = await supabase.from("vendors").insert({
    name,
    email,
    phone: phone || null,
    business_name: business_name || null,
  });

  if (vendorError) throw new Error(vendorError.message);

  // Create auth user via Supabase Admin API
  const { error: authError } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { role: "vendor" },
  });

  if (authError) throw new Error(`Vendor created but auth invite failed: ${authError.message}`);
}

export async function updateVendor(id: string, formData: FormData) {
  const supabase = getAdminClient();

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const business_name = formData.get("business_name") as string;
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

export async function deleteVendor(id: string) {
  const supabase = getAdminClient();

  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
