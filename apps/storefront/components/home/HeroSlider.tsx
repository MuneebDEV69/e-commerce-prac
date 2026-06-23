'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'

const SLIDES = [
  '/images/hero-1.png',
  '/images/hero-2.png',
  '/images/hero-3.png',
  '/images/hero-4.png',
  '/images/hero-5.png',
  '/images/hero-6.png',
  '/images/hero-7.png'
]

const AUTOPLAY_MS = 4500

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const goTo = useCallback(
    (next: number) => setCurrent((next + SLIDES.length) % SLIDES.length),
    []
  )
  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  // Autoplay — restarts whenever the slide changes or play state toggles.
  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [isPlaying])

  return (
    <section className="w-full">
      {/* Slides */}
      <div className="relative h-[60vh] sm:h-[68vh] lg:h-[72vh] w-full overflow-hidden bg-cream">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={i !== current}
          >
            <Image
              src={src}
              alt={`Hero slide ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Bottom control bar */}
      <div className="bg-cream">
        <div className="flex items-center justify-center gap-6 py-3 text-gray-700">
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="hover:text-brand transition-colors"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
          </button>

          <span className="text-sm tabular-nums tracking-widest select-none">
            {current + 1} / {SLIDES.length}
          </span>

          <button
            onClick={next}
            aria-label="Next slide"
            className="hover:text-brand transition-colors"
          >
            <ChevronRight size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            className="ml-2 hover:text-brand transition-colors"
          >
            {isPlaying ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </section>
  )
}
