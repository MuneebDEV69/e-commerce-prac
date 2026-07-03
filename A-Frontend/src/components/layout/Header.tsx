'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search } from 'lucide-react'
import NavMenu from './NavMenu'
import AccountMenu from './AccountMenu'
import CartButton from './CartButton'

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
const DEFAULT_ANNOUNCEMENT = 'Enjoy Free Shipping on Orders Above PKR 5,000.'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT)
  const pathname = usePathname()

  // Pull the admin-managed announcement (falls back to the default text).
  useEffect(() => {
    fetch('/api/landing')
      .then((r) => r.json())
      .then((d) => {
        const sections = Array.isArray(d?.sections) ? d.sections : []
        const ann = sections.find((s: { type?: string }) => s.type === 'announcement')
        const text = ann?.content?.text
        if (typeof text === 'string' && text.trim()) setAnnouncement(text)
      })
      .catch(() => {})
  }, [])
  // Yellow "Home" button for customers on inner pages (shop, product, cart, …) —
  // an easy way back to the landing page. Hidden on the landing page itself.
  const showHome = pathname !== '/'

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
        {announcement}
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
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-2 text-gray-800 hover:text-brand transition-colors"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center — glamorous animated wordmark */}
          <div className="flex justify-center">
            <Link href="/" aria-label="MUNEEB KI ARAISH — home" className="group select-none text-center leading-none">
              <span
                className={`block font-serif font-semibold uppercase bg-gradient-to-r from-[#b8860b] via-brand to-[#dcb878] bg-clip-text text-transparent drop-shadow-sm transition-all duration-300 ${
                  scrolled
                    ? 'text-xs tracking-normal sm:text-xl sm:tracking-[0.25em]'
                    : 'text-sm tracking-normal sm:text-2xl sm:tracking-[0.25em] md:text-4xl md:tracking-[0.3em]'
                }`}
              >
                Muneeb&nbsp;Ki&nbsp;Araish
              </span>
              <span
                className={`mx-auto mt-1 block h-px bg-gradient-to-r from-transparent via-brand to-transparent transition-all duration-300 ${
                  scrolled ? 'w-0 opacity-0' : 'w-2/3 opacity-100'
                }`}
              />
            </Link>
          </div>

          {/* Right — utilities (p-2 gives ~44px touch targets) */}
          <div className="flex items-center justify-end gap-1 sm:gap-3 text-gray-800">
            {showHome && (
              <Link
                href="/"
                className="bg-brand text-white text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-brand-dark transition-colors whitespace-nowrap"
              >
                HOME
              </Link>
            )}
            <Link href="/shop" aria-label="Search" className="hidden sm:block p-2 hover:text-brand transition-colors">
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <AccountMenu />
            <CartButton />
          </div>
        </div>
      </nav>

      <NavMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
