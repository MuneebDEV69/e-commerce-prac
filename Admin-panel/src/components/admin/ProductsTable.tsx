'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus, Pencil, Trash2, ImageOff } from 'lucide-react'
import { formatPrice } from '@/lib/products'
import { adjustStock, deleteProduct } from '@/actions/product'

export type AdminProductRow = {
  id: string
  title: string
  slug: string
  priceFrom: number
  stock: number
  image: string | null
  category: string | null
}

export default function ProductsTable({ products }: { products: AdminProductRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(products)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function adjust(id: string, delta: number) {
    setError(null)
    // optimistic
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, stock: Math.max(0, r.stock + delta) } : r))
    )
    setBusyId(id)
    startTransition(async () => {
      const res = await adjustStock(id, delta)
      setBusyId(null)
      if (!res.ok) {
        setError(res.error)
        router.refresh() // resync from server on failure
      }
    })
  }

  function remove(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This also removes its uploaded media. This cannot be undone.`)) {
      return
    }
    setError(null)
    setBusyId(id)
    startTransition(async () => {
      const res = await deleteProduct(id)
      setBusyId(null)
      if (res.ok) {
        setRows((prev) => prev.filter((r) => r.id !== id))
      } else {
        setError(res.error)
      }
    })
  }

  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No products yet.{' '}
        <Link href="/products/new" className="text-brand underline">
          Add your first product
        </Link>
        .
      </p>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">{error}</div>
      )}

      <div className="overflow-x-auto border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream text-left text-xs tracking-wider text-gray-500">
              <th className="px-4 py-3 font-medium">PRODUCT</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">CATEGORY</th>
              <th className="px-4 py-3 font-medium">PRICE</th>
              <th className="px-4 py-3 font-medium">STOCK</th>
              <th className="px-4 py-3 font-medium text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 shrink-0 overflow-hidden bg-cream">
                      {r.image ? (
                        <Image src={r.image} alt={r.title} fill sizes="48px" className="object-cover" />
                      ) : (
                        <div className="grid place-items-center w-full h-full text-gray-300">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_STOREFRONT_URL ?? 'http://localhost:3000'}/product/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 hover:text-brand"
                    >
                      {r.title}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{r.category ?? '—'}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{formatPrice(r.priceFrom)}</td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center border border-gray-300">
                    <button
                      onClick={() => adjust(r.id, -1)}
                      disabled={busyId === r.id || r.stock === 0}
                      aria-label="Decrease stock"
                      className="px-2 py-1.5 text-gray-700 hover:text-black disabled:opacity-40"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center tabular-nums">{r.stock}</span>
                    <button
                      onClick={() => adjust(r.id, 1)}
                      disabled={busyId === r.id}
                      aria-label="Increase stock"
                      className="px-2 py-1.5 text-gray-700 hover:text-black disabled:opacity-40"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${r.id}/edit`}
                      className="grid place-items-center w-8 h-8 border border-gray-300 text-gray-600 hover:border-brand hover:text-brand"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => remove(r.id, r.title)}
                      disabled={busyId === r.id}
                      className="grid place-items-center w-8 h-8 border border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-600 disabled:opacity-40"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
