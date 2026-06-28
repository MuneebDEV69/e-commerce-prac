import Image from 'next/image'
import Link from 'next/link'
import { type Product, formatPrice } from '../../lib/products'

/**
 * Clean product card — image, title, "From <price>". No borders/shadows.
 * Whole card links to the product detail page.
 */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 className="mt-3 text-center text-xs sm:text-[13px] tracking-wider text-gray-800">
        {product.title}
      </h3>
      <p className="mt-1 text-center text-xs text-gray-500">
        From {formatPrice(product.priceFrom)}
      </p>
    </Link>
  )
}
