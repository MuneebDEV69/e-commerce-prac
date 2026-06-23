'use client'

import { useEffect, useState } from 'react'
import { Menu, Search, User, ShoppingBag } from 'lucide-react'

/**
 * Global site header.
 *
 * Returns a fragment (no wrapper element) so the sticky <nav> is a direct child of
 * <body>. That matters: `position: sticky` only stays pinned within its parent's box,
 * so the nav must sit directly in the tall body — not inside a short wrapper — to
 * remain visible no matter how far you scroll.
 *
 * Layer 1 (announcement bar) is in normal flow and scrolls away.
 * Layer 2 (nav) is sticky and stays. The logo shrinks on scroll-down and grows back
 * on scroll-up via the `scrolled` flag — a smooth Araish-style animation.
 */
export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* Layer 1 — Announcement bar (scrolls away) */}
      <div className="bg-brand text-white text-center text-sm sm:text-base tracking-wide py-2.5 px-4">
        Enjoy Free Shipping on Orders Above PKR 5,000.
      </div>

      {/* Layer 2 — Sticky nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div
          className={`grid grid-cols-3 items-center px-4 sm:px-6 lg:px-10 transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-24'
          }`}
        >
          {/* Left — hamburger */}
          <div className="flex items-center">
            <button aria-label="Open menu" className="p-2 -ml-2 text-gray-800 hover:text-brand transition-colors">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center — glamorous animated wordmark */}
          <div className="flex justify-center">
            <a href="#" aria-label="MUNEEB KI ARAISH — home" className="group select-none text-center leading-none">
              <span
                className={`block font-serif font-semibold uppercase bg-gradient-to-r from-[#b8860b] via-brand to-[#dcb878] bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 ${
                  scrolled
                    ? 'text-xl sm:text-2xl tracking-[0.25em]'
                    : 'text-2xl sm:text-4xl tracking-[0.3em]'
                }`}
              >
                Muneeb&nbsp;Ki&nbsp;Araish
              </span>
              <span
                className={`mx-auto mt-1 block h-px bg-gradient-to-r from-transparent via-brand to-transparent transition-all duration-300 ${
                  scrolled ? 'w-0 opacity-0' : 'w-2/3 opacity-100'
                }`}
              />
            </a>
          </div>

          {/* Right — utilities */}
          <div className="flex items-center justify-end gap-4 sm:gap-6 text-gray-800">
            <button aria-label="Search" className="hover:text-brand transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </button>
            <button aria-label="Account" className="hover:text-brand transition-colors">
              <User size={20} strokeWidth={1.5} />
            </button>
            <button aria-label="Shopping bag" className="hover:text-brand transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
