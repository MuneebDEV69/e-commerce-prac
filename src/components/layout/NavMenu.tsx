'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

/**
 * Left slide-out category menu opened from the header hamburger.
 * Every category links to /shop (static prototype — no per-category routing yet).
 */
const CATEGORIES = [
  'NEW ARRIVALS',
  'THE WEDDING EDIT',
  'BEDDING',
  'CUSHIONS',
  'KIDS',
  'THROWS',
  'DINING',
  'BATH',
  'PET BEDS',
  'LAST CHANCE'
]

export default function NavMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-[90] h-full w-[80%] max-w-[320px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="font-serif tracking-[0.2em] text-brand text-lg">MENU</span>
          <button onClick={onClose} aria-label="Close menu" className="text-gray-600 hover:text-black">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href="/shop"
              onClick={onClose}
              className="block px-5 py-4 text-sm tracking-wider text-gray-800 border-b border-gray-100 hover:text-brand hover:bg-cream transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
