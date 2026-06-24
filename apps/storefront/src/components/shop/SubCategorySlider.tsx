'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * "WHAT'S NEW" — horizontal row of circular sub-category thumbnails with a slim
 * custom scroll progress bar beneath (reuses the cat-* category images).
 */
const SUBCATS = [
  { src: '/images/cat-wedding.jpg', label: 'THE WEDDING EDIT' },
  { src: '/images/cat-basic.jpg', label: 'BASIC BEDDING' },
  { src: '/images/cat-luxury.jpg', label: 'LUXURY BEDDING' },
  { src: '/images/cat-signature.jpg', label: 'SIGNATURE BEDDING' },
  { src: '/images/cat-cushions.jpg', label: 'CUSHIONS' },
  { src: '/images/cat-throws.jpg', label: 'THROWS' },
  { src: '/images/cat-dining.jpg', label: 'DINING' },
  { src: '/images/cat-kids.jpg', label: 'KIDS BEDDING' },
  { src: '/images/cat-pet.jpg', label: 'PET BEDS' },
  { src: '/images/cat-new-arrivals.jpg', label: 'NEW ARRIVALS' }
]

export default function SubCategorySlider() {
  const scrollRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    updateThumb()
    window.addEventListener('resize', updateThumb)
    return () => window.removeEventListener('resize', updateThumb)
  }, [])

  return (
    <div className="flex items-center gap-6 px-4 md:px-10 py-6">
      <span className="hidden md:block shrink-0 text-sm tracking-[0.2em] text-gray-700">
        WHAT&apos;S NEW
      </span>

      <div className="flex-1 min-w-0">
        <div
          ref={scrollRef}
          onScroll={updateThumb}
          className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth"
        >
          {SUBCATS.map((c) => (
            <button key={c.label} className="shrink-0 flex flex-col items-center gap-2 group">
              <span className="relative block w-16 h-16 md:w-[72px] md:h-[72px] rounded-full overflow-hidden ring-1 ring-gray-200 group-hover:ring-brand transition">
                <Image src={c.src} alt={c.label} fill sizes="72px" className="object-cover" />
              </span>
              <span className="text-[10px] tracking-wider text-gray-600 whitespace-nowrap">
                {c.label}
              </span>
            </button>
          ))}
        </div>

        {/* slim scroll progress bar */}
        <div className="mt-4 h-[3px] bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-500 rounded-full transition-[margin] duration-75"
            style={{ width: `${thumb.width * 100}%`, marginLeft: `${thumb.left * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
