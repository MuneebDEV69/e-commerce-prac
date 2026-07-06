/** Convert Supabase's terse/security-generic auth errors into clear messages. */
export function friendlyAuthError(message: string): string {
  const raw = (message ?? '').trim()
  const m = raw.toLowerCase()
  if (m.includes('invalid login credentials')) {
    return 'Incorrect email or password. If you don’t have an account yet, please sign up.'
  }
  if (m.includes('email not confirmed')) {
    return 'This account needs email confirmation. Turn off “Confirm email” in Supabase → Authentication, then try again.'
  }
  if (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already') ||
    m.includes('already exists') ||
    m.includes('duplicate key') ||
    m.includes('users_email_key')
  ) {
    return 'An account with this email already exists. Please sign in instead.'
  }
  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters.'
  }
  // Supabase's built-in email is rate-limited (free tier); when it's exhausted or
  // misconfigured, signUp fails while "Confirm email" is on. Guide the fix.
  if (
    m.includes('error sending') ||
    m.includes('confirmation email') ||
    m.includes('rate limit') ||
    m.includes('over_email_send')
  ) {
    return 'Could not send the confirmation email (Supabase’s email limit was hit). Turn off “Confirm email” in Supabase → Authentication → Providers → Email, then try again.'
  }
  // Empty / unhelpful payloads (e.g. "{}") — never show raw braces to the user.
  // The most common cause of an unparseable signup error is an email that already
  // exists, so we point the user to sign in.
  if (!raw || raw === '{}' || raw === '[object Object]') {
    return 'Could not create the account — an account with this email may already exist, so try signing in. Otherwise please try again in a minute.'
  }
  return raw
}
