/**
 * Read-only client for the A-Backend REST API. The storefront only needs public
 * product reads — no auth, no DB. (Admin writes live in the separate Admin-panel app.)
 *
 * Use 127.0.0.1 (not localhost) so Node's fetch doesn't try IPv6 (::1) first and
 * hang until timeout on Windows when the backend listens on IPv4.
 */
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

export type ApiProduct = {
  id: string
  title: string
  slug: string
  description: string | null
  priceFrom: number
  stock: number
  published: boolean
  mediaUrls: string[]
  categoryId: string | null
  category: { id: string; name: string; slug: string } | null
  createdAt: string
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${API_URL}/v1/products`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_URL}/v1/products/${encodeURIComponent(slug)}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load product')
  return res.json()
}
