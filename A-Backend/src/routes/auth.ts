import { Router } from 'express'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { welcomeEmail, otpEmail } from '../lib/mailer'

const router = Router()

const OTP_EXP_MIN = Number(process.env.OTP_EXP_MIN ?? 5)
const emailSchema = z.string().trim().email()

// ── Welcome email after account creation ──
router.post('/welcome', async (req, res) => {
  const email = emailSchema.safeParse(req.body?.email)
  if (!email.success) return res.status(400).json({ error: 'Valid email required.' })
  const password = typeof req.body?.password === 'string' ? req.body.password : undefined
  void welcomeEmail(email.data, password)
  res.json({ ok: true })
})

// ── Send a 6-digit login code ──
router.post('/otp/send', async (req, res) => {
  const parsed = emailSchema.safeParse(req.body?.email)
  if (!parsed.success) return res.status(400).json({ error: 'Valid email required.' })
  const email = parsed.data.toLowerCase()

  // Light throttle: block a resend within 20s of the last code for this email.
  const recent = await prisma.emailOtp.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - 20_000) } }
  })
  if (recent) return res.status(429).json({ error: 'Please wait a few seconds before requesting another code.' })

  const code = String(crypto.randomInt(100000, 1000000)) // always 6 digits
  const expiresAt = new Date(Date.now() + OTP_EXP_MIN * 60_000)

  // Invalidate any earlier unconsumed codes, then store the new one.
  await prisma.emailOtp.updateMany({ where: { email, consumed: false }, data: { consumed: true } })
  await prisma.emailOtp.create({ data: { email, code, expiresAt } })

  void otpEmail(email, code, OTP_EXP_MIN)
  res.json({ ok: true, expiresInSec: OTP_EXP_MIN * 60 })
})

// ── Verify a 6-digit login code ──
router.post('/otp/verify', async (req, res) => {
  const parsed = emailSchema.safeParse(req.body?.email)
  const code = String(req.body?.code ?? '').trim()
  if (!parsed.success || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Enter the 6-digit code.' })
  }
  const email = parsed.data.toLowerCase()

  const otp = await prisma.emailOtp.findFirst({
    where: { email, consumed: false },
    orderBy: { createdAt: 'desc' }
  })
  if (!otp) return res.status(400).json({ error: 'No active code. Please resend a new code.' })
  if (otp.expiresAt < new Date()) return res.status(400).json({ error: 'Code expired. Please resend a new code.' })
  if (otp.attempts >= 5) return res.status(429).json({ error: 'Too many attempts. Please resend a new code.' })

  if (otp.code !== code) {
    await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
    return res.status(400).json({ error: 'Incorrect code. Please try again.' })
  }

  await prisma.emailOtp.update({ where: { id: otp.id }, data: { consumed: true } })
  res.json({ ok: true })
})

export default router
