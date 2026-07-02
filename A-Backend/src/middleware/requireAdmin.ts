import type { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '../lib/prisma'

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)

/**
 * Express middleware: only allow requests from an authenticated ADMIN.
 * The client sends the Supabase access token as `Authorization: Bearer <token>`.
 * We verify it with Supabase, then confirm the user's role in our DB.
 */
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Missing authorization token.' })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return res.status(401).json({ error: 'Invalid or expired session.' })

  const dbUser = await prisma.user.findUnique({ where: { id: data.user.id }, select: { role: true } })
  if (dbUser?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required.' })

  const r = req as Request & { userId?: string; accessToken?: string }
  r.userId = data.user.id
  r.accessToken = token // used for storage deletes (RLS runs as this admin)
  next()
}
