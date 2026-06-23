import Image from 'next/image'

/**
 * Overlapping editorial feature section (Bedding & Cushions).
 *
 * Two-column grid, top-aligned. The cushion image in the right column is pulled
 * left with a negative margin (md+) so it sits partially over the left column —
 * the high-end "overlap" look. On mobile everything stacks cleanly (no overlap).
 */
export default function FeatureShowcase() {
  return (
    <section className="bg-[#fdfbf9] py-16 lg:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-y-12 md:gap-x-8 items-start">
        {/* LEFT COLUMN — bedding image, then "Little Details" copy below */}
        <div className="flex flex-col">
          <div className="relative w-full aspect-[4/5] overflow-hidden">
            <Image
              src="/images/story-bedding.jpg"
              alt="Embroidered bedding set in a styled bedroom"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="text-center max-w-sm mx-auto mt-10 md:mt-16 px-4">
            <h3 className="text-base sm:text-lg tracking-[0.15em] text-gray-800">
              LITTLE DETAILS, BIG IMPACT
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Cushions that bring comfort and a gentle touch of personality to your
              space. Made from soft duck cotton and textured jute canvas.
            </p>
            <button className="mt-6 bg-brand text-white text-xs tracking-[0.2em] px-10 py-3 hover:bg-brand-dark transition-colors">
              CUSHIONS
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN — bedding copy, then overlapping cushion image */}
        <div className="flex flex-col">
          <div className="max-w-md md:pt-24 md:pl-6">
            <button className="bg-brand text-white text-xs tracking-[0.2em] px-7 py-2.5">
              BEDDING
            </button>
            <p className="mt-5 text-sm leading-relaxed text-gray-500">
              Soft, breathable bedding sets in fresh, beautiful designs, finished with
              delicate embroidery and thoughtful contrasts. Made from 100% cotton,
              sateen, and velvet for everyday comfort.
            </p>
            <h3 className="mt-5 text-base sm:text-lg tracking-[0.15em] text-gray-800">
              WHERE COMFORT MEETS ELEGANCE
            </h3>
          </div>

          {/* Pulled left only slightly so it sits to the RIGHT of the bedding image
              (a gentle overlap), not far over the bed. */}
          <div className="relative aspect-square mt-10 z-10 w-full md:w-[112%] md:-ml-4 lg:-ml-8">
            <Image
              src="/images/story-cushions.jpg"
              alt="Red floral cushion on a white sofa"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
