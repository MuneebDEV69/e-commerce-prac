'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function AdminHeader({ email }: { email: string | null }) {
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="font-serif tracking-[0.2em] text-brand text-lg">
          ARAISH · ADMIN
        </Link>
        <div className="flex items-center gap-4">
          {email && <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[180px]">{email}</span>}
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
