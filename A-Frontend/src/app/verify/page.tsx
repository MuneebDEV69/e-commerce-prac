'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, CheckCircle2, RotateCw } from 'lucide-react'

const EXPIRY_SEC = 300 // 5 minutes
const RESEND_COOLDOWN = 20

export default function VerifyPage() {
  const [email, setEmail] = useState('')
  const [redirect, setRedirect] = useState('/')
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SEC)
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [done, setDone] = useState(false)
  const started = useRef(false)

  // Read email + redirect from the URL (client-only, no Suspense needed).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const e = q.get('email') ?? ''
    if (!e) {
      window.location.assign('/login')
      return
    }
    setEmail(e)
    setRedirect(q.get('redirect') || '/')
    started.current = true
  }, [])

  // Expiry countdown.
  useEffect(() => {
    if (!started.current) return
    const id = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [started.current])

  // Resend cooldown countdown.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  async function verify() {
    setError(null)
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code.')
      return
    }
    setVerifying(true)
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Verification failed.')
        return
      }
      setDone(true)
      sessionStorage.setItem('araish-otp-ok', email)
      setTimeout(() => window.location.assign(redirect), 900)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    if (cooldown > 0) return
    setError(null)
    setInfo(null)
    const res = await fetch('/api/auth/otp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (res.ok) {
      setSecondsLeft(EXPIRY_SEC)
      setCooldown(RESEND_COOLDOWN)
      setInfo('A new code has been sent to your email.')
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d?.error ?? 'Could not resend the code.')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-offwhite px-4 py-16">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
        {done ? (
          <>
            <CheckCircle2 size={48} className="mx-auto text-green-600" />
            <h1 className="mt-4 text-xl tracking-wider text-gray-800">Verified!</h1>
            <p className="mt-2 text-sm text-gray-500">Signing you in…</p>
          </>
        ) : (
          <>
            <ShieldCheck size={40} className="mx-auto text-brand" />
            <h1 className="mt-4 font-serif text-2xl tracking-[0.15em] text-brand uppercase">Verify it&apos;s you</h1>
            <p className="mt-2 text-sm text-gray-500">
              We sent a 6-digit code to <span className="text-gray-800 font-medium">{email}</span>.
            </p>

            {error && <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2.5">{error}</p>}
            {info && !error && <p className="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-2.5">{info}</p>}

            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              inputMode="numeric"
              autoFocus
              placeholder="••••••"
              className="mt-6 w-full text-center text-3xl tracking-[0.5em] font-medium border border-gray-300 rounded py-3 outline-none focus:border-brand"
            />

            <p className="mt-3 text-xs text-gray-400">
              {secondsLeft > 0 ? <>Code expires in <span className="tabular-nums text-gray-600">{mmss}</span></> : 'Code expired — please resend.'}
            </p>

            <button
              onClick={verify}
              disabled={verifying || done}
              className="mt-5 w-full bg-brand text-white text-sm tracking-widest py-3 hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {verifying ? 'VERIFYING…' : 'VERIFY & SIGN IN'}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <button
                onClick={resend}
                disabled={cooldown > 0}
                className="inline-flex items-center gap-1.5 text-brand hover:text-brand-dark disabled:text-gray-400"
              >
                <RotateCw size={14} /> Resend code{cooldown > 0 ? ` (${cooldown}s)` : ''}
              </button>
              <Link href="/login" className="text-gray-500 hover:text-brand underline">
                Change email
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
