'use client'

import { ShoppingBag } from 'lucide-react'
import { useCartStore, cartCount, useCartHydrated } from '@/lib/cart'

/** Header cart icon with a live item-count badge. Opens the slide-in cart drawer. */
export default function CartButton() {
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const hydrated = useCartHydrated()
  const count = hydrated ? cartCount(items) : 0

  return (
    <button
      onClick={openCart}
      aria-label={`Cart${count ? ` (${count})` : ''}`}
      className="relative p-2 hover:text-brand transition-colors"
    >
      <ShoppingBag size={20} strokeWidth={1.5} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid place-items-center min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-medium leading-none">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
