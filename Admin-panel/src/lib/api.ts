import { createClient } from '@/utils/supabase/server'

/**
 * Server-side client for the A-Backend REST API. The frontend has NO direct
 * database access — every product/category read and write goes through here.
 */
// Use 127.0.0.1 (not localhost) so Node's fetch doesn't try IPv6 (::1) first and
// hang until timeout on Windows when the backend listens on IPv4.
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

export type ApiCategory = { id: string; name: string; slug: string }

/** Forward the signed-in user's Supabase access token to the API (for admin routes). */
async function authHeaders(): Promise<Record<string, string>> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Public reads ──
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

export async function fetchProductById(id: string): Promise<ApiProduct | null> {
  const res = await fetch(`${API_URL}/v1/products/by-id/${encodeURIComponent(id)}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Failed to load product')
  return res.json()
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_URL}/v1/categories`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load categories')
  return res.json()
}

// ── Auth / role ──
export async function fetchMe(): Promise<{ id: string; email: string; role: string } | null> {
  const headers = await authHeaders()
  if (!headers.Authorization) return null
  const res = await fetch(`${API_URL}/v1/me`, { headers, cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

// ── Admin writes (return the raw Response so callers can read status + body) ──
type ProductBody = Record<string, unknown>

export async function apiCreateProduct(body: ProductBody) {
  return fetch(`${API_URL}/v1/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body)
  })
}

export async function apiUpdateProduct(id: string, body: ProductBody) {
  return fetch(`${API_URL}/v1/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body)
  })
}

export async function apiAdjustStock(id: string, delta: number) {
  return fetch(`${API_URL}/v1/products/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ delta })
  })
}

export async function apiDeleteProduct(id: string) {
  return fetch(`${API_URL}/v1/products/${id}`, {
    method: 'DELETE',
    headers: await authHeaders()
  })
}
