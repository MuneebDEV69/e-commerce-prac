'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * "CURATED FOR YOU" — horizontal scroll category carousel.
 * Each category image already has its label baked in (e.g. "NEW ARRIVALS",
 * "THE WEDDING EDIT"), so we render the photo cleanly and repeat the label as
 * plain text below — no overlay text (that would duplicate).
 *
 * Navigation: prev/next arrow buttons scroll the row by roughly one viewport of
 * cards; the thin bar below is a live scroll indicator (grey track + dark thumb).
 */
const CATEGORIES = [
  { src: '/images/cat-new-arrivals.jpg', label: 'NEW ARRIVALS' },
  { src: '/images/cat-kids.jpg', label: 'KIDS BEDDING' },
  { src: '/images/cat-wedding.jpg', label: 'THE WEDDING EDIT' },
  { src: '/images/cat-luxury.jpg', label: 'LUXURY BEDDING' },
  { src: '/images/cat-throws.jpg', label: 'THROWS' },
  { src: '/images/cat-signature.jpg', label: 'SIGNATURE BEDDING' },
  { src: '/images/cat-cushions.jpg', label: 'CUSHIONS' },
  { src: '/images/cat-basic.jpg', label: 'BASIC BEDDING' },
  { src: '/images/cat-dining.jpg', label: 'DINING' },
  { src: '/images/cat-pet.jpg', label: 'PET' }
]

export default function CuratedCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  // thumb geometry as fractions (0..1): width = visible portion, left = scroll offset
  const [thumb, setThumb] = useState({ width: 1, left: 0 })

  const updateThumb = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const width = clientWidth / scrollWidth
    const maxScroll = scrollWidth - clientWidth
    const left = maxScroll > 0 ? (scrollLeft / maxScroll) * (1 - width) : 0
    setThumb({ width, left })
  }

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    // scroll by ~80% of the visible width so a few cards advance per click
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  useEffect(() => {
    updateThumb()
    window.addEventListener('resize', updateThumb)
    return () => window.removeEventListener('resize', updateThumb)
  }, [])

  return (
    <section className="py-12 lg:py-16">
      {/* Heading + arrow controls */}
      <div className="relative mb-10">
        <h2 className="text-center text-2xl sm:text-3xl tracking-[0.2em] text-gray-800">
          CURATED FOR YOU
        </h2>
        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex gap-2">
          <button
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
            className="grid place-items-center h-9 w-9 rounded-full border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
            className="grid place-items-center h-9 w-9 rounded-full border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        onScroll={updateThumb}
        className="flex gap-5 md:gap-6 overflow-x-auto px-4 md:px-12 snap-x scrollbar-none scroll-smooth"
      >
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="shrink-0 snap-center w-[230px] md:w-[280px]">
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image
                src={cat.src}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 230px, 280px"
                className="object-cover"
              />
            </div>
            <p className="mt-3 text-center text-xs tracking-widest text-gray-700">{cat.label}</p>
          </div>
        ))}
      </div>

      {/* Custom scroll progress bar */}
      <div className="mx-4 md:mx-12 mt-6 h-[3px] bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-[margin] duration-75"
          style={{ width: `${thumb.width * 100}%`, marginLeft: `${thumb.left * 100}%` }}
        />
      </div>
    </section>
  )
}
