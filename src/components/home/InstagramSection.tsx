import Image from 'next/image'

/**
 * "#INSTAGRAM" — a single wide collage image (the artwork already contains the
 * individual posts), shown full-width and responsive.
 */
export default function InstagramSection() {
  return (
    <section className="py-12 lg:py-16">
      <h2 className="text-center text-2xl tracking-[0.2em] text-gray-800 mb-10">
        #INSTAGRAM
      </h2>
      <div className="max-w-7xl mx-auto px-4">
        <Image
          src="/images/instagram-section.png"
          alt="Araish on Instagram"
          width={783}
          height={176}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </section>
  )
}
