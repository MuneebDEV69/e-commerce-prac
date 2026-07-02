import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
const router = Router()

/**
 * Returns the current user's identity + role, verified from their Supabase token.
 * The frontend uses this to gate the /admin area (instead of querying the DB itself).
 */
router.get('/', async (req, res) => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing authorization token.' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session.' })

  const dbUser = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { role: true }
  })

  res.json({ id: data.user.id, email: data.user.email, role: dbUser?.role ?? 'CUSTOMER' })
})

export default router
