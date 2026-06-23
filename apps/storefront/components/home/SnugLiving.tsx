import Image from 'next/image'

/**
 * "SNUG & STYLISH LIVING" — 3-column feature grid with a two-tone split background.
 * Top half mustard, bottom half off-white; the tall images straddle the divide for
 * an editorial look. The heading sits in the mustard band; copy sits in the off-white.
 */
const FEATURES = [
  {
    src: '/images/feature-bedding.jpg',
    title: 'SIGNATURE BEDDING',
    desc: 'Clean, crisp, and refined. Hotel-grade luxury bedding sets crafted from 100% cotton sateen with a 300+ thread count — silky smooth, breathable, and built to last.'
  },
  {
    src: '/images/feature-throw.jpg',
    title: 'THROWS',
    desc: 'Warm, lightweight cotton throws and blankets, ideal for layering on your bed or sofa. Designed for daily comfort without compromising on style.'
  },
  {
    src: '/images/feature-kids.jpg',
    title: 'KIDS',
    desc: 'Soft, breathable, and built for little ones. Our kids bedding sets are made from 100% cotton percale — easy to wash, comfortable to sleep in, and designed for everyday use.'
  }
]

export default function SnugLiving() {
  return (
    <section className="relative bg-offwhite overflow-hidden">
      {/* Top half mustard — bottom half is the section's off-white background */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-brand" aria-hidden />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <h2 className="text-center text-white text-2xl sm:text-3xl tracking-[0.2em] pt-12 pb-10">
          SNUG &amp; STYLISH LIVING
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {FEATURES.map((item) => (
            <div key={item.title} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-xl">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="text-center px-2 pt-6">
                <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-800">
                  {item.title}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-gray-600 max-w-xs mx-auto">
                  {item.desc}
                </p>
                <a
                  href="#"
                  className="mt-4 inline-block text-brand text-[11px] tracking-[0.2em] border-b border-brand pb-0.5 hover:text-brand-dark hover:border-brand-dark transition-colors"
                >
                  SHOP NOW →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
