'use server'

import { revalidatePath } from 'next/cache'
import { apiCreateProduct, apiUpdateProduct, apiAdjustStock, apiDeleteProduct } from '@/lib/api'
import type { ProductInput } from '@ecom/shared'

export type { ProductInput }
export type ActionResult = { ok: true; slug: string } | { ok: false; error: string }

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json()
    return body?.error ?? fallback
  } catch {
    return fallback
  }
}

/**
 * Thin proxies to the A-Backend REST API. The admin panel holds NO database
 * connection — it forwards the admin's Supabase token and lets the API enforce
 * auth + persist. Revalidates the admin's own product list; the storefront reads
 * live data (no-store) so it needs no cross-app revalidation.
 */
export async function createProduct(input: ProductInput): Promise<ActionResult> {
  const res = await apiCreateProduct(input)
  if (!res.ok) return { ok: false, error: await readError(res, 'Failed to create product.') }
  const product = await res.json()
  revalidatePath('/products')
  return { ok: true, slug: product.slug }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ActionResult> {
  const res = await apiUpdateProduct(id, input)
  if (!res.ok) return { ok: false, error: await readError(res, 'Failed to update product.') }
  const product = await res.json()
  revalidatePath('/products')
  return { ok: true, slug: product.slug }
}

export async function adjustStock(id: string, delta: number): Promise<ActionResult> {
  const res = await apiAdjustStock(id, delta)
  if (!res.ok) return { ok: false, error: await readError(res, 'Failed to update stock.') }
  const product = await res.json()
  revalidatePath('/products')
  return { ok: true, slug: product.slug }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const res = await apiDeleteProduct(id)
  if (!res.ok) return { ok: false, error: await readError(res, 'Failed to delete product.') }
  const body = await res.json()
  revalidatePath('/products')
  return { ok: true, slug: body.slug ?? '' }
}
