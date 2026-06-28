'use client'

import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

type Facet = { title: string; options: string[] }

const FACETS: Facet[] = [
  { title: 'Shop by Type', options: ['Duvet Set', 'Bed Sheet', 'Throw', 'Cushion', 'Towel'] },
  { title: 'Shop by Category', options: ['Bedding', 'Luxury', 'Signature', 'Kids', 'Cushions', 'Throws', 'Dining', 'Bath'] },
  { title: 'Shop by Size', options: ['Single', 'Queen', 'King'] },
  { title: 'Shop by Color', options: ['White', 'Beige', 'Grey', 'Red', 'Blue', 'Pink'] },
  { title: 'Shop by Fabric', options: ['Cotton Sateen', 'Cotton Percale', 'Velvet', 'Duck Cotton'] },
  { title: 'Shop by Design', options: ['Embroidered', 'Printed', 'Plain', 'Border'] },
  { title: 'Shop by Thread Count', options: ['200+', '300+', '400+'] },
  { title: 'Availability', options: ['In Stock', 'Out of Stock'] },
  { title: 'Price', options: ['Under Rs.5,000', 'Rs.5,000 – Rs.15,000', 'Rs.15,000 – Rs.25,000', 'Above Rs.25,000'] }
]

export default function FilterDrawer({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const [openFacet, setOpenFacet] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggleOption = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[380px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Filters"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm tracking-widest text-gray-800">FILTER</span>
          <button onClick={onClose} aria-label="Close filters" className="text-gray-600 hover:text-black">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Accordions */}
        <div className="flex-1 overflow-y-auto">
          {FACETS.map((facet) => {
            const isOpen = openFacet === facet.title
            return (
              <div key={facet.title} className="border-b border-gray-100">
                <button
                  onClick={() => setOpenFacet(isOpen ? null : facet.title)}
                  className="flex items-center justify-between w-full px-5 py-4 text-sm text-gray-700 hover:text-black"
                >
                  {facet.title}
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <ul className="px-5 pb-4 space-y-2.5">
                    {facet.options.map((opt) => {
                      const key = `${facet.title}:${opt}`
                      return (
                        <li key={key}>
                          <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selected.has(key)}
                              onChange={() => toggleOption(key)}
                              className="accent-brand w-4 h-4"
                            />
                            {opt}
                          </label>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Sticky action footer */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-brand underline hover:text-brand-dark"
          >
            Remove all
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-brand text-white text-sm tracking-widest py-3 hover:bg-brand-dark transition-colors"
          >
            APPLY
          </button>
        </div>
      </aside>
    </>
  )
}
