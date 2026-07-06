'use client'

import { useEffect, useState } from 'react'
import { X, ChevronDown } from 'lucide-react'

/**
 * Filter facets are limited to what the database actually supports:
 *   - Category  (Product.category)
 *   - Availability (Product.stock > 0)
 *   - Price      (Product.priceFrom)
 * Type / Size / Color / Fabric / Design / Thread-Count were removed because there
 * are no columns (or populated variants) behind them — showing them would filter
 * to zero results. Add them back here only once the schema/variants support them.
 */
export type ShopFilters = { categories: string[]; availability: string[]; price: string[] }
export const EMPTY_FILTERS: ShopFilters = { categories: [], availability: [], price: [] }

export const AVAILABILITY_OPTIONS = ['In Stock', 'Out of Stock'] as const

export const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: 'Under Rs.5,000', min: 0, max: 5000 },
  { label: 'Rs.5,000 – Rs.15,000', min: 5000, max: 15000 },
  { label: 'Rs.15,000 – Rs.25,000', min: 15000, max: 25000 },
  { label: 'Above Rs.25,000', min: 25000, max: Infinity }
]

export default function FilterDrawer({
  open,
  onClose,
  categoryOptions,
  value,
  onApply,
  onClear
}: {
  open: boolean
  onClose: () => void
  categoryOptions: string[]
  value: ShopFilters
  onApply: (_filters: ShopFilters) => void
  onClear: () => void
}) {
  // Draft edits live locally until "Apply"; opening the drawer syncs to what's applied.
  const [draft, setDraft] = useState<ShopFilters>(value)
  const [openFacet, setOpenFacet] = useState<string | null>('Shop by Category')

  useEffect(() => {
    if (open) setDraft(value)
  }, [open, value])

  const toggle = (group: keyof ShopFilters, opt: string) =>
    setDraft((d) => {
      const has = d[group].includes(opt)
      return { ...d, [group]: has ? d[group].filter((x) => x !== opt) : [...d[group], opt] }
    })

  const facets: { key: keyof ShopFilters; title: string; options: string[] }[] = [
    { key: 'categories', title: 'Shop by Category', options: categoryOptions },
    { key: 'availability', title: 'Availability', options: [...AVAILABILITY_OPTIONS] },
    { key: 'price', title: 'Price', options: PRICE_RANGES.map((r) => r.label) }
  ]

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden
      />

      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-full sm:w-[380px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Filters"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-sm tracking-widest text-gray-800">FILTER</span>
          <button onClick={onClose} aria-label="Close filters" className="text-gray-600 hover:text-black">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {facets.map((facet) => {
            const isOpen = openFacet === facet.title
            return (
              <div key={facet.title} className="border-b border-gray-100">
                <button
                  onClick={() => setOpenFacet(isOpen ? null : facet.title)}
                  className="flex items-center justify-between w-full px-5 py-4 text-sm text-gray-700 hover:text-black"
                >
                  {facet.title}
                  <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <ul className="px-5 pb-4 space-y-2.5">
                    {facet.options.length === 0 && (
                      <li className="text-xs text-gray-400">None available.</li>
                    )}
                    {facet.options.map((opt) => (
                      <li key={opt}>
                        <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draft[facet.key].includes(opt)}
                            onChange={() => toggle(facet.key, opt)}
                            className="accent-brand w-4 h-4"
                          />
                          {opt}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              setDraft(EMPTY_FILTERS)
              onClear()
            }}
            className="text-sm text-brand underline hover:text-brand-dark"
          >
            Remove all
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-1 bg-brand text-white text-sm tracking-widest py-3 hover:bg-brand-dark transition-colors"
          >
            APPLY
          </button>
        </div>
      </aside>
    </>
  )
}
