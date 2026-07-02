import Image from 'next/image'
import Link from 'next/link'
import { ImageOff } from 'lucide-react'
import { formatPrice } from '../../lib/products'

export type ShopCard = {
  slug: string
  title: string
  priceFrom: number
  image: string | null
}

/**
 * Clean product card — image (first media URL), title, "From <price>".
 * Falls back to a neutral placeholder when a product has no media yet.
 */
export default function ProductCard({ product }: { product: ShopCard }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
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
