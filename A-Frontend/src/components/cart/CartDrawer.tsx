'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Minus, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useCartStore, cartSubtotal, useCartHydrated } from '@/lib/cart'
import { formatPrice } from '@/lib/products'

/**
 * Slide-in cart drawer (right side). Opens when a product is added or the header
 * bag is clicked. Mirrors the reference design: product/total columns, per-line
 * variant details, quantity stepper, an "Order special instructions" accordion,
 * an estimated total, and a CHECKOUT button.
 */
export default function CartDrawer() {
  const router = useRouter()
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const instructions = useCartStore((s) => s.instructions)
  const setInstructions = useCartStore((s) => s.setInstructions)
  const hydrated = useCartHydrated()

  const [notesOpen, setNotesOpen] = useState(false)

  // Lock body scroll while the drawer is open, and close on Escape.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, closeCart])

  const subtotal = hydrated ? cartSubtotal(items) : 0

  const goToCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  return (
    <>
      {/* Dim overlay */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Your cart"
        aria-modal="true"
        className={`fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-2xl font-serif text-gray-900">Your cart</h2>
          <button onClick={closeCart} aria-label="Close cart" className="p-1 text-gray-500 hover:text-gray-900">
            <X size={22} strokeWidth={1.5} />
          </button>
        </div>

        {!hydrated || items.length === 0 ? (
          <div className="flex-1 grid place-items-center px-6 text-center">
            <div>
              <p className="text-gray-500">Your cart is empty.</p>
              <button
                onClick={() => {
                  closeCart()
                  router.push('/shop')
                }}
                className="mt-5 inline-block bg-brand text-white text-sm tracking-widest px-8 py-3 hover:bg-brand-dark transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Column labels */}
            <div className="flex items-center justify-between px-6 pb-2 border-b border-gray-200 text-[11px] tracking-widest text-gray-400">
              <span>PRODUCT</span>
              <span>TOTAL</span>
            </div>

            {/* Scrollable line items */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-4 py-5">
                  <div className="relative w-20 h-24 shrink-0 bg-cream overflow-hidden rounded">
                    {item.image && (
                      <Image src={item.image} alt={item.title} fill sizes="80px" className="object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm tracking-wide text-brand uppercase">{item.title}</p>
                    <p className="mt-1 text-sm text-gray-700">{formatPrice(item.price)}</p>
                    {item.size && <p className="mt-1 text-xs text-gray-500">Size: {item.size}</p>}
                    {item.fabric && <p className="text-xs text-gray-500">Fabric: {item.fabric}</p>}
                    {item.color && <p className="text-xs text-gray-500">Color: {item.color}</p>}

                    <div className="mt-3 flex items-center gap-3">
                      <div className="inline-flex items-center border border-gray-300">
                        <button
                          onClick={() => setQty(item.slug, item.qty - 1)}
                          aria-label="Decrease quantity"
                          className="px-2.5 py-2 text-gray-700 hover:text-black"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-10 text-center text-sm tabular-nums">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.slug, item.qty + 1)}
                          aria-label="Increase quantity"
                          className="px-2.5 py-2 text-gray-700 hover:text-black"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(item.slug)}
                        aria-label="Remove item"
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-800 tabular-nums whitespace-nowrap">
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 space-y-4">
              {/* Special instructions accordion */}
              <div className="border-b border-gray-100 pb-3">
                <button
                  onClick={() => setNotesOpen((o) => !o)}
                  className="flex items-center justify-between w-full text-sm text-gray-700"
                >
                  Order special instructions
                  <ChevronDown size={16} className={`transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
                </button>
                {notesOpen && (
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    placeholder="Add a note for your order…"
                    className="mt-3 w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand resize-y"
                  />
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-900">Estimated total</span>
                <span className="text-base font-medium text-gray-900 tabular-nums">
                  {formatPrice(subtotal)} PKR
                </span>
              </div>

              <p className="text-xs text-gray-500">
                Taxes, discounts and shipping calculated at checkout.
              </p>

              <button
                onClick={goToCheckout}
                className="w-full bg-brand text-white text-sm tracking-[0.2em] py-4 hover:bg-brand-dark transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
