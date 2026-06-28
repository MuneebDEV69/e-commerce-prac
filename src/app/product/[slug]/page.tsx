import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductGallery from '../../../components/product/ProductGallery'
import BuyBox from '../../../components/product/BuyBox'
import { PRODUCTS, getProduct, formatPrice } from '../../../lib/products'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const product = getProduct(params.slug)
  if (!product) return { title: 'Product not found — Muneeb Ki Araish' }

  const title = `${product.title} — Muneeb Ki Araish`
  const description = `${product.description} From ${formatPrice(product.priceFrom)}.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: product.image }]
    }
  }
}

export default function ProductPage({ params }: Params) {
  const product = getProduct(params.slug)
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.gallery} title={product.title} />
        <BuyBox product={product} />
      </div>
    </div>
  )
}
