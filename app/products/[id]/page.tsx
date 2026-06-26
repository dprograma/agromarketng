import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ProductDetailsClient from './ProductDetailsClient'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const product = await prisma.ad.findUnique({
      where: { id },
      select: { title: true, description: true, location: true, price: true, category: true, images: true },
    })

    if (!product) {
      return { title: 'Product Not Found | AgroMarket NG' }
    }

    const priceNum = Number(product.price)
    const formattedPrice = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(priceNum)

    const title = `${product.title} in ${product.location} — ${formattedPrice} | AgroMarket NG`
    const description = `${product.description.slice(0, 155).trim()}…`
    const image = product.images[0] ?? 'https://www.agromarketng.com/assets/images/og-image.jpg'

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `https://www.agromarketng.com/products/${id}`,
        type: 'website',
        images: [{ url: image, width: 800, height: 600, alt: product.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: `https://www.agromarketng.com/products/${id}`,
      },
    }
  } catch {
    return { title: 'AgroMarket NG' }
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params

  let jsonLd: object | null = null
  try {
    const product = await prisma.ad.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
        price: true,
        images: true,
        location: true,
        category: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    })

    if (product) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: product.images,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'NGN',
          price: Number(product.price),
          availability:
            product.status === 'Active'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Person',
            name: product.user.name,
          },
          areaServed: {
            '@type': 'State',
            name: product.location,
          },
        },
        category: product.category,
        datePosted: product.createdAt.toISOString(),
      }
    }
  } catch {
    // Proceed without structured data if DB is unavailable
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailsClient />
    </>
  )
}
