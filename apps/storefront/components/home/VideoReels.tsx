'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'

/**
 * "#INDULGENCE, THE ARAISH WAY" — vertical 9:16 video reels carousel.
 *
 * Scroll tracking: IntersectionObserver watches each card so the active dot
 * always reflects the card that is most visible — clicking a dot scrolls to
 * that card. The < / > arrows scroll by exactly one card width.
 *
 * Per-card mute toggle: each card tracks its own muted state. On mount all
 * videos start muted (browser autoplay policy requires this). Clicking the
 * speaker icon unmutes that card only and re-mutes any previously unmuted one.
 */

const REELS = [
  '/videos/reel-1.mp4',
  '/videos/reel-2.mp4',
  '/videos/reel-3.mp4',
  '/videos/reel-4.mp4',
  '/videos/reel-5.mp4',
  '/videos/reel-6.mp4',
  '/videos/reel-7.mp4',
  '/videos/reel-8.mp4'
]

export default function VideoReels() {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const [activeIndex, setActiveIndex] = useState(0)
  // index of the currently unmuted video (-1 = all muted)
  const [unmutedIndex, setUnmutedIndex] = useState(-1)

  // IntersectionObserver: whichever card has the greatest intersection becomes active dot
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            setActiveIndex(i)
          }
        },
        { root: trackRef.current, threshold: 0.5 }
      )
      obs.observe(card)
      observers.push(obs)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  const scrollToCard = useCallback((index: number) => {
    const card = cardRefs.current[index]
    if (!card) return
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [])

  const scrollByOne = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(REELS.length - 1, activeIndex + dir))
    scrollToCard(next)
  }

  const toggleMute = (index: number) => {
    const clickedMuted = unmutedIndex === index
    // mute everything
    videoRefs.current.forEach((v) => { if (v) v.muted = true })
    if (clickedMuted) {
      // was already unmuted → mute it (toggle off)
      setUnmutedIndex(-1)
    } else {
      // unmute this one
      const v = videoRefs.current[index]
      if (v) v.muted = false
      setUnmutedIndex(index)
    }
  }

  return (
    <section className="py-12 lg:py-16 bg-white px-4 md:px-12">
      {/* Header row */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.05em] text-gray-900">
          #INDULGENCE, THE ARAISH WAY
        </h2>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => scrollByOne(-1)}
            aria-label="Previous reel"
            className="grid place-items-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => scrollByOne(1)}
            aria-label="Next reel"
            className="grid place-items-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Scrollable track */}
      <div
        ref={trackRef}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
      >
        {REELS.map((src, i) => (
          <div
            key={src}
            ref={(el) => { cardRefs.current[i] = el }}
            className="relative shrink-0 snap-center w-[220px] sm:w-[240px] md:w-[270px] aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900"
          >
            <video
              ref={(el) => { videoRefs.current[i] = el }}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Mute / unmute button */}
            <button
              onClick={() => toggleMute(i)}
              aria-label={unmutedIndex === i ? 'Mute video' : 'Unmute video'}
              className="absolute bottom-4 right-4 grid place-items-center w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              {unmutedIndex === i
                ? <Volume2 size={16} strokeWidth={2} />
                : <VolumeX size={16} strokeWidth={2} />
              }
            </button>
          </div>
        ))}
      </div>

      {/* Dot/pill pagination */}
      <div className="flex items-center justify-center gap-[6px] mt-7">
        {REELS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToCard(i)}
            aria-label={`Go to reel ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? 'w-8 h-[6px] bg-brand'          // active → gold pill
                : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400' // inactive → grey dot
            }`}
          />
        ))}
      </div>
    </section>
  )
}
