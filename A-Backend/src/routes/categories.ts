import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// Public: list all categories (used by the admin product form's dropdown)
router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true }
  })
  res.json(categories)
})

export default router
