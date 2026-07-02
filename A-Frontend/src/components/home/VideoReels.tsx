'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'

/**
 * "#INDULGENCE, THE ARAISH WAY" — vertical 9:16 video reels carousel.
 *
 * PERFORMANCE: the reels total ~110MB. We never load them all up front. An
 * IntersectionObserver mounts a card's <video> only when it scrolls near the
 * viewport, and pauses videos that leave view. So an anonymous visitor who never
 * scrolls to this section downloads zero video bytes.
 *
 * Scroll tracking: the active dot is derived from the track's scrollLeft (instant).
 * Per-card mute: each card tracks its own muted state; unmuting one re-mutes others.
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
  const [unmutedIndex, setUnmutedIndex] = useState(-1)
  // Which cards have scrolled near the viewport — only these mount a <video>.
  const [loaded, setLoaded] = useState<boolean[]>(() => REELS.map(() => false))

  // Lazy-mount + play/pause based on viewport visibility.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const i = Number((entry.target as HTMLElement).dataset.index)
          if (entry.isIntersecting) {
            setLoaded((prev) => {
              if (prev[i]) return prev
              const next = [...prev]
              next[i] = true
              return next
            })
            videoRefs.current[i]?.play().catch(() => {})
          } else {
            videoRefs.current[i]?.pause()
          }
        })
      },
      { root: null, rootMargin: '300px', threshold: 0.1 }
    )
    cardRefs.current.forEach((c) => c && observer.observe(c))
    return () => observer.disconnect()
  }, [])

  const stepSize = () => {
    const a = cardRefs.current[0]
    const b = cardRefs.current[1]
    if (a && b) return b.offsetLeft - a.offsetLeft
    return a ? a.offsetWidth : 0
  }

  const scrollToCard = useCallback((index: number) => {
    const el = trackRef.current
    if (!el) return
    const i = Math.max(0, Math.min(REELS.length - 1, index))
    el.scrollTo({ left: i * stepSize(), behavior: 'smooth' })
  }, [])

  const scrollByOne = (dir: 1 | -1) => scrollToCard(activeIndex + dir)

  const onTrackScroll = () => {
    const el = trackRef.current
    const step = stepSize()
    if (!el || !step) return
    setActiveIndex(Math.round(el.scrollLeft / step))
  }

  const toggleMute = (index: number) => {
    const clickedMuted = unmutedIndex === index
    videoRefs.current.forEach((v) => { if (v) v.muted = true })
    if (clickedMuted) {
      setUnmutedIndex(-1)
    } else {
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
        onScroll={onTrackScroll}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
      >
        {REELS.map((src, i) => (
          <div
            key={src}
            data-index={i}
            ref={(el) => { cardRefs.current[i] = el }}
            className="relative shrink-0 snap-start w-[220px] sm:w-[240px] md:w-[270px] aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900"
          >
            {loaded[i] && (
              <video
                ref={(el) => { videoRefs.current[i] = el }}
                src={src}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-cover rounded-2xl"
              />
            )}

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
                ? 'w-8 h-[6px] bg-brand'
                : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
