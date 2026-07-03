'use server'

import { revalidatePath } from 'next/cache'
import { apiUpdateOrderStatus } from '@/lib/api'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateOrderStatus(id: string, status: string): Promise<ActionResult> {
  const res = await apiUpdateOrderStatus(id, status)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return { ok: false, error: body?.error ?? 'Failed to update order.' }
  }
  revalidatePath('/orders')
  return { ok: true }
}
