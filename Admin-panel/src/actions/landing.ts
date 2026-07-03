'use server'

import { revalidatePath } from 'next/cache'
import { apiUpdateLanding, type LandingBlock } from '@/lib/api'

export type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateLanding(sections: LandingBlock[]): Promise<ActionResult> {
  const res = await apiUpdateLanding(sections)
  if (!res.ok) {
    const b = await res.json().catch(() => ({}))
    return { ok: false, error: b?.error ?? 'Failed to save landing page.' }
  }
  revalidatePath('/landing-page')
  return { ok: true }
}
