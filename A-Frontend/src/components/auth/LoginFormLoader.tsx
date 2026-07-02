'use client'

import dynamic from 'next/dynamic'

/**
 * Lazy-loads the actual LoginForm (which pulls in @supabase/supabase-js) so the
 * login page shell paints instantly and the heavy auth JS streams in afterwards.
 * A lightweight skeleton fills the gap during hydration.
 */
const LoginForm = dynamic(() => import('./LoginForm'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm p-8 sm:p-10 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mx-auto" />
      <div className="h-3 w-32 bg-gray-200 rounded mx-auto mt-3 mb-8" />
      <div className="space-y-4">
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-10 w-full bg-gray-200 rounded" />
        <div className="h-11 w-full bg-gray-200 rounded" />
      </div>
    </div>
  )
})

export default function LoginFormLoader(props: {
  redirectTo?: string
  justRegistered?: boolean
  showLoginNotice?: boolean
}) {
  return <LoginForm {...props} />
}
