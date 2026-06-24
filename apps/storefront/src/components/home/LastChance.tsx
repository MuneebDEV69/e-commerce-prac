import Image from 'next/image'
import Link from 'next/link'

/**
 * "LAST CHANCE" banner — full-bleed background image. The whole banner links to /shop.
 */
export default function LastChance() {
  return (
    <Link
      href="/shop"
      className="relative block min-h-[500px] h-[60vh] w-full overflow-hidden"
      aria-label="Shop the Last Chance edit"
    >
      <Image
        src="/images/last-chance-bg.jpeg"
        alt="Styled bedroom"
        fill
        sizes="100vw"
        className="object-cover"
      />
    </Link>
  )
}
