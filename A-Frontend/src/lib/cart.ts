'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'

/**
 * Client-side shopping cart, persisted to localStorage so it survives reloads.
 *
 * We store only display data + the product slug. Prices here are for display only —
 * the authoritative price is recomputed server-side at checkout from the slug, so a
 * tampered localStorage cart can never change what an order actually costs.
 *
 * `isOpen` drives the slide-in cart drawer; it is intentionally NOT persisted.
 */
export type CartItem = {
  slug: string
  title: string
  price: number
  image: string | null
  qty: number
  size?: string
  fabric?: string
  color?: string
}

type CartState = {
  items: CartItem[]
  instructions: string
  isOpen: boolean
  add: (_item: Omit<CartItem, 'qty'>, _qty?: number) => void
  remove: (_slug: string) => void
  setQty: (_slug: string, _qty: number) => void
  setInstructions: (_text: string) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      instructions: '',
      isOpen: false,
      add: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === item.slug)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.slug === item.slug ? { ...i, qty: Math.min(99, i.qty + qty) } : i
              )
            }
          }
          return { items: [...state.items, { ...item, qty: Math.min(99, qty) }] }
        }),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(99, qty)) } : i))
            .filter((i) => i.qty > 0)
        })),
      setInstructions: (text) => set({ instructions: text }),
      clear: () => set({ items: [], instructions: '' }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false })
    }),
    {
      name: 'araish-cart',
      // Only persist the cart contents — never the drawer open/close state.
      partialize: (state) => ({ items: state.items, instructions: state.instructions })
    }
  )
)

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0)
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.qty, 0)

/**
 * True once the persisted cart has rehydrated from localStorage. Use this to gate
 * client-only cart UI (counts, totals) so server-rendered HTML (empty cart) doesn't
 * mismatch the hydrated client and throw a hydration error.
 */
export function useCartHydrated() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(useCartStore.persist.hasHydrated())
    const unsub = useCartStore.persist.onFinishHydration(() => setHydrated(true))
    return () => unsub()
  }, [])
  return hydrated
}
