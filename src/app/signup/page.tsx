import SignupForm from '@/components/auth/SignupForm'

export const metadata = { title: 'Create Account — Muneeb Ki Araish' }

export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-offwhite px-4 py-16">
      <SignupForm />
    </div>
  )
}
