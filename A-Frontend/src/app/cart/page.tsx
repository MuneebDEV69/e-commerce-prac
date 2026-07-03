'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, cartSubtotal, useCartHydrated } from '@/lib/cart'
import { formatPrice } from '@/lib/products'

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const hydrated = useCartHydrated()

  // Avoid a hydration mismatch: wait until the persisted cart loads.
  if (!hydrated) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-sm tracking-wider text-gray-400">Cart is loading…</div>
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={40} strokeWidth={1} className="mx-auto text-gray-300" />
        <h1 className="mt-5 text-xl tracking-wider text-gray-800">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-500">Add something you love and it will show up here.</p>
        <Link
          href="/shop"
          className="mt-7 inline-block bg-brand text-white text-sm tracking-widest px-10 py-3 hover:bg-brand-dark transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    )
  }

  const subtotal = cartSubtotal(items)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl tracking-[0.15em] text-gray-800 mb-8">YOUR CART</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Line items */}
        <ul className="lg:col-span-2 divide-y divide-gray-100 border-y border-gray-100">
          {items.map((item) => (
            <li key={item.slug} className="flex gap-4 py-5">
              <div className="relative w-24 h-24 shrink-0 bg-cream overflow-hidden rounded">
                {item.image && (
                  <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="text-sm tracking-wide text-gray-800 hover:text-brand line-clamp-2">
                  {item.title}
                </Link>
                <p className="mt-1 text-sm text-red-600">{formatPrice(item.price)}</p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="inline-flex items-center border border-gray-300">
                    <button
                      onClick={() => setQty(item.slug, item.qty - 1)}
                      aria-label="Decrease quantity"
                      className="px-2.5 py-1.5 text-gray-700 hover:text-black"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-10 text-center text-sm tabular-nums">{item.qty}</span>
                    <button
                      onClick={() => setQty(item.slug, item.qty + 1)}
                      aria-label="Increase quantity"
                      className="px-2.5 py-1.5 text-gray-700 hover:text-black"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.slug)}
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-800 tabular-nums whitespace-nowrap">
                {formatPrice(item.price * item.qty)}
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="lg:col-span-1">
          <div className="border border-gray-200 p-6">
            <h2 className="text-sm tracking-wider text-gray-800 mb-4">ORDER SUMMARY</h2>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Shipping calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-6 block text-center bg-brand text-white text-sm tracking-widest py-3.5 hover:bg-brand-dark transition-colors"
            >
              PROCEED TO CHECKOUT
            </Link>
            <Link href="/shop" className="mt-3 block text-center text-xs text-gray-500 hover:text-brand">
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
