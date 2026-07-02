import { Router, type Request } from 'express'
import { productInputSchema } from '@ecom/shared'
import { prisma } from '../lib/prisma'
import { requireAdmin } from '../middleware/requireAdmin'
import { deleteMediaByUrls } from '../lib/storage'

const router = Router()

const tokenOf = (req: Request) => (req as Request & { accessToken?: string }).accessToken ?? ''

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'product'
  let n = 1
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    n += 1
    slug = `${base}-${n}`
  }
  return slug
}

// ── Public: list published products ──
router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  })
  res.json(products)
})

// ── Admin form: single product by id (two segments, won't clash with /:slug) ──
router.get('/by-id/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { category: true }
  })
  if (!product) return res.status(404).json({ error: 'Product not found.' })
  res.json(product)
})

// ── Public: single product by slug ──
router.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { category: true }
  })
  if (!product) return res.status(404).json({ error: 'Product not found.' })
  res.json(product)
})

// ── Admin: create ──
router.post('/', requireAdmin, async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message })
  const data = parsed.data

  const slug = await uniqueSlug(slugify(data.title))
  const product = await prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description || null,
      priceFrom: data.priceFrom,
      stock: data.stock,
      published: true,
      mediaUrls: data.mediaUrls,
      categoryId: data.categoryId ?? null
    }
  })
  res.status(201).json(product)
})

// ── Admin: update ──
router.put('/:id', requireAdmin, async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message })
  const data = parsed.data
  try {
    const existing = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: { mediaUrls: true }
    })
    if (!existing) return res.status(404).json({ error: 'Product not found.' })

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        title: data.title,
        description: data.description || null,
        priceFrom: data.priceFrom,
        stock: data.stock,
        mediaUrls: data.mediaUrls,
        categoryId: data.categoryId ?? null
      }
    })

    // Remove media files that were dropped during this edit.
    const removed = existing.mediaUrls.filter((u) => !data.mediaUrls.includes(u))
    if (removed.length > 0) await deleteMediaByUrls(removed, tokenOf(req))

    res.json(product)
  } catch {
    res.status(404).json({ error: 'Product not found.' })
  }
})

// ── Admin: adjust stock ──
router.patch('/:id/stock', requireAdmin, async (req, res) => {
  const delta = Number(req.body?.delta)
  if (!Number.isFinite(delta)) return res.status(400).json({ error: 'delta must be a number.' })
  const current = await prisma.product.findUnique({ where: { id: req.params.id }, select: { stock: true } })
  if (!current) return res.status(404).json({ error: 'Product not found.' })
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { stock: Math.max(0, current.stock + delta) }
  })
  res.json(product)
})

// ── Admin: delete ──
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.delete({
      where: { id: req.params.id },
      select: { slug: true, mediaUrls: true }
    })
    if (product.mediaUrls.length > 0) await deleteMediaByUrls(product.mediaUrls, tokenOf(req))
    res.json({ ok: true, slug: product.slug })
  } catch {
    res.status(404).json({ error: 'Product not found.' })
  }
})

export default router
