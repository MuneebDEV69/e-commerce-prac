import LoginFormLoader from '@/components/auth/LoginFormLoader'

export const metadata = { title: 'Sign In — Muneeb Ki Araish' }

export default function LoginPage({
  searchParams
}: {
  searchParams: { redirect?: string; registered?: string }
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-offwhite px-4 py-16">
      <LoginFormLoader
        redirectTo={searchParams.redirect ?? '/'}
        justRegistered={searchParams.registered === '1'}
        showLoginNotice={!!searchParams.redirect}
      />
    </div>
  )
}
