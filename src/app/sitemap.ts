import type { MetadataRoute } from 'next'
import { db } from '@/lib/db'

// Force this to render on-demand instead of at build time. Sitemap data
// (categories/products) is dynamic and the database may not exist yet at
// build time (e.g. a fresh Vercel deploy before `prisma db push` has run),
// which previously made `next build` fail entirely.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wameedstore.com'

  // Static homepage entry
  const homepage: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // If the database isn't reachable/initialized yet, still return a valid
  // sitemap with just the homepage rather than crashing the whole route.
  try {
    // Fetch all categories from the database
    const categories = await db.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { order: 'asc' },
    })

    const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/?category=${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Fetch all products from the database
    const products = await db.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/?product=${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    return [...homepage, ...categoryEntries, ...productEntries]
  } catch (error) {
    console.error('sitemap: failed to load categories/products from database', error)
    return homepage
  }
}
