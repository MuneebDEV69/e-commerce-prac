'use client'

import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { friendlyAuthError } from '@/utils/auth-errors'

export default function LoginForm({ redirectTo = '/' }: { redirectTo?: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(friendlyAuthError(error.message))
      setLoading(false)
      return
    }

    // Hard navigation so the server picks up the freshly-set auth cookie
    // immediately (avoids the "stuck on Signing in" soft-navigation race).
    window.location.assign(redirectTo)
  }

  return (
    <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm p-8 sm:p-10">
      <h1 className="text-center font-serif text-2xl tracking-[0.2em] text-brand uppercase">
        Admin Sign In
      </h1>
      <p className="text-center text-sm text-gray-500 mt-2 mb-8">Authorized staff only</p>

      {error && (
        <p className="mb-5 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2.5">{error}</p>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs tracking-wider text-gray-600 mb-1.5">EMAIL</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs tracking-wider text-gray-600 mb-1.5">PASSWORD</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2.5 pr-11 text-sm outline-none focus:border-brand"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white text-sm tracking-widest py-3 hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'SIGNING IN…' : 'SIGN IN'}
        </button>
      </form>
    </div>
  )
}
