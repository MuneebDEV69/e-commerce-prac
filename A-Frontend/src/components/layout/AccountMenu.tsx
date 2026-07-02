'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

/**
 * Account control in the header.
 * - Logged out: a User icon linking to /login.
 * - Logged in: the user's name + a dropdown with their email and a Sign Out action.
 *
 * Auth state is read client-side (browser Supabase client) so anonymous visitors
 * never trigger a server-side auth round-trip just to render the header.
 */
export default function AccountMenu() {
  const [name, setName] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  useEffect(() => {
    const supabase = createClient()

    const apply = (user: { email?: string; user_metadata?: { name?: string } } | null) => {
      if (user) {
        setEmail(user.email ?? null)
        setName(user.user_metadata?.name?.trim() || user.email?.split('@')[0] || 'Account')
      } else {
        setEmail(null)
        setName(null)
      }
    }

    supabase.auth.getUser().then(({ data }) => apply(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => apply(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Logged out
  if (!name) {
    return (
      <Link href="/login" aria-label="Account" className="hover:text-brand transition-colors">
        <User size={20} strokeWidth={1.5} />
      </Link>
    )
  }

  // Logged in
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-brand hover:text-brand-dark transition-colors"
        aria-label="Account menu"
      >
        <User size={20} strokeWidth={1.5} />
        <span className="hidden sm:block text-sm max-w-[100px] truncate">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 shadow-lg z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400">Signed in as</p>
            <p className="text-sm text-gray-800 truncate">{email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-cream hover:text-brand transition-colors"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
