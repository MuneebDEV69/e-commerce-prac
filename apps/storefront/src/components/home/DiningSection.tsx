import Image from 'next/image'
import Link from 'next/link'

/**
 * "DINING" — asymmetrical split layout.
 * Left: right-aligned text block (heading, copy, BUY NOW). Right: full-bleed image
 * that runs to the right edge of the screen with no padding.
 */
export default function DiningSection() {
  return (
    <section className="bg-offwhite">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Left — text, aligned right toward the image */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right px-8 md:px-12 lg:px-16 py-14 md:py-0">
          <h2 className="text-3xl sm:text-4xl tracking-[0.15em] text-gray-800">DINING</h2>
          <p className="mt-5 text-sm leading-relaxed text-gray-500 max-w-md">
            Elegant cotton table linens for every occasion, from everyday meals to formal
            dining. Tablecloths, runners, and napkins available for 4 to 12-seater tables.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-block bg-brand text-white text-xs tracking-[0.2em] px-10 py-3 hover:bg-brand-dark transition-colors"
          >
            BUY NOW
          </Link>
        </div>

        {/* Right — full-bleed image to the screen edge */}
        <div className="relative w-full h-[60vh] md:h-[78vh]">
          <Image
            src="/images/dining-story.jpg"
            alt="Cotton table linens set on a dining table"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
