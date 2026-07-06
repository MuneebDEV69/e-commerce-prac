'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import ProductCard, { type ShopCard } from './ProductCard'
import FilterDrawer, { type ShopFilters, EMPTY_FILTERS, PRICE_RANGES } from './FilterDrawer'

type Sort = 'price-asc' | 'price-desc' | 'title-asc'

const SORT_LABELS: Record<Sort, string> = {
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low',
  'title-asc': 'Alphabetically, A–Z'
}

export default function ShopExperience({ products }: { products: ShopCard[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('price-asc')
  const [filters, setFilters] = useState<ShopFilters>(EMPTY_FILTERS)

  // Category options come from the LIVE product data, so they always match reality.
  const categoryOptions = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort(),
    [products]
  )

  const visible = useMemo(() => {
    const list = products.filter((p) => {
      // Category
      if (filters.categories.length && !(p.category && filters.categories.includes(p.category))) return false
      // Availability (only constrains when exactly one option is chosen)
      if (filters.availability.length === 1) {
        const wantInStock = filters.availability[0] === 'In Stock'
        if ((p.inStock !== false) !== wantInStock) return false
      }
      // Price (match ANY selected range)
      if (filters.price.length) {
        const hit = filters.price.some((label) => {
          const r = PRICE_RANGES.find((x) => x.label === label)
          return r && p.priceFrom >= r.min && p.priceFrom < r.max
        })
        if (!hit) return false
      }
      return true
    })

    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.priceFrom - b.priceFrom)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.priceFrom - a.priceFrom)
    else if (sort === 'title-asc') sorted.sort((a, b) => a.title.localeCompare(b.title))
    return sorted
  }, [products, sort, filters])

  const activeCount = filters.categories.length + filters.availability.length + filters.price.length

  return (
    <>
      {/* Utility bar */}
      <div className="flex items-center justify-between px-4 md:px-10 py-4 border-y border-gray-100">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm tracking-wider text-gray-700 hover:text-black"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          FILTER{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>

        <div className="flex items-center gap-4">
          <label className="hidden sm:flex items-center gap-2 text-xs tracking-wider text-gray-600">
            SORT BY:
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="border border-gray-300 px-2 py-1.5 text-xs uppercase tracking-wider outline-none focus:border-brand"
            >
              {(Object.keys(SORT_LABELS) as Sort[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>
          <span className="text-xs text-gray-500">{visible.length} products</span>
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 md:px-10 py-8">
        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-sm text-gray-500">No products match your filters.</p>
            <button
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="mt-4 text-sm text-brand underline hover:text-brand-dark"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {visible.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categoryOptions={categoryOptions}
        value={filters}
        onApply={(f) => {
          setFilters(f)
          setDrawerOpen(false)
        }}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />
    </>
  )
}
