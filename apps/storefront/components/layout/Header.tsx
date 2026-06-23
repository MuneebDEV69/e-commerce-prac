import Image from 'next/image'
import { Menu, Search, User, ShoppingBag } from 'lucide-react'

/**
 * Global site header — Araish-style.
 * Layer 1: gold announcement bar.
 * Layer 2: clean white sticky navbar (hamburger left, centered logo, utilities right).
 * The grey marquee ticker (Layer 3) is a separate <Marquee /> component rendered below this.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Layer 1 — Announcement bar */}
      <div className="bg-brand text-white text-center text-[11px] sm:text-xs tracking-wide py-2 px-4">
        Enjoy Free Shipping on Orders Above PKR 5,000.
      </div>

      {/* Layer 2 — Main navbar */}
      <nav className="border-b border-gray-100">
        <div className="grid grid-cols-3 items-center px-4 sm:px-6 lg:px-10 h-16">
          {/* Left — hamburger */}
          <div className="flex items-center">
            <button aria-label="Open menu" className="p-2 -ml-2 text-gray-800 hover:text-brand transition-colors">
              <Menu size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center — logo */}
          <div className="flex justify-center">
            <Image
              src="/images/logo.png"
              alt="ARAISH"
              width={150}
              height={40}
              priority
              className="h-8 w-auto object-contain"
            />
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
    </header>
  )
}
