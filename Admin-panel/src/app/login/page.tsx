import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Admin Sign In' }

export default function LoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite px-4 py-16">
      <LoginForm redirectTo={searchParams.redirect ?? '/'} />
    </div>
  )
}
