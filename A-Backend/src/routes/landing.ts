import { Router, type Request } from 'express'
import {
  landingSectionsSchema,
  DEFAULT_LANDING_SECTIONS,
  collectLandingMedia,
  type LandingBlock
} from '@ecom/shared'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middleware/requireAdmin'
import { deleteMediaByUrls } from '../lib/storage'

const router = Router()
const SINGLETON_ID = 'singleton'
const tokenOf = (req: Request) => (req as Request & { accessToken?: string }).accessToken ?? ''

/** Read the sections array, seeding defaults on first access. */
async function getSections(): Promise<LandingBlock[]> {
  const row = await prisma.landingPageContent.findUnique({ where: { id: SINGLETON_ID } })
  const sections = (row?.sections as LandingBlock[] | undefined) ?? []
  if (!row || !Array.isArray(sections) || sections.length === 0) return DEFAULT_LANDING_SECTIONS
  return sections
}

// ── Public: read the landing page blocks ──
router.get('/', async (_req, res) => {
  const sections = await getSections()
  res.json({ sections })
})

// ── Admin: save the landing page blocks (+ clean up removed media) ──
router.put('/', requireAdmin, async (req, res) => {
  const parsed = landingSectionsSchema.safeParse(req.body?.sections)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid sections.' })
  const sections = parsed.data as LandingBlock[]

  // Delete any uploaded media that is no longer referenced anywhere in the page.
  const previous = await getSections()
  const before = new Set(collectLandingMedia(previous))
  const after = new Set(collectLandingMedia(sections))
  const removed = [...before].filter((u) => !after.has(u))
  if (removed.length > 0) await deleteMediaByUrls(removed, tokenOf(req)).catch(() => {})

  await prisma.landingPageContent.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, sections: sections as object[] },
    update: { sections: sections as object[] }
  })
  res.json({ ok: true, sections })
})

export default router
