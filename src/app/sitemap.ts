import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const SITE_URL = 'https://trivokenya.store'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Fetch all active products with slug and timestamps
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at, category, stock, brand')
    .order('created_at', { ascending: false })

  const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${SITE_URL}/products/${product.slug}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly' as const,
    priority: (product.stock ?? 0) > 0 ? 0.85 : 0.6,
  }))

  // Fetch published blog posts only
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .lte('published_at', new Date().toISOString())

  const blogPostUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.65,
  }))

  // Active phone/laptop categories (derived from products)
  const activeCategories = new Set<string>()
  const knownPhoneCategories = ['Phones', 'Laptops', 'Apple', 'Samsung', 'Tecno', 'Redmi', 'Xiaomi', 'Google', 'Infinix', 'HP', 'Lenovo', 'Dell', 'ASUS', 'Acer']
  ;(products || []).forEach((p) => {
    if (p.category && knownPhoneCategories.includes(p.category)) {
      activeCategories.add(p.category.toLowerCase().replace(/\s+/g, '-'))
    }
    if (p.brand && knownPhoneCategories.includes(p.brand)) {
      activeCategories.add(p.brand.toLowerCase().replace(/\s+/g, '-'))
    }
  })

  const categoryUrls: MetadataRoute.Sitemap = Array.from(activeCategories).map((cat) => ({
    url: `${SITE_URL}/categories/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Static core pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guides`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/how-to-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/delivery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/reviews`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  return [
    ...staticPages,
    ...categoryUrls,
    ...productUrls,
    ...blogPostUrls,
  ]
}
