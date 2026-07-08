import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')

  const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `https://trivokenya.store/products/${product.slug}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, published_at')
    .lte('published_at', new Date().toISOString())

  const blogPostUrls: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `https://trivokenya.store/blog/${post.slug}`,
    lastModified: new Date(post.published_at),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  const categorySlugs = ["audio", "car-accessories", "smart-home", "cables", "lighting"]
  const categoryUrls: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `https://trivokenya.store/categories/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: 'https://trivokenya.store',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://trivokenya.store/products',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://trivokenya.store/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: 'https://trivokenya.store/how-to-order',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://trivokenya.store/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://trivokenya.store/delivery',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://trivokenya.store/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://trivokenya.store/returns',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://trivokenya.store/reviews',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: 'https://trivokenya.store/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://trivokenya.store/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...categoryUrls,
    ...productUrls,
    ...blogPostUrls,
  ]
}
