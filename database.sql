-- ==============================================================================
-- TRIVO KENYA - PRODUCTION-GRADE DATABASE SETUP
-- ==============================================================================

-- Bootstrap: exec_sql helper for auto-migrations (create once, use everywhere)
-- SECURITY: Restricted to service_role only — revoked from PUBLIC and anon
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE query;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.exec_sql(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- This script configures the relational database schema, auto-sync triggers,
-- Row Level Security (RLS) policies, and seed products for Trivo Kenya.
-- Run this entire script inside the Supabase SQL Editor.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CLEANUP & INITIALIZATION (Safe for re-running)
-- ------------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. SCHEMA TABLES
-- ------------------------------------------------------------------------------

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, 
  description TEXT,
  price INTEGER NOT NULL, -- Price in KES (Kenyan Shillings)
  stock INTEGER DEFAULT 0,
  category TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Safely enforce uniqueness on products name for existing tables
DELETE FROM public.products a USING public.products b 
WHERE a.id < b.id AND a.name = b.name;

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_name_key;
ALTER TABLE public.products ADD CONSTRAINT products_name_key UNIQUE (name);

-- Public Subscribers Table (Newsletter Signups)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- Public Customers Table (User Profiles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer Orders Table (from checkout flow)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]', -- Cart items snapshot
  total INTEGER NOT NULL, -- Total amount in KES
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, completed, cancelled
  whatsapp_message TEXT, -- Auto-generated checkout link text
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Web Push Notification Subscriptions Table
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- NEW TABLES FOR ADMIN/VENDOR SYSTEM
-- ==============================================================================

-- Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  business_name TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add vendor_id to products if missing (separate from CREATE TABLE for idempotency)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS vendor_id UUID;

-- Add FK constraint if it doesn't exist (safe to re-run)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_vendor_id_fkey'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_vendor_id_fkey
      FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Admin Orders Table (receipt-based orders managed by admin)
CREATE TABLE IF NOT EXISTS public.admin_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL,
  delivery_fee INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  mpesa_reference TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns to admin_orders if missing (for existing tables from older schema)
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS subtotal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0;
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS mpesa_reference TEXT NOT NULL DEFAULT '';
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS vendor_id UUID;
ALTER TABLE public.admin_orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';

-- Safely add FK constraint for admin_orders.vendor_id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_orders_vendor_id_fkey'
  ) THEN
    ALTER TABLE public.admin_orders ADD CONSTRAINT admin_orders_vendor_id_fkey
      FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Safely add check constraint for admin_orders.status
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_orders_status_check'
  ) THEN
    ALTER TABLE public.admin_orders ADD CONSTRAINT admin_orders_status_check
      CHECK (status IN ('confirmed', 'dispatched', 'delivered', 'refunded'));
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. AUTOMATION TRIGGERS (Automates profile generation)
-- ------------------------------------------------------------------------------

-- Automatically create customer profile when a new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SET search_path = public AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 4. SECURITY & ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 5. POLICIES
-- ------------------------------------------------------------------------------

-- Products Policies
DROP POLICY IF EXISTS "Allow public read access on products" ON public.products;
CREATE POLICY "Allow public read access on products" ON public.products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated full access on products" ON public.products;

DROP POLICY IF EXISTS "Allow vendor read own products" ON public.products;
CREATE POLICY "Allow vendor read own products" ON public.products
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE email = auth.email()));

DROP POLICY IF EXISTS "Allow vendor insert own products" ON public.products;
CREATE POLICY "Allow vendor insert own products" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE email = auth.email()));

DROP POLICY IF EXISTS "Allow vendor update own products" ON public.products;
CREATE POLICY "Allow vendor update own products" ON public.products
  FOR UPDATE TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE email = auth.email()))
  WITH CHECK (vendor_id IN (SELECT id FROM public.vendors WHERE email = auth.email()));

-- Subscribers Policies
DROP POLICY IF EXISTS "Allow public insert on subscribers" ON public.subscribers;
CREATE POLICY "Allow public insert on subscribers" ON public.subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access on subscribers" ON public.subscribers;

-- Customers Policies
DROP POLICY IF EXISTS "Allow customers to manage their own profile" ON public.customers;
CREATE POLICY "Allow customers to manage their own profile" ON public.customers
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Orders Policies (customer checkout)
DROP POLICY IF EXISTS "Allow customers to manage their own orders" ON public.orders;
CREATE POLICY "Allow customers to manage their own orders" ON public.orders
  FOR ALL TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Notification Subscriptions Policies
DROP POLICY IF EXISTS "Allow customers to manage their own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Allow customers to manage their own subscriptions" ON public.notification_subscriptions
  FOR ALL TO authenticated
  USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()))
  WITH CHECK (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

-- Vendors Policies
DROP POLICY IF EXISTS "Allow public read vendors" ON public.vendors;
CREATE POLICY "Allow public read vendors" ON public.vendors
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin all vendors" ON public.vendors;

DROP POLICY IF EXISTS "Allow vendor read own" ON public.vendors;
CREATE POLICY "Allow vendor read own" ON public.vendors
  FOR SELECT TO authenticated
  USING (email = auth.email());

DROP POLICY IF EXISTS "Allow vendor insert own" ON public.vendors;
CREATE POLICY "Allow vendor insert own" ON public.vendors
  FOR INSERT TO authenticated
  WITH CHECK (email = auth.email());

-- Admin Users Table (for access control)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews Table (DB-backed reviews)
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read reviews" ON public.reviews;
CREATE POLICY "Allow public read reviews" ON public.reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (true);

-- Admin Orders Policies
DROP POLICY IF EXISTS "Allow public read admin_orders by receipt" ON public.admin_orders;

DROP POLICY IF EXISTS "Allow vendor read own admin_orders" ON public.admin_orders;
CREATE POLICY "Allow vendor read own admin_orders" ON public.admin_orders
  FOR SELECT TO authenticated
  USING (vendor_id IN (SELECT id FROM public.vendors WHERE email = auth.email()));

-- Add SEO columns to products if they don't exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS focus_keyword TEXT;

-- CJ Dropshipping integration
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS cj_product_id TEXT;

-- Enhanced product content columns
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS dimensions TEXT;

-- Product variants (like WooCommerce attributes)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
-- variant_options stores SKU-level pricing/stock for each combination
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variant_options JSONB DEFAULT '[]'::jsonb;

-- SEO content fields (long-form description + secondary keywords for rich product pages)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Admin Users Policies
DROP POLICY IF EXISTS "Allow admin users to select own" ON public.admin_users;
CREATE POLICY "Allow admin users to select own" ON public.admin_users
  FOR SELECT TO authenticated
  USING (email = auth.email());

DROP POLICY IF EXISTS "Allow admin users to insert own" ON public.admin_users;

-- ------------------------------------------------------------------------------
-- 6. SEED DATA (Clean, conflict-safe upserts)
-- ------------------------------------------------------------------------------
-- Seed data removed to prevent demo products from re-appearing after deletion.

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKETS (Product Images)
-- ------------------------------------------------------------------------------

-- Create a bucket for product images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated insert" ON storage.objects;
CREATE POLICY "Authenticated insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated update" ON storage.objects;
CREATE POLICY "Authenticated update own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND owner_id = auth.uid()::uuid)
  WITH CHECK (bucket_id = 'product-images' AND owner_id = auth.uid()::uuid);

DROP POLICY IF EXISTS "Authenticated delete" ON storage.objects;
CREATE POLICY "Authenticated delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND owner_id = auth.uid()::uuid);

-- ==============================================================================
-- SLUG MIGRATION
-- Run this in the Supabase SQL Editor BEFORE deploying slug-based routing.
-- ==============================================================================

-- Step 1: Add the slug column (nullable first so existing rows don't violate NOT NULL)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Backfill slugs from existing product names
--   Rule: lowercase → strip special chars → spaces→hyphens → append "-kenya"
--   Example: "Oraimo Space Buds ANC" → "oraimo-space-buds-anc-kenya"
UPDATE public.products
SET slug = regexp_replace(
              regexp_replace(
                lower(trim(name)),
                '[^a-z0-9\s-]', '', 'g'
              ),
              '\s+', '-', 'g'
           ) || '-kenya'
WHERE slug IS NULL;

-- Step 3: Enforce NOT NULL + UNIQUE after backfill is complete
ALTER TABLE public.products ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_slug_key;
ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);

-- Step 4: Create index for fast slug lookups on the product detail page
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- ==============================================================================
-- BLOG POSTS
-- Simple blog for product guides, reviews, and tech news.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  seo_title TEXT,
  seo_description TEXT,
  related_product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read blog_posts" ON public.blog_posts;
CREATE POLICY "Allow public read blog_posts" ON public.blog_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated all blog_posts" ON public.blog_posts;

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

