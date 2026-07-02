import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductGallery from '../../../components/product/ProductGallery'
import BuyBox from '../../../components/product/BuyBox'
import { type Product, formatPrice } from '../../../lib/products'
import { fetchProduct } from '@/lib/api'

// ISR: cache each product page, revalidate in the background.
export const revalidate = 120

type Params = { params: { slug: string } }

// cache() dedupes within a single request, so generateMetadata() and the page
// component share ONE API round-trip instead of two.
const loadProduct = cache(async (slug: string) => fetchProduct(slug))

/** Map a DB product into the shape ProductGallery + BuyBox expect. */
function toViewModel(p: NonNullable<Awaited<ReturnType<typeof loadProduct>>>): Product {
  return {
    slug: p.slug,
    title: p.title,
    priceFrom: p.priceFrom,
    image: p.mediaUrls[0] ?? '',
    gallery: p.mediaUrls,
    category: p.category?.name ?? '',
    fabric: '',
    color: '',
    description: p.description ?? '',
    // Variants aren't modelled per-product yet — selectors stay hidden until they are.
    sizes: [],
    fabrics: [],
    colors: [],
    addOns: []
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await loadProduct(params.slug)
  if (!p) return { title: 'Product not found — Muneeb Ki Araish' }

  const title = `${p.title} — Muneeb Ki Araish`
  const description = `${p.description ?? ''} From ${formatPrice(p.priceFrom)}.`.trim()
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: p.mediaUrls[0] ? [{ url: p.mediaUrls[0] }] : []
    }
  }
}

export default async function ProductPage({ params }: Params) {
  const p = await loadProduct(params.slug)
  if (!p) notFound()

  const product = toViewModel(p)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.gallery} title={product.title} />
        <BuyBox product={product} />
      </div>
    </div>
  )
}
