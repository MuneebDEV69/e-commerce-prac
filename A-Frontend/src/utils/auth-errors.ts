/** Convert Supabase's terse/security-generic auth errors into clear messages. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you don’t have an account yet, please sign up.'
  }
  if (m.includes('email not confirmed')) {
    return 'This account needs email confirmation. Turn off “Confirm email” in Supabase → Authentication, then try again.'
  }
  if (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already')
  ) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  return message
}
