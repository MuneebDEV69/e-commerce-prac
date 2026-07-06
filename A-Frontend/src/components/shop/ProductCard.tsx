'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { formatPrice } from '../../lib/products'

export type ShopCard = {
  slug: string
  title: string
  priceFrom: number
  image: string | null
  category?: string | null
  inStock?: boolean
}

/**
 * Clean product card — image (first media URL), title, "From <price>".
 * The image area shows a shimmering skeleton until the (remote Supabase) image
 * finishes loading, so cards never sit as empty boxes. Falls back to a neutral
 * placeholder when a product has no media.
 */
export default function ProductCard({ product }: { product: ShopCard }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        {product.image ? (
          <>
            {/* Shimmer placeholder until the image loads */}
            {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setLoaded(true)}
              className={`object-cover transition-[opacity,transform] duration-500 group-hover:scale-105 ${
                loaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-300">
            <ImageOff size={32} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <h3 className="mt-3 text-center text-xs sm:text-[13px] tracking-wider text-gray-800">
        {product.title}
      </h3>
      <p className="mt-1 text-center text-xs text-gray-500">From {formatPrice(product.priceFrom)}</p>
    </Link>
  )
}
