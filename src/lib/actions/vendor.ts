"use server";

import { createServerClient } from "@supabase/ssr";
import { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";

type Product = Database["public"]["Tables"]["products"]["Row"];

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function getVendorProfile() {
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
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
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("products")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Product[];
}

export async function getVendorOrders(vendorId: string) {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
    .from("admin_orders")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProductStock(productId: string, stock: number) {
  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from("products")
    .update({ stock })
    .eq("id", productId);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function createVendorProduct(formData: FormData, vendorId: string) {
  const adminClient = getAdminClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const stock = parseInt(formData.get("stock") as string) || 0;
  const category = formData.get("category") as string;
  const image_url = formData.get("image_url") as string;
  const image_file = formData.get("image_file") as File | null;
  const is_featured = formData.get("is_featured") === "true";
  const brand = formData.get("brand") as string;
  const material = formData.get("material") as string;
  const weight = formData.get("weight") as string;
  const dimensions = formData.get("dimensions") as string;
  const features = formData.get("features") as string;
  const specifications = formData.get("specifications") as string;
  const tags = formData.get("tags") as string;
  const variants = formData.get("variants") as string;
  const variant_options = formData.get("variant_options") as string;

  let final_image_url = image_url;

  if (image_file && image_file.size > 0) {
    const fileExt = image_file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await adminClient.storage
      .from("product-images")
      .upload(fileName, image_file);
      
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    
    const { data: { publicUrl } } = adminClient.storage
      .from("product-images")
      .getPublicUrl(fileName);
      
    final_image_url = publicUrl;
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

  const { error } = await adminClient.from("products").insert({
    name,
    description: description || null,
    price,
    stock,
    category: category || null,
    image_url: final_image_url || null,
    is_featured,
    vendor_id: vendorId,
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
