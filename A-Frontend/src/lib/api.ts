/**
 * Read-only client for the A-Backend REST API. The storefront only needs public
 * product reads — no auth, no DB. (Admin writes live in the separate Admin-panel app.)
 *
 * Caching: responses are cached and revalidated in the background (ISR) so pages
 * serve instantly from cache instead of blocking on the (possibly cold) backend
 * on every request. Fetches are wrapped so a transient backend outage degrades
 * gracefully (empty list / not-found) instead of crashing the render or build.
 *
 * Use 127.0.0.1 (not localhost) locally so Node's fetch doesn't try IPv6 first.
 */
const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000'

// Background revalidation window (seconds). New/edited products appear within this.
const REVALIDATE = 120

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
  try {
    const res = await fetch(`${API_URL}/v1/products`, { next: { revalidate: REVALIDATE } })
    if (!res.ok) throw new Error(`Products request failed: ${res.status}`)
    return res.json()
  } catch (e) {
    // Don't crash the page/build if the backend is briefly unreachable.
    console.error('[api] fetchProducts failed:', e)
    return []
  }
}

export async function fetchProduct(slug: string): Promise<ApiProduct | null> {
  try {
    const res = await fetch(`${API_URL}/v1/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE }
    })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`Product request failed: ${res.status}`)
    return res.json()
  } catch (e) {
    console.error('[api] fetchProduct failed:', e)
    return null
  }
}
