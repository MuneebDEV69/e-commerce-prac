'use client'

/**
 * Data-driven storefront landing page. The page is an ordered array of "blocks"
 * (see @ecom/shared DEFAULT_LANDING_SECTIONS). Each block type maps to a component
 * below; BlockRenderer dispatches on block.type. Admins edit these blocks in the
 * Admin Panel's visual builder, so every section here is fully dynamic.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react'

type Content = Record<string, unknown>
export type Block = { id: string; type: string; content: Content }

// Small typed accessors so the free-form JSON content stays ergonomic.
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d)
function arr<T = unknown>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

/* ── Hero slider ── */
function HeroBlock({ content }: { content: Content }) {
  const slides = arr<string>(content.images)
  const [current, setCurrent] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const goTo = useCallback((next: number) => setCurrent((next + slides.length) % slides.length), [slides.length])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])
  const next = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    if (!isPlaying || slides.length < 2) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4500)
    return () => clearInterval(id)
  }, [isPlaying, slides.length])

  if (slides.length === 0) return null

  return (
    <section className="w-full">
      <div className="relative h-[60vh] sm:h-[68vh] lg:h-[72vh] w-full overflow-hidden bg-cream">
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-hidden={i !== current}
          >
            <Image src={src} alt={`Hero slide ${i + 1}`} fill priority={i === 0} sizes="100vw" className="object-contain sm:object-cover" />
          </div>
        ))}
      </div>
      <div className="bg-cream">
        <div className="flex items-center justify-center gap-6 py-3 text-gray-700">
          <button onClick={prev} aria-label="Previous slide" className="hover:text-brand transition-colors"><ChevronLeft size={20} strokeWidth={1.5} /></button>
          <span className="text-sm tabular-nums tracking-widest select-none">{current + 1} / {slides.length}</span>
          <button onClick={next} aria-label="Next slide" className="hover:text-brand transition-colors"><ChevronRight size={20} strokeWidth={1.5} /></button>
          <button onClick={() => setIsPlaying((p) => !p)} aria-label={isPlaying ? 'Pause' : 'Play'} className="ml-2 hover:text-brand transition-colors">
            {isPlaying ? <Pause size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Category carousel ── */
type CuratedItem = { image: string; label: string; link: string }
function CuratedBlock({ content }: { content: Content }) {
  const items = arr<CuratedItem>(content.items)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ width: 1, left: 0 })

  const updateThumb = () => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const width = clientWidth / scrollWidth
    const maxScroll = scrollWidth - clientWidth
    setThumb({ width, left: maxScroll > 0 ? (scrollLeft / maxScroll) * (1 - width) : 0 })
  }
  const scrollByCards = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: 'smooth' })
  useEffect(() => {
    updateThumb()
    window.addEventListener('resize', updateThumb)
    return () => window.removeEventListener('resize', updateThumb)
  }, [])

  if (items.length === 0) return null
  return (
    <section className="py-12 lg:py-16">
      <div className="relative mb-10">
        <h2 className="text-center text-2xl sm:text-3xl tracking-[0.2em] text-gray-800">{str(content.heading, 'CURATED FOR YOU')}</h2>
        <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex gap-2">
          <button onClick={() => scrollByCards(-1)} aria-label="Scroll left" className="grid place-items-center h-9 w-9 rounded-full border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition-colors"><ChevronLeft size={18} strokeWidth={1.5} /></button>
          <button onClick={() => scrollByCards(1)} aria-label="Scroll right" className="grid place-items-center h-9 w-9 rounded-full border border-gray-300 text-gray-700 hover:border-brand hover:text-brand transition-colors"><ChevronRight size={18} strokeWidth={1.5} /></button>
        </div>
      </div>
      <div ref={scrollRef} onScroll={updateThumb} className="flex gap-5 md:gap-6 overflow-x-auto px-4 md:px-12 snap-x scrollbar-none scroll-smooth">
        {items.map((cat, i) => (
          <Link key={`${cat.label}-${i}`} href={cat.link || '/shop'} className="shrink-0 snap-center w-[230px] md:w-[280px] group">
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image src={cat.image} alt={cat.label} fill sizes="(max-width: 768px) 230px, 280px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="mt-3 text-center text-xs tracking-widest text-gray-700 group-hover:text-brand transition-colors">{cat.label}</p>
          </Link>
        ))}
      </div>
      <div className="mx-4 md:mx-12 mt-6 h-[3px] bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gray-800 rounded-full transition-[margin] duration-75" style={{ width: `${thumb.width * 100}%`, marginLeft: `${thumb.left * 100}%` }} />
      </div>
    </section>
  )
}

/* ── Feature (Bedding & Cushions) ── */
function FeatureBlock({ content }: { content: Content }) {
  return (
    <section className="bg-[#fdfbf9] py-16 lg:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-y-12 md:gap-x-8 items-start">
        <div className="flex flex-col">
          {str(content.leftImage) && (
            <div className="relative w-full aspect-[4/5] overflow-hidden">
              <Image src={str(content.leftImage)} alt="" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
            </div>
          )}
          <div className="text-center max-w-sm mx-auto mt-10 md:mt-16 px-4">
            <h3 className="text-base sm:text-lg tracking-[0.15em] text-gray-800">{str(content.leftTitle)}</h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">{str(content.leftText)}</p>
            {str(content.leftButton) && (
              <Link href={str(content.leftLink, '/shop')} className="mt-6 inline-block bg-brand text-white text-xs tracking-[0.2em] px-10 py-3 hover:bg-brand-dark transition-colors">{str(content.leftButton)}</Link>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="max-w-md md:pt-24 md:pl-6">
            {str(content.rightButton) && (
              <Link href={str(content.rightLink, '/shop')} className="inline-block bg-brand text-white text-xs tracking-[0.2em] px-10 py-3 hover:bg-brand-dark transition-colors">{str(content.rightButton)}</Link>
            )}
            <p className="mt-5 text-sm leading-relaxed text-gray-500">{str(content.rightText)}</p>
            <h3 className="mt-5 text-base sm:text-lg tracking-[0.15em] text-gray-800">{str(content.rightTitle)}</h3>
          </div>
          {str(content.rightImage) && (
            <div className="relative aspect-square mt-10 z-10 w-full md:w-[112%] md:-ml-4 lg:-ml-8">
              <Image src={str(content.rightImage)} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── 3-column grid ── */
type SnugItem = { image: string; title: string; desc: string; link: string }
function SnugBlock({ content }: { content: Content }) {
  const items = arr<SnugItem>(content.items)
  return (
    <section className="relative bg-offwhite overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-brand" aria-hidden />
      <div className="relative z-10 max-w-[1550px] mx-auto px-4 md:px-6 pb-16">
        <h2 className="text-center text-white text-2xl sm:text-3xl tracking-[0.2em] pt-12 pb-10">{str(content.heading, 'SNUG & STYLISH LIVING')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-xl">
                <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="text-center px-2 pt-6">
                <h3 className="text-sm font-semibold tracking-[0.15em] text-gray-800">{item.title}</h3>
                <p className="mt-3 text-xs leading-relaxed text-gray-600 max-w-xs mx-auto">{item.desc}</p>
                <Link href={item.link || '/shop'} className="mt-4 inline-block text-brand text-[11px] tracking-[0.2em] border-b border-brand pb-0.5 hover:text-brand-dark hover:border-brand-dark transition-colors">SHOP NOW →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Split banner (Dining) ── */
function DiningBlock({ content }: { content: Content }) {
  return (
    <section className="bg-offwhite">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="flex flex-col items-center md:items-end text-center md:text-right px-8 md:px-12 lg:px-16 py-14 md:py-0">
          <h2 className="text-3xl sm:text-4xl tracking-[0.15em] text-gray-800">{str(content.heading, 'DINING')}</h2>
          <p className="mt-5 text-sm leading-relaxed text-gray-500 max-w-md">{str(content.text)}</p>
          {str(content.button) && (
            <Link href={str(content.link, '/shop')} className="mt-7 inline-block bg-brand text-white text-xs tracking-[0.2em] px-10 py-3 hover:bg-brand-dark transition-colors">{str(content.button)}</Link>
          )}
        </div>
        <div className="relative w-full h-[48vh] sm:h-[60vh] md:h-[78vh]">
          {str(content.image) && <Image src={str(content.image)} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />}
        </div>
      </div>
    </section>
  )
}

/* ── Video reels ── */
function ReelsBlock({ content }: { content: Content }) {
  const reels = arr<string>(content.videos)
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [unmutedIndex, setUnmutedIndex] = useState(-1)
  const [render, setRender] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRender(true)
        setPlaying(entry.isIntersecting)
      },
      { root: null, rootMargin: '200px', threshold: 0.01 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      v.muted = i !== unmutedIndex
      if (playing) {
        const p = v.play()
        if (p && typeof p.catch === 'function') p.catch(() => {})
      } else v.pause()
    })
  }, [render, playing, unmutedIndex])

  const stepSize = () => {
    const a = cardRefs.current[0]
    const b = cardRefs.current[1]
    if (a && b) return b.offsetLeft - a.offsetLeft
    return a ? a.offsetWidth : 0
  }
  const scrollToCard = useCallback((index: number) => {
    const el = trackRef.current
    if (!el) return
    el.scrollTo({ left: Math.max(0, Math.min(reels.length - 1, index)) * stepSize(), behavior: 'smooth' })
  }, [reels.length])
  const onTrackScroll = () => {
    const el = trackRef.current
    const step = stepSize()
    if (!el || !step) return
    setActiveIndex(Math.round(el.scrollLeft / step))
  }
  const toggleMute = (index: number) => {
    const clickedMuted = unmutedIndex === index
    videoRefs.current.forEach((v) => { if (v) v.muted = true })
    if (clickedMuted) setUnmutedIndex(-1)
    else {
      const v = videoRefs.current[index]
      if (v) v.muted = false
      setUnmutedIndex(index)
    }
  }

  if (reels.length === 0) return null
  return (
    <section className="py-12 lg:py-16 bg-white px-4 md:px-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl md:text-2xl font-bold tracking-[0.05em] text-gray-900">{str(content.heading, '#INDULGENCE, THE ARAISH WAY')}</h2>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => scrollToCard(activeIndex - 1)} aria-label="Previous reel" className="grid place-items-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-brand hover:text-brand transition-colors"><ChevronLeft size={18} strokeWidth={1.5} /></button>
          <button onClick={() => scrollToCard(activeIndex + 1)} aria-label="Next reel" className="grid place-items-center w-10 h-10 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-brand hover:text-brand transition-colors"><ChevronRight size={18} strokeWidth={1.5} /></button>
        </div>
      </div>
      <div ref={trackRef} onScroll={onTrackScroll} className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth">
        {reels.map((src, i) => (
          <div key={`${src}-${i}`} data-index={i} ref={(el) => { cardRefs.current[i] = el }} className="relative shrink-0 snap-start w-[220px] sm:w-[240px] md:w-[270px] aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900">
            {render && (
              <video ref={(el) => { videoRefs.current[i] = el }} src={src} loop muted playsInline preload="metadata" className="w-full h-full object-cover rounded-2xl" />
            )}
            <button onClick={() => toggleMute(i)} aria-label={unmutedIndex === i ? 'Mute' : 'Unmute'} className="absolute bottom-4 right-4 grid place-items-center w-9 h-9 rounded-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
              {unmutedIndex === i ? <Volume2 size={16} strokeWidth={2} /> : <VolumeX size={16} strokeWidth={2} />}
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-[6px] mt-7">
        {reels.map((_, i) => (
          <button key={i} onClick={() => scrollToCard(i)} aria-label={`Go to reel ${i + 1}`} className={`rounded-full transition-all duration-300 ${i === activeIndex ? 'w-8 h-[6px] bg-brand' : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'}`} />
        ))}
      </div>
    </section>
  )
}

/* ── Full-width banner ── */
function BannerBlock({ content }: { content: Content }) {
  if (!str(content.image)) return null
  return (
    <Link href={str(content.link, '/shop')} className="relative block min-h-[320px] sm:min-h-[440px] h-[52vh] sm:h-[60vh] w-full overflow-hidden" aria-label="Banner">
      <Image src={str(content.image)} alt="" fill sizes="100vw" className="object-cover" />
    </Link>
  )
}

/* ── Instagram strip ── */
function InstagramBlock({ content }: { content: Content }) {
  if (!str(content.image)) return null
  return (
    <section className="py-12 lg:py-16">
      <h2 className="text-center text-2xl tracking-[0.2em] text-gray-800 mb-10">{str(content.heading, '#INSTAGRAM')}</h2>
      <div className="max-w-7xl mx-auto px-4">
        <Image src={str(content.image)} alt="Instagram" width={783} height={176} sizes="100vw" className="w-full h-auto" />
      </div>
    </section>
  )
}

/** Dispatch a block to its component. Announcement is rendered by the header. */
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return <HeroBlock content={block.content} />
    case 'curated':
      return <CuratedBlock content={block.content} />
    case 'feature':
      return <FeatureBlock content={block.content} />
    case 'snug':
      return <SnugBlock content={block.content} />
    case 'dining':
      return <DiningBlock content={block.content} />
    case 'reels':
      return <ReelsBlock content={block.content} />
    case 'banner':
      return <BannerBlock content={block.content} />
    case 'instagram':
      return <InstagramBlock content={block.content} />
    default:
      return null
  }
}

export default function LandingPage({ sections }: { sections: Block[] }) {
  return (
    <>
      {sections.map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </>
  )
}
