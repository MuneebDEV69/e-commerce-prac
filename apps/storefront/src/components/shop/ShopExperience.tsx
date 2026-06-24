'use client'

import { useState, useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { type Product } from '../../lib/products'
import ProductCard from './ProductCard'
import FilterDrawer from './FilterDrawer'

type Sort = 'new' | 'price-asc' | 'price-desc'

const SORT_LABELS: Record<Sort, string> = {
  new: 'Date, new to old',
  'price-asc': 'Price, low to high',
  'price-desc': 'Price, high to low'
}

export default function ShopExperience({ products }: { products: Product[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sort, setSort] = useState<Sort>('new')

  const sorted = useMemo(() => {
    const list = [...products]
    if (sort === 'price-asc') list.sort((a, b) => a.priceFrom - b.priceFrom)
    else if (sort === 'price-desc') list.sort((a, b) => b.priceFrom - a.priceFrom)
    return list // 'new' keeps the catalogue order
  }, [products, sort])

  return (
    <>
      {/* Utility bar */}
      <div className="flex items-center justify-between px-4 md:px-10 py-4 border-y border-gray-100">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm tracking-wider text-gray-700 hover:text-black"
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          FILTER
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
          <span className="text-xs text-gray-500">{products.length} products</span>
        </div>
      </div>

      {/* Product grid */}
      <div className="px-4 md:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {sorted.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
