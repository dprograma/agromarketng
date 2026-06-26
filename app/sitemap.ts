import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

const BASE_URL = 'https://www.agromarketng.com'

const BLOG_SLUGS = [
  'future-smart-farming-nigeria',
  'crop-rotation-tips',
  'pricing-agricultural-products',
  'organic-farming-guide',
  'crop-protection-guide',
  'agricultural-loans-guide',
  'water-conservation-techniques',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/testimonials`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ]

  const blogPages: MetadataRoute.Sitemap = BLOG_SLUGS.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  let adPages: MetadataRoute.Sitemap = []
  try {
    const ads = await prisma.ad.findMany({
      where: { status: 'Active' },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 5000,
    })
    adPages = ads.map((ad) => ({
      url: `${BASE_URL}/products/${ad.id}`,
      lastModified: ad.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch {
    // DB unavailable during static generation — skip dynamic pages
  }

  return [...staticPages, ...blogPages, ...adPages]
}
